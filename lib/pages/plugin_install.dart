// Install plugin (Sketch final "v31 / 设置 · 插件 · 安装 1 / 2").
//
// Step one: paste a link (GitHub repo, Release, plugin.json, .zip) or pick a local folder;
// step two lists the origin, requested permissions and provided capabilities; it's only installed into the plugin directory after the user clicks "Install".
// Updating a plugin starts directly at step two.

import 'package:file_selector/file_selector.dart';
import 'package:flutter/widgets.dart';

import '../l10n/l10n.dart';
import '../plugin/installer.dart';
import '../plugin/manifest.dart';
import '../music/source.dart';
import '../state.dart';
import '../theme.dart';
import '../ui.dart';
import 'common.dart';
import 'plugin_ui.dart';

/// Opens the install dialog. With [link], reads it right away (plugin update).
void showInstallPlugin(BuildContext context, {String? link}) {
  showPluginDialog(
    context,
    builder: (close) => _InstallFlow(link: link, onClose: close),
  );
}

class _InstallFlow extends StatefulWidget {
  const _InstallFlow({required this.onClose, this.link});
  final VoidCallback onClose;
  final String? link;

  @override
  State<_InstallFlow> createState() => _InstallFlowState();
}

class _InstallFlowState extends State<_InstallFlow> {
  late final _url = TextEditingController(text: widget.link ?? '');
  final _focus = FocusNode();
  PluginPackage? _pkg;
  String? _error;
  var _busy = false, _installing = false, _installed = false;
  var _gen = 0; // late results are dropped if closed midway or the link changed

  @override
  void initState() {
    super.initState();
    _url.addListener(() => setState(() {}));
    if (widget.link != null) _fetch();
  }

  @override
  void dispose() {
    _gen++;
    if (!_installed) _pkg?.discard();
    _url.dispose();
    _focus.dispose();
    super.dispose();
  }

  Future<void> _load(Future<PluginPackage> Function() get) async {
    final gen = ++_gen;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final pkg = await get();
      if (gen != _gen || !mounted) {
        await pkg.discard();
        return;
      }
      setState(() {
        _pkg = pkg;
        _busy = false;
      });
    } on InstallError catch (e) {
      if (gen != _gen || !mounted) return;
      setState(() {
        _error = e.message;
        _busy = false;
      });
    }
  }

  void _fetch() {
    final link = _url.text.trim();
    if (link.isEmpty || _busy) return;
    final app = context.appRead;
    _load(() => app.fetchPluginPackage(link));
  }

  Future<void> _pickFolder() async {
    final app = context.appRead;
    final dir = await getDirectoryPath(
      confirmButtonText: context.l10n.actionSelect,
    );
    if (dir == null || !mounted) return;
    _load(() => app.fetchPluginFolder(dir));
  }

  Future<void> _back() async {
    await _pkg?.discard();
    setState(() => _pkg = null);
  }

  Future<void> _install() async {
    final pkg = _pkg;
    if (pkg == null || _installing) return;
    final app = context.appRead;
    final update = _installedVersion(app, pkg.manifest) != null;
    final name = pluginTr(pkg.dir, pkg.manifest.info.name);
    setState(() => _installing = true);
    try {
      await app.installPluginPackage(pkg);
      _installed = true;
      showToast(
        update ? L.pluginUpdatedToast(name) : L.pluginInstalledToast(name),
      );
      widget.onClose();
    } catch (e) {
      showToast(L.pluginInstallFailed('$e'));
      if (mounted) setState(() => _installing = false);
    }
  }

  static String? _installedVersion(AppState app, PluginManifest mf) {
    for (final s in app.plugins) {
      if (s.id == mf.id) return s.info.version;
    }
    for (final d in app.disabledPlugins.values) {
      if (d.id == mf.id) return d.info.version;
    }
    return null;
  }

  @override
  Widget build(BuildContext context) => AnimatedSwitcher(
    duration: const Duration(milliseconds: 160),
    transitionBuilder: fadeOnly,
    child: _pkg == null
        ? SizedBox(key: const ValueKey('link'), width: 400, child: _linkStep())
        : SizedBox(
            key: const ValueKey('review'),
            width: 560,
            child: _review(_pkg!),
          ),
  );

  // ───── Step one: link ─────

  Widget _linkStep() {
    final l = context.l10n;
    final has = _url.text.trim().isNotEmpty;
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Center(
            child: Container(
              width: 64,
              height: 64,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: P.dark ? wa(0.08) : ba(0.05),
              ),
              child: _busy ? const Spinner(size: 24) : Ico('link', size: 24),
            ),
          ),
          const SizedBox(height: 20),
          Text(
            l.pluginInstallTitle,
            textAlign: TextAlign.center,
            style: ts(20, w: w700),
          ),
          const SizedBox(height: 10),
          Text(
            l.pluginInstallPrompt,
            textAlign: TextAlign.center,
            style: ts(14, w: w500, c: P.dark ? wa(0.6) : P.muted, h: 22 / 14),
          ),
          const SizedBox(height: 24),
          FieldShell(
            focus: _focus,
            height: 48,
            child: Row(
              children: [
                Expanded(
                  child: InputBox(
                    controller: _url,
                    focusNode: _focus,
                    autofocus: widget.link == null,
                    placeholder: l.pluginInstallPlaceholder,
                    size: 15,
                    onSubmitted: (_) => _fetch(),
                  ),
                ),
                if (has) ...[
                  const SizedBox(width: 8),
                  Tap(
                    tip: l.actionClear,
                    onTap: () => setState(() {
                      _url.clear();
                      _error = null;
                    }),
                    builder: (_, h, _) =>
                        Ico('close', size: 16, color: h ? P.ink : P.muted),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 10),
          Text(
            _error ?? l.pluginInstallSupportHint,
            style: ts(
              12,
              w: w500,
              c: _error != null ? errorColor : (P.dark ? wa(0.4) : P.faint),
              h: 18 / 12,
            ),
          ),
          const SizedBox(height: 28),
          Row(
            children: [
              Expanded(
                child: Btn(
                  label: l.actionCancel,
                  size: BtnSize.l,
                  expand: true,
                  onTap: widget.onClose,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Btn(
                  label: _busy ? l.pluginReading : l.pluginNextStep,
                  size: BtnSize.l,
                  kind: BtnKind.primary,
                  expand: true,
                  enabled: has && !_busy,
                  onTap: _fetch,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Center(
            child: Tap(
              onTap: _busy ? null : _pickFolder,
              builder: (_, h, _) => tx(
                l.pluginInstallFromLocal,
                13,
                w: w500,
                c: h ? P.ink : P.muted,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ───── Step two: permissions and capabilities ─────

  Widget _review(PluginPackage pkg) {
    final app = context.app;
    final l = context.l10n;
    final mf = pkg.manifest;
    final installed = _installedVersion(app, mf);
    final blocked = pkg.blocked;
    final caps = capabilityLabels(pkg.ops, l);
    final nav = navTitles(mf, dir: pkg.dir);
    final release = pkg.release.isNotEmpty
        ? 'Release ${pkg.release}'
              '${pkg.published == null ? '' : l.pluginPublishedAgo(_ago(pkg.published!, l))}'
        : pkg.origin.isEmpty
        ? l.pluginLocalFolder
        : pkg.source.startsWith('github.com/')
        ? l.pluginLatestCode
        : '';
    final hs = mf.network;
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(32, 32, 32, 0),
          child: PluginDialogHeader(
            manifest: mf,
            dir: pkg.dir,
            onClose: widget.onClose,
            badges: [
              if (installed != null)
                UiBadge(
                  l.pluginInstalledVersion(versionLabel(installed)).trim(),
                ),
            ],
          ),
        ),
        Flexible(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(32, 20, 32, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Container(
                  height: 44,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: squircle(22, color: P.dark ? wa(0.08) : ba(0.05)),
                  child: Row(
                    children: [
                      Ico(
                        pkg.origin.isEmpty ? 'folder' : 'link',
                        size: 16,
                        color: P.muted,
                      ),
                      const SizedBox(width: 8),
                      Expanded(child: tx(pkg.source, 13, w: w500)),
                      if (release.isNotEmpty) ...[
                        const SizedBox(width: 12),
                        tx(release, 13, w: w500, c: P.faint),
                      ],
                    ],
                  ),
                ),
                if (mf.description.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  Text(
                    pluginTr(pkg.dir, mf.description),
                    style: ts(13, w: w500, c: P.muted, h: 20 / 13),
                  ),
                ],
                if (blocked != null) ...[
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Ico('warning', size: 16, color: errorColor),
                      const SizedBox(width: 8),
                      Expanded(
                        child: tx(
                          blocked,
                          13,
                          w: w500,
                          c: errorColor,
                          lines: 2,
                        ),
                      ),
                    ],
                  ),
                ],
                const SizedBox(height: 28),
                sectionLabel(l.pluginPermissionsNeeded),
                const SizedBox(height: 14),
                if (hs.isEmpty)
                  PermRow(
                    icon: 'globe',
                    title: l.pluginPermNoNetwork,
                    detail: l.pluginPermNoNetworkDetail,
                  )
                else if (hs.contains('*'))
                  PermRow(
                    icon: 'globe',
                    title: l.pluginPermAnyWebsite,
                    detail: l.pluginPermAnyWebsiteDetail,
                    iconColor: warnColor,
                  )
                else
                  PermRow(
                    icon: 'globe',
                    title: l.pluginPermNetwork,
                    detail: hostsText(mf, l10n: l),
                  ),
                if (pkg.ops.contains(Op.signIn)) ...[
                  const SizedBox(height: 18),
                  PermRow(
                    icon: 'sign-in',
                    title: l.pluginSignInAccount,
                    detail: l.pluginPermSignInDetail,
                  ),
                ],
                if (mf.process.isNotEmpty) ...[
                  const SizedBox(height: 18),
                  PermRow(
                    icon: 'terminal',
                    title: l.pluginPermProcess,
                    badge: l.pluginPermProcessBadge,
                    iconColor: warnColor,
                    detail: l.pluginPermProcessDetail(
                      programsText(mf.process, l),
                    ),
                  ),
                ],
                const SizedBox(height: 18),
                PermRow(
                  icon: 'database',
                  title: l.pluginPermStorage,
                  detail: l.pluginPermStorageDetail,
                ),
                const SizedBox(height: 28),
                sectionLabel(l.pluginCapabilitiesProvided),
                const SizedBox(height: 14),
                if (caps.isEmpty && nav.isEmpty)
                  tx(l.stateNone, 13, w: w500, c: P.faint)
                else
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      for (final c in caps) InfoChip(c),
                      for (final n in nav) InfoChip(n, icon: 'sidebar'),
                    ],
                  ),
                if (nav.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  tx(
                    l.pluginNavIconHint,
                    12,
                    w: w500,
                    c: P.dark ? wa(0.4) : P.faint,
                  ),
                ],
                const SizedBox(height: 28),
                tx(
                  l.pluginTrustHint,
                  12,
                  w: w500,
                  c: P.dark ? wa(0.4) : P.faint,
                ),
              ],
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(32, 16, 32, 32),
          child: Row(
            children: [
              Expanded(
                child: Btn(
                  label: widget.link == null ? l.actionBack : l.actionCancel,
                  size: BtnSize.l,
                  expand: true,
                  onTap: widget.link == null ? _back : widget.onClose,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Btn(
                  label: _installing
                      ? l.pluginInstalling
                      : (installed != null ? l.actionUpdate : l.actionInstall),
                  size: BtnSize.l,
                  kind: BtnKind.primary,
                  expand: true,
                  enabled: blocked == null && !_installing,
                  onTap: _install,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  static String _ago(DateTime t, AppLocalizations l) {
    final d = DateTime.now().difference(t).inDays;
    if (d <= 0) return l.timeToday;
    if (d < 30) return l.timeDaysAgo(d);
    if (d < 365) return l.timeMonthsAgo(d ~/ 30);
    return l.timeYearsAgo(d ~/ 365);
  }
}
