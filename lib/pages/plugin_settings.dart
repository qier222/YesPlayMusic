// Plugin settings dialog (Sketch final "v31 / 设置 · 插件 · 设置弹窗"):
// account, items declared in settings in plugin.json, permissions, uninstall at the bottom left.
//
// Setting types are text, password, boolean, select; values are all strings, booleans stored as
// "true"/"". Disabled plugins aren't running, so settings are written straight into their settings.json.

import 'dart:convert';
import 'dart:io';

import 'package:flutter/widgets.dart';
import 'package:path/path.dart' as p;

import '../l10n/l10n.dart';
import '../music/models.dart' as m;
import '../music/source.dart';
import '../plugin/installer.dart' show exportsOf;
import '../plugin/manifest.dart';
import '../plugin/plugin_source.dart';
import '../state.dart';
import '../system.dart';
import '../theme.dart';
import '../ui.dart';
import 'common.dart';
import 'plugin_ui.dart';

/// Opens plugin settings. [running] is the running plugin; pass null for disabled plugins.
void showPluginSettings(
  BuildContext context,
  PluginManifest manifest,
  String dir, {
  PluginSource? running,
}) {
  showPluginDialog(
    context,
    width: 560,
    builder: (close) => _PluginSettings(
      manifest: manifest,
      dir: dir,
      running: running,
      onClose: close,
    ),
  );
}

class _PluginSettings extends StatefulWidget {
  const _PluginSettings({
    required this.manifest,
    required this.dir,
    required this.running,
    required this.onClose,
  });
  final PluginManifest manifest;
  final String dir;
  final PluginSource? running;
  final VoidCallback onClose;

  @override
  State<_PluginSettings> createState() => _PluginSettingsState();
}

class _PluginSettingsState extends State<_PluginSettings> {
  PluginManifest get _mf => widget.manifest;
  String get _dataFile =>
      p.join(AppState.supportDir(), 'plugin-data', _mf.id, 'settings.json');

  late final List<m.Setting> _items = _mf.info.settings
      .where((s) => s.key.isNotEmpty)
      .toList();
  late final Map<String, String> _saved = _readSaved();
  late final Map<String, String> _values = {
    for (final s in _items) s.key: _saved[s.key] ?? s.defaultValue,
  };
  late final Map<String, TextEditingController> _text = {
    for (final s in _items)
      if (_isText(s)) s.key: TextEditingController(text: _values[s.key]),
  };
  late final Map<String, FocusNode> _focus = {
    for (final s in _items)
      if (_isText(s)) s.key: FocusNode(),
  };
  final Set<String> _shown = {}; // password fields shown in plain text
  // Disabled plugins aren't running; see what they provide from the exports in the source
  late final Set<String> _ops =
      widget.running?.ops ?? exportsOf(widget.dir, _mf.main);
  late bool _programs = context.appRead.allowPrograms.contains(_mf.id);
  late final bool _updatable = context.appRead.canCheckPluginUpdate(_mf.id);
  late bool _autoUpdate = context.appRead.autoUpdatePlugins.contains(_mf.id);
  var _saving = false;

  static bool _isText(m.Setting s) =>
      s.type != 'boolean' && !(s.type == 'select' && s.options.isNotEmpty);

  Map<String, String> _readSaved() {
    final r = widget.running;
    if (r != null) return {for (final s in _items) s.key: r.setting(s.key)};
    try {
      final j = jsonDecode(File(_dataFile).readAsStringSync());
      if (j is Map) {
        return {for (final e in j.entries) '${e.key}': '${e.value}'};
      }
    } catch (_) {}
    return {};
  }

  @override
  void dispose() {
    for (final c in _text.values) {
      c.dispose();
    }
    for (final f in _focus.values) {
      f.dispose();
    }
    super.dispose();
  }

  Future<void> _save() async {
    if (_saving) return;
    setState(() => _saving = true);
    final app = context.appRead;
    final values = {
      ..._values,
      for (final e in _text.entries) e.key: e.value.text.trim(),
    };
    try {
      final r = widget.running;
      if (r != null) {
        await app.setPluginSettings(r, values);
      } else if (values.entries.any((e) => _saved[e.key] != e.value)) {
        final f = File(_dataFile);
        await f.parent.create(recursive: true);
        await f.writeAsString(jsonEncode({..._saved, ...values}));
      }
      if (_programs != app.allowPrograms.contains(_mf.id)) {
        await app.setAllowPrograms(_mf.id, _programs);
      }
      if (_autoUpdate != app.autoUpdatePlugins.contains(_mf.id)) {
        app.setAutoUpdatePlugin(_mf.id, _autoUpdate);
      }
      showToast(L.stateSaved);
      widget.onClose();
    } catch (e) {
      showToast(L.stateSaveFailed('$e'));
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _uninstall() async {
    final app = context.appRead;
    final l = context.l10n;
    // This context is gone once the dialog closes, so the confirmation hangs on the root Overlay
    final root = Overlay.of(context, rootOverlay: true).context;
    widget.onClose();
    final name = pluginTr(widget.dir, _mf.info.name);
    final ok = await confirmAction(
      root,
      icon: 'trash',
      title: l.pluginUninstallTitle(name),
      message: l.pluginUninstallMessage,
      action: l.actionUninstall,
      danger: true,
    );
    if (!ok) return;
    await app.uninstallPlugin(_mf.id, widget.dir);
    showToast(L.pluginUninstalled(name));
  }

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final l = context.l10n;
    final r = widget.running;
    final isCurrent = app.sourceId == _mf.id;
    final hasForm = _items.isNotEmpty || _mf.process.isNotEmpty || _updatable;
    final caps = capabilityLabels(_ops, l);
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(32, 32, 32, 0),
          child: PluginDialogHeader(
            manifest: _mf,
            dir: widget.dir,
            onClose: widget.onClose,
            badges: [if (isCurrent) UiBadge(l.sourceInUse, accented: true)],
          ),
        ),
        Flexible(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(32, 28, 32, 28),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (r != null && r.can(Op.signIn)) ...[
                  sectionLabel(l.pluginSectionAccount),
                  const SizedBox(height: 10),
                  _account(app, r),
                  const SizedBox(height: 28),
                ],
                if (_items.isNotEmpty) ...[
                  sectionLabel(l.pluginSettingsTitle),
                  for (final s in _items) ...[
                    const SizedBox(height: 16),
                    _item(s),
                  ],
                  const SizedBox(height: 28),
                ],
                if (caps.isNotEmpty ||
                    navTitles(_mf, dir: widget.dir).isNotEmpty) ...[
                  sectionLabel(l.pluginSectionCapabilities),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      for (final c in caps) InfoChip(c),
                      for (final n in navTitles(_mf, dir: widget.dir))
                        InfoChip(n, icon: 'sidebar'),
                    ],
                  ),
                  const SizedBox(height: 28),
                ],
                sectionLabel(l.pluginSectionPermissions),
                const SizedBox(height: 12),
                PermRow(
                  icon: 'globe',
                  title: l.pluginPermNetwork,
                  detail: hostsText(_mf, l10n: l),
                ),
                if (_mf.process.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  PermRow(
                    icon: 'terminal',
                    title: l.pluginPermProcess,
                    detail: programsText(_mf.process, l),
                    trailing: Toggle(
                      value: _programs,
                      onChanged: (v) => setState(() => _programs = v),
                    ),
                  ),
                ],
                const SizedBox(height: 28),
                sectionLabel(l.pluginSectionUpdates),
                const SizedBox(height: 12),
                PermRow(
                  icon: 'download',
                  title: l.pluginAutoUpdate,
                  detail: _updatable
                      ? l.pluginAutoUpdateDetail
                      : l.pluginAutoUpdateUnsupported,
                  trailing: Toggle(
                    value: _updatable && _autoUpdate,
                    onChanged: _updatable
                        ? (v) => setState(() => _autoUpdate = v)
                        : null,
                  ),
                ),
                if (r == null) ...[
                  const SizedBox(height: 20),
                  tx(l.pluginDisabledHint, 12, w: w500, c: P.faint),
                ],
              ],
            ),
          ),
        ),
        Container(height: 1, color: P.dark ? wa(0.06) : P.line),
        Padding(
          padding: const EdgeInsets.fromLTRB(14, 24, 32, 32),
          child: Row(
            children: [
              DangerTextBtn(
                label: l.pluginUninstallBtn,
                icon: 'trash',
                onTap: _uninstall,
              ),
              const Spacer(),
              if (hasForm) ...[
                SizedBox(
                  width: 96,
                  child: Btn(
                    label: l.actionCancel,
                    size: BtnSize.l,
                    expand: true,
                    onTap: widget.onClose,
                  ),
                ),
                const SizedBox(width: 8),
                SizedBox(
                  width: 96,
                  child: Btn(
                    label: _saving ? l.actionSaving : l.actionSave,
                    size: BtnSize.l,
                    kind: BtnKind.primary,
                    expand: true,
                    enabled: !_saving,
                    onTap: _save,
                  ),
                ),
              ] else
                SizedBox(
                  width: 96,
                  child: Btn(
                    label: l.actionDone,
                    size: BtnSize.l,
                    kind: BtnKind.primary,
                    expand: true,
                    onTap: widget.onClose,
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _account(AppState app, PluginSource s) {
    final account = app.accounts[s.id];
    final signingIn = app.signingIn.contains(s.id);
    return Container(
      height: 64,
      padding: const EdgeInsets.symmetric(horizontal: 14),
      decoration: squircle(20, color: P.dark ? wa(0.08) : ba(0.05)),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: P.dark ? wa(0.12) : ba(0.08),
            ),
            child: Ico('user', size: 16),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                tx(account?.name ?? context.l10n.stateNotSignedIn, 14, w: w600),
                const SizedBox(height: 2),
                tx(
                  account == null
                      ? context.l10n.pluginSignInSyncHint
                      : context.l10n.stateSignedIn,
                  12,
                  w: w500,
                  c: P.faint,
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          if (signingIn)
            tx(context.l10n.stateSigningInShort, 12, w: w600, c: P.faint)
          else
            Btn(
              label: account == null
                  ? context.l10n.actionSignIn
                  : context.l10n.actionSignOut,
              size: BtnSize.s,
              onTap: () {
                if (account == null) {
                  widget.onClose();
                  app.signIn(s);
                } else {
                  confirmSignOut(context, s);
                }
              },
            ),
        ],
      ),
    );
  }

  Widget _item(m.Setting s) {
    final label = s.label.isEmpty ? s.key : pluginTr(widget.dir, s.label);
    final help = s.help.isEmpty
        ? null
        : tx(
            pluginTr(widget.dir, s.help),
            12,
            w: w500,
            c: P.faint,
            lines: 3,
            h: 1.5,
          );
    if (s.type == 'boolean') {
      return Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                tx(label, 14, w: w500),
                if (help != null) ...[const SizedBox(height: 2), help],
              ],
            ),
          ),
          const SizedBox(width: 16),
          Toggle(
            value: _values[s.key] == 'true',
            onChanged: (v) => setState(() => _values[s.key] = v ? 'true' : ''),
          ),
        ],
      );
    }
    if (!_isText(s)) {
      final cur = s.options.where((o) => o.value == _values[s.key]).firstOrNull;
      return Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                tx(label, 14, w: w500),
                if (help != null) ...[const SizedBox(height: 2), help],
              ],
            ),
          ),
          const SizedBox(width: 16),
          Builder(
            builder: (ctx) => Tap(
              onTap: () => menuBelow(
                ctx,
                MenuSpec(
                  groups: [
                    [
                      for (final o in s.options)
                        MenuItem(
                          '',
                          o.label.isEmpty
                              ? o.value
                              : pluginTr(widget.dir, o.label),
                          checked: o.value == _values[s.key],
                          onTap: () => setState(() => _values[s.key] = o.value),
                        ),
                    ],
                  ],
                ),
              ),
              builder: (_, h, _) => AnimatedContainer(
                duration: fast,
                width: 160,
                height: 40,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: squircle(
                  20,
                  color: P.dark
                      ? (h ? wa(0.12) : wa(0.08))
                      : (h ? ba(0.10) : ba(0.06)),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: tx(
                        cur == null
                            ? context.l10n.statePleaseSelect
                            : (cur.label.isEmpty
                                  ? cur.value
                                  : pluginTr(widget.dir, cur.label)),
                        14,
                        w: w500,
                        c: cur == null ? P.faint : P.ink,
                      ),
                    ),
                    Ico('chevron-down', size: 16, color: P.muted),
                  ],
                ),
              ),
            ),
          ),
        ],
      );
    }
    final secret = s.type == 'password';
    final shown = _shown.contains(s.key);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: tx(label, 13, w: w500, c: P.muted),
            ),
            if (s.link.isNotEmpty)
              Tap(
                onTap: () => openExternal(s.link),
                builder: (_, h, _) => tx(
                  context.l10n.pluginGetIt,
                  13,
                  w: w600,
                  c: h ? P.ink : accent,
                ),
              ),
          ],
        ),
        const SizedBox(height: 8),
        FieldShell(
          focus: _focus[s.key]!,
          child: Row(
            children: [
              Expanded(
                child: EditableText(
                  controller: _text[s.key]!,
                  focusNode: _focus[s.key]!,
                  obscureText: secret && !shown,
                  autocorrect: false,
                  enableSuggestions: false,
                  style: ts(14, w: w500, c: P.ink),
                  cursorColor: accent,
                  backgroundCursorColor: P.muted,
                  selectionColor: accent.withValues(alpha: 0.35),
                  cursorWidth: 2,
                  cursorRadius: const Radius.circular(1),
                  onSubmitted: (_) => _save(),
                ),
              ),
              if (secret) ...[
                const SizedBox(width: 8),
                Tap(
                  tip: shown
                      ? context.l10n.actionHide
                      : context.l10n.actionShow,
                  onTap: () => setState(
                    () => shown ? _shown.remove(s.key) : _shown.add(s.key),
                  ),
                  builder: (_, h, _) => Ico(
                    shown ? 'eye-off' : 'eye',
                    size: 16,
                    color: h ? P.ink : P.muted,
                  ),
                ),
              ],
            ],
          ),
        ),
        if (help != null) ...[const SizedBox(height: 6), help],
      ],
    );
  }
}
