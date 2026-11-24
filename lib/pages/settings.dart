import 'dart:io';

import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:file_selector/file_selector.dart';
import 'package:path/path.dart' as p;

import '../analytics.dart';
import '../cache/image_cache.dart';
import '../l10n/l10n.dart';
import '../log.dart';
import '../mcp/config.dart';
import '../music/source.dart';
import '../plugin/installer.dart';
import '../plugin/manifest.dart';
import '../plugin/plugin_source.dart';
import '../shortcuts.dart';
import '../state.dart';
import '../system.dart';
import '../updater.dart';
import '../version.dart';
import '../theme.dart';
import '../ui.dart';
import 'common.dart';
import 'plugin_install.dart';
import 'plugin_settings.dart';
import 'plugin_ui.dart';

// Changing the theme rebuilds the whole tree, so the selected category lives outside
int _nav = 0;

/// Opens the "Plugins" category of Settings (used by "Add music source" in the empty library).
void openPluginSettings(AppState app) {
  _nav = 2;
  app.go('/settings');
}

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  final _scroll = ScrollController();

  void _selectNav(int i) {
    if (_nav == i) return;
    setState(() => _nav = i);
    if (_scroll.hasClients) _scroll.jumpTo(0);
  }

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final l = context.l10n;
    final nav = [
      ('gear', l.settingsGeneral),
      ('keyboard', l.settingsShortcuts),
      ('plugin', l.settingsPlugins),
      ('mcp', 'MCP'),
      ('info', l.settingsAbout),
    ];
    final currentNav = _nav.clamp(0, nav.length - 1);
    return Stack(
      children: [
        Positioned(left: 40, top: 20, child: BackBtn(onTap: app.back)),
        Positioned(
          left: 38,
          top: 72,
          // Line height fixed to Archivo: CJK fallback fonts like PingFang have different line heights, so titles would jump when switching languages
          child: CjkText(
            l.navSettings,
            maxLines: 1,
            softWrap: false,
            style: ts(44, w: w800, f: F.wide),
            strutStyle: const StrutStyle(
              fontFamily: 'ArchivoWide',
              fontSize: 44,
              forceStrutHeight: true,
            ),
          ),
        ),
        Positioned(
          left: 40,
          top: 148,
          width: 200,
          child: Column(
            children: [
              for (final (i, it) in nav.indexed)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Tap(
                    onTap: () => _selectNav(i),
                    builder: (_, h, _) {
                      final sel = currentNav == i;
                      final fg = sel || h ? P.ink : P.muted;
                      return AnimatedContainer(
                        duration: fast,
                        height: 40,
                        padding: const EdgeInsets.symmetric(horizontal: 14),
                        decoration: squircle(
                          20,
                          color: sel
                              ? P.raised
                              : (h
                                    ? P.surface
                                    : P.surface.withValues(alpha: 0)),
                        ),
                        child: Row(
                          children: [
                            SizedBox(
                              width: 20,
                              height: 20,
                              child: Center(
                                child: Ico(it.$1, size: 20, color: fg),
                              ),
                            ),
                            const SizedBox(width: 10),
                            // Long labels (e.g. Russian) ellipsize instead of overflowing
                            Flexible(
                              child: tx(it.$2, 15, w: w500, f: F.semi, c: fg),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
            ],
          ),
        ),
        Positioned(
          left: 280,
          right: 0,
          top: 140,
          bottom: 0,
          child: SingleChildScrollView(
            controller: _scroll,
            padding: const EdgeInsets.fromLTRB(0, 8, 40, 140),
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 200),
              transitionBuilder: fadeOnly,
              layoutBuilder: (cur, prev) => Stack(
                alignment: Alignment.topLeft,
                children: [...prev, ?cur],
              ),
              child: switch (currentNav) {
                0 => const _GeneralTab(key: ValueKey('general')),
                1 => const _ShortcutsTab(key: ValueKey('shortcuts')),
                2 => const _PluginsTab(key: ValueKey('plugins')),
                3 => const _McpTab(key: ValueKey('mcp')),
                _ => const _AboutTab(key: ValueKey('about')),
              },
            ),
          ),
        ),
      ],
    );
  }
}

class _GeneralTab extends StatelessWidget {
  const _GeneralTab({super.key});

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 512,
          child: Column(
            children: [
              _Section(title: l.settingsAppearance, child: const _Appearance()),
              const SizedBox(height: 28),
              _Section(title: l.settingsLyrics, child: const _LyricsCard()),
            ],
          ),
        ),
        const SizedBox(width: 24),
        SizedBox(
          width: 512,
          child: Column(
            children: [
              _Section(title: l.settingsPlayback, child: const _Playback()),
              const SizedBox(height: 28),
              _Section(title: l.settingsStorage, child: const _Storage()),
            ],
          ),
        ),
      ],
    );
  }
}

/// Shortcut reference (final v30a / 设置 · 快捷键（列表）): playback on the left, UI and media keys on the right.
class _ShortcutsTab extends StatelessWidget {
  const _ShortcutsTab({super.key});

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    Widget list(ShortcutGroup group) {
      final items = appShortcuts.where((s) => s.group == group).toList();
      return Column(
        children: [
          for (final (i, s) in items.indexed) ...[
            if (i > 0) _rule(),
            _row(48, s.label(l), _Keys(keysFor(s, l))),
          ],
        ],
      );
    }

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 512,
          child: _Section(
            title: l.shortcutGroupPlayback,
            child: list(ShortcutGroup.playback),
          ),
        ),
        const SizedBox(width: 24),
        SizedBox(
          width: 512,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _Section(title: l.shortcutGroupUi, child: list(ShortcutGroup.ui)),
              const SizedBox(height: 28),
              _Section(
                title: l.shortcutGroupMediaKeys,
                child: _row(
                  72,
                  l.shortcutMediaKeysLabel,
                  const _Keys(['previous', 'play', 'next'], icons: true),
                ),
              ),
              const SizedBox(height: 16),
              tx(
                Platform.isMacOS
                    ? l.shortcutTypingHintMac
                    : l.shortcutTypingHintOther,
                13,
                w: w500,
                c: P.faint,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

/// A group of keycaps; `null` is the "to" in the middle. When [icons] is true each keycap draws an icon.
class _Keys extends StatelessWidget {
  const _Keys(this.keys, {this.icons = false});
  final List<String?> keys;
  final bool icons;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (final (i, k) in keys.indexed) ...[
          if (i > 0) const SizedBox(width: 6),
          if (k == null)
            tx(context.l10n.shortcutKeyRangeTo, 13, w: w600, c: P.faint)
          else
            Container(
              height: 26,
              // Single characters and icons are square; "Space", "Esc" and the like widen to fit their text
              width: icons || k.characters.length == 1 ? 26 : null,
              padding: icons || k.characters.length == 1
                  ? EdgeInsets.zero
                  : const EdgeInsets.symmetric(horizontal: 8),
              alignment: Alignment.center,
              decoration: squircle(
                7,
                color: P.dark ? const Color(0xFF27272A) : P.raised,
                side: BorderSide(color: P.dark ? wa(0.08) : ba(0.06)),
              ),
              child: icons
                  ? Ico(k, size: 16, color: P.ink)
                  : tx(k, 13, w: w700, c: P.ink),
            ),
        ],
      ],
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.child});
  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return FadeIn(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          tx(title, 20, w: w700, f: F.semi),
          const SizedBox(height: 10),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 24),
            decoration: squircle(24, color: P.surface),
            child: child,
          ),
        ],
      ),
    );
  }
}

Widget _rule() => Container(height: 1, color: P.line);

Widget _row(double h, String label, Widget right, {String hint = ''}) =>
    SizedBox(
      height: h,
      child: Row(
        children: [
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                tx(label, 15, w: w700),
                if (hint.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  tx(hint, 12, w: w500, c: P.faint),
                ],
              ],
            ),
          ),
          right,
        ],
      ),
    );

class _Appearance extends StatelessWidget {
  const _Appearance();

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final l = context.l10n;
    final swatchNames = swatchNamesOf(l);
    final currentLang = AppLanguage.byCode(app.lang);
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.only(top: 10, bottom: 10),
          child: _row(
            52,
            l.settingsAccentColor,
            Row(
              children: [
                for (final (i, col)
                    in (app.isDark ? swatchesDark : swatchesLight).indexed) ...[
                  if (i > 0) const SizedBox(width: 6),
                  Tap(
                    tip: swatchNames[i],
                    onTap: () => app.update(() => app.swatch = i),
                    builder: (_, h, _) => AnimatedContainer(
                      duration: const Duration(milliseconds: 150),
                      width: 32,
                      height: 32,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          width: 2,
                          color: app.swatch == i
                              ? P.ink
                              : P.ink.withValues(alpha: 0),
                        ),
                      ),
                      child: AnimatedScale(
                        scale: h && app.swatch != i ? 1.12 : 1,
                        duration: const Duration(milliseconds: 260),
                        curve: bouncy,
                        child: Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            color: col,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
        _rule(),
        _row(
          64,
          l.settingsLanguage,
          Builder(
            builder: (ctx) => Tap(
              onTap: () => menuBelow(
                ctx,
                MenuSpec(
                  groups: [
                    [
                      for (final lang in AppLanguage.values)
                        MenuItem(
                          '',
                          lang.displayName(l),
                          checked: currentLang.code == lang.code,
                          onTap: () => app.setLang(lang.code),
                        ),
                    ],
                  ],
                ),
              ),
              builder: (_, h, _) => AnimatedContainer(
                duration: fast,
                width: 172,
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
                        currentLang.displayName(l),
                        13,
                        w: w700,
                        f: F.semi,
                      ),
                    ),
                    Ico('chevron-down', size: 16, color: P.muted),
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _LyricsCard extends StatelessWidget {
  const _LyricsCard();

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    return Column(
      children: [
        SizedBox(
          height: 56,
          child: Row(
            children: [
              Expanded(
                child: tx(
                  context.l10n.settingsMiniLyric,
                  13,
                  w: w600,
                  c: P.muted,
                ),
              ),
              Toggle(
                value: app.miniLyric,
                onChanged: (v) => app.update(() => app.miniLyric = v),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _Playback extends StatelessWidget {
  const _Playback();

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    return Column(
      children: [
        // Audio quality is decided by each plugin in its own settings, so it's no longer here
        _row(
          66,
          context.l10n.settingsKeepRunning,
          Toggle(
            value: app.keepRunning,
            onChanged: (v) => app.update(() => app.keepRunning = v),
          ),
        ),
        if (Platform.isMacOS)
          _row(
            66,
            context.l10n.settingsDynamicIsland,
            Toggle(value: app.island, onChanged: app.setIsland),
            hint: context.l10n.settingsDynamicIslandHint,
          ),
      ],
    );
  }
}

class _AboutTab extends StatelessWidget {
  const _AboutTab({super.key});

  @override
  Widget build(BuildContext context) {
    // Logo and name sit outside the card, centered horizontally as a whole
    return SizedBox(
      width: double.infinity,
      child: FadeIn(
        child: Column(
          children: [
            Image.asset('assets/app_icon.png', width: 96, height: 96),
            const SizedBox(height: 12),
            tx('YesPlayMusic', 24, w: w800, f: F.wide),
            const SizedBox(height: 40),
            const SizedBox(width: 512, child: _About()),
          ],
        ),
      ),
    );
  }
}

/// Version, update check, anonymous stats, project links and log files, in one card.
class _About extends StatelessWidget {
  const _About();

  // 18 between rows and dividers
  static const _gap = SizedBox(height: 18);

  static Widget _line(String label, Widget right, {String hint = ''}) => Row(
    children: [
      Expanded(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            tx(label, 15, w: w700),
            if (hint.isNotEmpty) ...[
              const SizedBox(height: 4),
              tx(hint, 12, w: w500, c: P.faint),
            ],
          ],
        ),
      ),
      right,
    ],
  );

  @override
  Widget build(BuildContext context) {
    final u = Updater.instance;
    final a = Analytics.instance;
    final l = context.l10n;
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: squircle(24, color: P.surface),
      child: ListenableBuilder(
        listenable: Listenable.merge([u, a]),
        builder: (context, _) => Column(
          children: [
            _line(
              l.aboutVersion(appVersion),
              u.latest != null
                  ? Btn(
                      label: l.aboutDownloadVersion(u.latest!),
                      size: BtnSize.m,
                      kind: BtnKind.primary,
                      onTap: u.openDownload,
                    )
                  : Btn(
                      label: u.checking ? l.aboutChecking : l.aboutCheckUpdate,
                      size: BtnSize.m,
                      kind: BtnKind.secondary,
                      onTap: u.checking ? null : () => u.check(manual: true),
                    ),
              hint: u.statusText(l),
            ),
            _gap,
            _rule(),
            _gap,
            _line(
              l.aboutAutoCheck,
              Toggle(value: u.autoCheck, onChanged: u.setAutoCheck),
            ),
            _gap,
            _rule(),
            _gap,
            _line(
              l.aboutAnalytics,
              Toggle(value: a.enabled, onChanged: a.setEnabled),
            ),
            _gap,
            _rule(),
            _gap,
            _line(
              'GitHub',
              Btn(
                label: l.aboutOpen,
                size: BtnSize.m,
                kind: BtnKind.secondary,
                onTap: () => openExternal(Updater.repoPage),
              ),
              hint: l.aboutSourceAndFeedback,
            ),
            _gap,
            _rule(),
            _gap,
            _line(
              l.aboutLogs,
              Btn(
                label: l.aboutOpenFolder,
                size: BtnSize.m,
                kind: BtnKind.secondary,
                onTap: AppLog.dir == null ? null : AppLog.openFolder,
              ),
              hint: l.aboutLogsHint,
            ),
          ],
        ),
      ),
    );
  }
}

String _mb(int bytes) => formatBytes(bytes, currentLocale);

// Three colors in the cache bar: API, audio, images
const _cacheApi = Color(0xFF2F7DE1);
const _cacheImg = Color(0xFF6E56CF);
const _cacheAudio = Color(0xFFE0892B);

class _Storage extends StatefulWidget {
  const _Storage();

  @override
  State<_Storage> createState() => _StorageState();
}

class _StorageState extends State<_Storage> {
  int? _api, _img, _audio;
  bool _clearing = false;

  @override
  void initState() {
    super.initState();
    _measure();
  }

  Future<void> _measure() async {
    final (a, i, m) = await context.appRead.cacheSizes();
    if (!mounted) return;
    setState(() {
      _api = a;
      _img = i;
      _audio = m;
    });
  }

  Future<void> _clear() async {
    final l = context.l10n;
    final total = (_api ?? 0) + (_img ?? 0) + (_audio ?? 0);
    final ok = await confirmAction(
      context,
      icon: 'close',
      title: l.storageClearTitle(_mb(total)),
      message: l.storageClearMessage,
      action: l.actionClear,
      danger: true,
    );
    if (!ok || !mounted) return;
    setState(() => _clearing = true);
    await context.appRead.clearCache();
    if (!mounted) return;
    showToast(L.storageCleared(_mb(total)));
    setState(() => _clearing = false);
    await _measure();
  }

  @override
  Widget build(BuildContext context) {
    final app = context.appRead;
    final l = context.l10n;
    final totalCap =
        app.cache.maxBytes +
        ImageDiskCache.instance.maxBytes +
        app.audioCache.maxBytes;
    final a = _api ?? 0, i = _img ?? 0, m = _audio ?? 0;
    final total = a + i + m;
    final segs = <(double, Color)>[
      if (a / totalCap > 0.002) (a / totalCap, _cacheApi),
      if (m / totalCap > 0.002) (m / totalCap, _cacheAudio),
      if (i / totalCap > 0.002) (i / totalCap, _cacheImg),
    ];
    return Padding(
      padding: const EdgeInsets.only(top: 24, bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              tx(
                _api == null ? '—' : _mb(total),
                32,
                w: w900,
                f: F.wide,
                tnum: true,
              ),
              const SizedBox(width: 10),
              tx(l.storageLimit(_mb(totalCap)), 13, w: w600, c: P.faint),
            ],
          ),
          const SizedBox(height: 20),
          // A plain progress bar: segments butt end to end, only the two ends of the whole bar are rounded
          ClipRSuperellipse(
            borderRadius: BorderRadius.circular(5),
            child: Container(
              height: 10,
              color: P.raised,
              child: LayoutBuilder(
                builder: (context, c) {
                  final sum = segs.fold<double>(0, (s, e) => s + e.$1);
                  final scale = sum > 1.0 ? 1.0 / sum : 1.0;
                  return Row(
                    children: [
                      for (final seg in segs)
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 600),
                          curve: smooth,
                          width: c.maxWidth * (seg.$1 * scale).clamp(0.0, 1.0),
                          color: seg.$2,
                        ),
                    ],
                  );
                },
              ),
            ),
          ),
          const SizedBox(height: 15),
          Wrap(
            spacing: 16,
            runSpacing: 8,
            children: [
              _legend(_cacheApi, l.storageApi(_mb(a))),
              _legend(_cacheAudio, l.storageAudio(_mb(m))),
              _legend(_cacheImg, l.storageImage(_mb(i))),
            ],
          ),
          const SizedBox(height: 16),
          Btn(
            label: _clearing ? l.storageClearing : l.storageClearCache,
            size: BtnSize.m,
            kind: BtnKind.secondary,
            enabled: !_clearing && total > 0,
            onTap: _clear,
          ),
        ],
      ),
    );
  }

  Widget _legend(Color c, String label) => Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      Container(
        width: 10,
        height: 10,
        decoration: BoxDecoration(color: c, shape: BoxShape.circle),
      ),
      const SizedBox(width: 6),
      tx(label, 12, w: w600, c: P.muted),
    ],
  );
}

// ───────────── Plugin settings page (Sketch final "v31 / 设置 · 插件（卡片）") ─────────────

const _docsUrl =
    'https://github.com/qier222/YesPlayMusic/blob/main/docs/plugins.md';
const _findPluginsUrl =
    'https://github.com/search?q=topic%3Ayesplaymusic-plugin&type=repositories';

void _openPluginsDir() {
  final dir = AppState.pluginsDir();
  Directory(dir).createSync(recursive: true);
  openExternal(dir);
}

/// "Check for updates" in a plugin's menu: reports the result in a toast; a new version shows on the card.
Future<void> _checkPluginUpdate(AppState app, String id, String name) async {
  try {
    final v = await app.checkPluginUpdate(id);
    showToast(
      v == null
          ? L.pluginUpToDate(name)
          : L.pluginUpdateFoundToast(name, versionLabel(v)),
    );
  } on InstallError catch (e) {
    showToast(L.pluginUpdateCheckFailed(e.message));
  }
}

Future<void> _reloadPlugins(AppState app) async {
  await app.loadPlugins();
  showToast(L.pluginsLoadedToast(app.plugins.length));
}

Future<void> _uninstall(
  BuildContext context,
  String id,
  String name,
  String dir,
) async {
  final app = context.appRead;
  final l = context.l10n;
  final ok = await confirmAction(
    context,
    icon: 'trash',
    title: l.pluginUninstallTitle(name),
    message: l.pluginUninstallMessage,
    action: l.actionUninstall,
    danger: true,
  );
  if (!ok) return;
  await app.uninstallPlugin(id, dir);
  showToast(L.pluginUninstalled(name));
}

class _PluginsTab extends StatefulWidget {
  const _PluginsTab({super.key});

  @override
  State<_PluginsTab> createState() => _PluginsTabState();
}

class _PluginsTabState extends State<_PluginsTab> {
  /// false: installed; true: official plugins.
  bool _official = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) context.appRead.checkPluginUpdates();
    });
  }

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final cards = <Widget>[
      const _LocalCard(),
      for (final s in app.plugins) _RunningCard(plugin: s),
      for (final e in app.disabledPlugins.entries)
        _DisabledCard(dir: e.key, manifest: e.value),
      for (final e in app.pluginErrors.entries)
        _FailedCard(dir: e.key, reason: e.value),
      if (app.plugins.isEmpty &&
          app.disabledPlugins.isEmpty &&
          app.pluginErrors.isEmpty)
        const _EmptyCard(),
    ];
    final installed =
        1 +
        app.plugins.length +
        app.disabledPlugins.length +
        app.pluginErrors.length;
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 1048),
      child: FadeIn(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                tx(context.l10n.settingsPlugins, 20, w: w700, f: F.semi),
                const Spacer(),
                Btn(
                  label: context.l10n.pluginFind,
                  icon: 'search',
                  size: BtnSize.m,
                  onTap: () => openExternal(_findPluginsUrl),
                ),
                const SizedBox(width: 8),
                Btn(
                  label: context.l10n.pluginInstallTitle,
                  size: BtnSize.m,
                  kind: BtnKind.primary,
                  onTap: () => showInstallPlugin(context),
                ),
              ],
            ),
            const SizedBox(height: 24),
            const _SourcePicker(),
            const SizedBox(height: 40),
            Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                _TextTab(
                  label: context.l10n.pluginTabInstalled,
                  count: installed,
                  selected: !_official,
                  onTap: () => setState(() => _official = false),
                ),
                const SizedBox(width: 32),
                _TextTab(
                  label: context.l10n.pluginTabOfficial,
                  count: officialPlugins.length,
                  selected: _official,
                  onTap: () => setState(() => _official = true),
                ),
                const Spacer(),
                Btn(
                  label: context.l10n.pluginOpenDir,
                  icon: 'folder',
                  size: BtnSize.s,
                  onTap: _openPluginsDir,
                ),
                const SizedBox(width: 8),
                Btn(
                  label: context.l10n.actionReload,
                  icon: 'refresh',
                  size: BtnSize.s,
                  onTap: () => _reloadPlugins(app),
                ),
              ],
            ),
            const SizedBox(height: 20),
            if (_official)
              const _OfficialGrid()
            else
              for (var i = 0; i < cards.length; i += 2) ...[
                if (i > 0) const SizedBox(height: 16),
                IntrinsicHeight(
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Expanded(child: cards[i]),
                      const SizedBox(width: 16),
                      Expanded(
                        child: i + 1 < cards.length
                            ? cards[i + 1]
                            : const SizedBox.shrink(),
                      ),
                    ],
                  ),
                ),
              ],
            const SizedBox(height: 24),
            Row(
              children: [
                tx(context.l10n.pluginThirdPartyHint, 13, w: w500, c: P.faint),
                const SizedBox(width: 12),
                Tap(
                  onTap: () => openExternal(_docsUrl),
                  builder: (_, h, _) => tx(
                    context.l10n.pluginDevDocs,
                    13,
                    w: w600,
                    c: h ? P.ink : accent,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// "Installed / Official plugins" text tab followed by a count.
class _TextTab extends StatelessWidget {
  const _TextTab({
    required this.label,
    required this.count,
    required this.selected,
    required this.onTap,
  });
  final String label;
  final int count;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Tap(
      onTap: onTap,
      builder: (_, h, _) {
        final c = selected || h ? P.ink : (P.dark ? wa(0.4) : ba(0.4));
        return Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          children: [
            tx(label, 20, w: w700, f: F.semi, c: c),
            const SizedBox(width: 6),
            tx('$count', 13, w: w600, c: selected ? P.faint : c, tnum: true),
          ],
        );
      },
    );
  }
}

/// Official plugins: three per row, the last one is "Install from link".
class _OfficialGrid extends StatelessWidget {
  const _OfficialGrid();

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final ids = {
      for (final s in app.plugins) s.id,
      for (final m in app.disabledPlugins.values) m.id,
    };
    final cards = <Widget>[
      for (final o in officialPlugins)
        _OfficialCard(plugin: o, installed: ids.contains(o.id)),
      const _LinkInstallCard(),
    ];
    return Column(
      children: [
        for (var i = 0; i < cards.length; i += 3) ...[
          if (i > 0) const SizedBox(height: 16),
          IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                for (var j = i; j < i + 3; j++) ...[
                  if (j > i) const SizedBox(width: 16),
                  Expanded(
                    child: j < cards.length
                        ? cards[j]
                        : const SizedBox.shrink(),
                  ),
                ],
              ],
            ),
          ),
        ],
      ],
    );
  }
}

class _OfficialCard extends StatelessWidget {
  const _OfficialCard({required this.plugin, required this.installed});
  final OfficialPlugin plugin;
  final bool installed;

  @override
  Widget build(BuildContext context) {
    final o = plugin;
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: squircle(24, color: P.surface),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              PluginIcon(id: o.id, name: o.name, bundled: true),
              const Spacer(),
              if (installed)
                SizedBox(
                  height: 32,
                  child: Row(
                    children: [
                      Ico('check', size: 16, color: P.faint),
                      const SizedBox(width: 4),
                      tx(
                        context.l10n.pluginTabInstalled,
                        13,
                        w: w500,
                        c: P.faint,
                      ),
                    ],
                  ),
                )
              else
                Btn(
                  label: context.l10n.actionInstall,
                  size: BtnSize.s,
                  kind: BtnKind.primary,
                  enabled: o.link.isNotEmpty,
                  tip: o.link.isEmpty ? context.l10n.pluginComingSoon : null,
                  onTap: () => showInstallPlugin(context, link: o.link),
                ),
            ],
          ),
          const SizedBox(height: 20),
          tx(o.name, 16, w: w600),
          const SizedBox(height: 4),
          tx(o.descOf(context.l10n), 13, w: w500, c: P.faint),
        ],
      ),
    );
  }
}

class _LinkInstallCard extends StatelessWidget {
  const _LinkInstallCard();

  @override
  Widget build(BuildContext context) {
    return Tap(
      onTap: () => showInstallPlugin(context),
      builder: (_, h, p) => PressScale(
        pressed: p,
        child: AnimatedContainer(
          duration: fast,
          padding: const EdgeInsets.all(24),
          decoration: squircle(
            24,
            color: h ? P.surface : null,
            side: BorderSide(color: P.dark ? wa(0.12) : ba(0.12)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 48,
                height: 48,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: P.dark ? wa(0.08) : ba(0.06),
                  shape: BoxShape.circle,
                ),
                child: Ico('link', size: 24),
              ),
              const SizedBox(height: 20),
              tx(context.l10n.pluginInstallFromLink, 16, w: w600),
              const SizedBox(height: 4),
              tx(
                context.l10n.pluginInstallFromLinkHint,
                13,
                w: w500,
                c: P.faint,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Music source: a row of radio pills after "Music source"; the selected one has a white round background with a check.
class _SourcePicker extends StatelessWidget {
  const _SourcePicker();

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          height: 44,
          child: Center(
            child: tx(context.l10n.sourceMusicSource, 14, w: w600, c: P.muted),
          ),
        ),
        const SizedBox(width: 20),
        Expanded(
          child: Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final s in musicSources(app))
                _SourcePill(
                  id: s.id,
                  name: s.name,
                  selected: app.sourceId == s.id,
                  onTap: () => useSource(app, s.id, s.name),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

class _SourcePill extends StatelessWidget {
  const _SourcePill({
    required this.id,
    required this.name,
    required this.selected,
    required this.onTap,
  });
  final String id, name;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final line = sourceLine(context.app, id);
    return Tap(
      onTap: onTap,
      tip: line.text.isEmpty ? null : line.text,
      builder: (_, h, p) => PressScale(
        pressed: p,
        child: AnimatedContainer(
          duration: fast,
          height: 44,
          padding: const EdgeInsets.only(left: 13, right: 18),
          decoration: squircle(
            22,
            color: selected || h
                ? (P.dark ? wa(0.12) : ba(0.08))
                : (P.dark ? wa(0.06) : ba(0.04)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              AnimatedContainer(
                duration: fast,
                width: 18,
                height: 18,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: selected ? P.ink : null,
                  border: selected
                      ? null
                      : Border.all(
                          color: P.dark ? wa(0.3) : ba(0.3),
                          width: 1.5,
                        ),
                ),
                child: selected
                    ? Ico('check', size: 16, color: P.ground)
                    : null,
              ),
              const SizedBox(width: 10),
              SourceIcon(id: id, name: name, size: 24),
              const SizedBox(width: 8),
              tx(name, 14, w: selected ? w600 : w500),
              if (line.color != null) ...[
                const SizedBox(width: 8),
                Ico('warning', size: 16, color: line.color),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

/// A status line at the bottom left of the card.
typedef _Status = ({String icon, String text, Color? color});

/// Plugin card (option A info card): icon, name, badges, author, switch; description and capabilities;
/// status at the bottom, "Settings" and a more menu. Two cards in the same row have the same height.
class _PluginCard extends StatelessWidget {
  const _PluginCard({
    required this.icon,
    required this.name,
    required this.author,
    required this.status,
    this.badges = const [],
    this.dim = false,
    this.description = '',
    this.error,
    this.actions = const [],
    this.onSettings,
    this.menu,
  });
  final Widget icon;
  final String name, author, description;
  final List<Widget> badges;
  final bool dim;
  final String? error;
  final _Status status;
  final List<Widget> actions;
  final VoidCallback? onSettings;
  final MenuSpec Function()? menu;

  @override
  Widget build(BuildContext context) {
    final sc = status.color ?? P.faint;
    return Container(
      decoration: squircle(24, color: P.surface),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 24, 24, 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    icon,
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Flexible(
                                child: tx(
                                  name,
                                  16,
                                  w: w700,
                                  c: dim ? P.muted : P.ink,
                                ),
                              ),
                              for (final b in badges) ...[
                                const SizedBox(width: 6),
                                b,
                              ],
                            ],
                          ),
                          const SizedBox(height: 4),
                          tx(author, 13, w: w500, c: P.faint),
                        ],
                      ),
                    ),
                  ],
                ),
                if (description.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  CjkText(
                    description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: ts(13, w: w500, c: P.muted, h: 20 / 13),
                  ),
                ],
                if (error != null) ...[
                  const SizedBox(height: 16),
                  CjkText(
                    error!,
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                    style: ts(13, w: w500, c: errorColor, h: 20 / 13),
                  ),
                ],
              ],
            ),
          ),
          const Spacer(),
          Container(height: 1, color: P.dark ? wa(0.06) : P.line),
          SizedBox(
            height: 56,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Row(
                children: [
                  Ico(status.icon, size: 16, color: sc),
                  const SizedBox(width: 8),
                  Expanded(
                    child: tx(status.text, 13, w: w500, c: sc),
                  ),
                  for (final a in actions) ...[a, const SizedBox(width: 8)],
                  if (onSettings != null) ...[
                    Btn(
                      label: context.l10n.navSettings,
                      icon: 'gear',
                      size: BtnSize.s,
                      onTap: onSettings,
                    ),
                    const SizedBox(width: 8),
                  ],
                  if (menu != null)
                    Builder(
                      builder: (ctx) => IconBtn(
                        'more',
                        size: BtnSize.s,
                        tip: context.l10n.actionMore,
                        onTap: () => menuBelow(ctx, menu!()),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Local music: the built-in music source, can't be disabled.
class _LocalCard extends StatelessWidget {
  const _LocalCard();

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final l = context.l10n;
    final isCurrent = app.sourceId == 'local';
    final albums = app.libraryAlbums.length;

    return _PluginCard(
      icon: SourceIcon(id: 'local', name: l.sourceLocal, size: 48),
      name: l.sourceLocal,
      badges: [
        UiBadge(l.sourceBuiltIn),
        if (isCurrent) UiBadge(l.sourceInUse, accented: true),
      ],
      author: 'YesPlayMusic',
      description: l.sourceLocalDesc,
      status: (
        icon: 'folder',
        text: app.scanning
            ? scanningLabel(app)
            : app.musicFolders.isEmpty
            ? l.sourceNoFolders
            : l.sourceFolderAlbums(app.musicFolders.length, albums),
        color: null,
      ),
      onSettings: () => _showLocalSettings(context),
      menu: () => MenuSpec(
        groups: [
          [
            MenuItem(
              'plus',
              l.sourceAddFolderEllipsis,
              onTap: () => _addFolder(app),
            ),
            if (app.scanning)
              MenuItem('close', l.sourceCancelScan, onTap: app.cancelScan)
            else
              MenuItem('repeat', l.sourceRescan, onTap: app.rescanLibrary),
          ],
        ],
      ),
    );
  }
}

Future<void> _addFolder(AppState app) async {
  final dir = await getDirectoryPath(confirmButtonText: L.actionAdd);
  if (dir != null) await app.addMusicFolder(dir);
}

/// Local music settings: folders to scan.
void _showLocalSettings(BuildContext context) {
  final l = context.l10n;
  showDialogCard(
    context,
    title: l.sourceLocal,
    width: 520,
    body: (_) => ListenableBuilder(
      listenable: context.appRead,
      builder: (ctx, _) {
        final app = context.appRead;
        final l = ctx.l10n;
        return Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            sectionLabel(l.sourceMusicFolders),
            const SizedBox(height: 8),
            if (app.musicFolders.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 12),
                child: tx(l.sourceNoFoldersAdded, 13, w: w500, c: P.muted),
              ),
            Flexible(
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    for (final f in app.musicFolders)
                      SizedBox(
                        height: 44,
                        child: Row(
                          children: [
                            Ico('folder', size: 16, color: P.faint),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Tap(
                                tip: l.sourceOpenInFileManager,
                                onTap: () => openExternal(f),
                                builder: (_, h, _) =>
                                    tx(f, 13, w: w500, c: h ? P.ink : P.muted),
                              ),
                            ),
                            if (!app.scanning &&
                                app.unreadableFolders.contains(f)) ...[
                              const SizedBox(width: 12),
                              Flexible(
                                child: tx(
                                  l.sourceFolderUnreadable,
                                  12,
                                  w: w500,
                                  c: warnColor,
                                ),
                              ),
                            ],
                            const SizedBox(width: 12),
                            IconBtn(
                              'close',
                              size: BtnSize.s,
                              tip: l.sourceStopScanningFolder,
                              onTap: () => app.removeMusicFolder(f),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Btn(
                  label: l.sourceAddFolder,
                  icon: 'plus',
                  size: BtnSize.s,
                  onTap: () => _addFolder(app),
                ),
                const SizedBox(width: 8),
                Btn(
                  label: app.scanning ? l.sourceScanning : l.sourceRescan,
                  icon: 'refresh',
                  size: BtnSize.s,
                  enabled: !app.scanning,
                  onTap: app.rescanLibrary,
                ),
                if (app.scanning) ...[
                  const SizedBox(width: 8),
                  Btn(
                    label: l.sourceCancelScan,
                    size: BtnSize.s,
                    onTap: app.cancelScan,
                  ),
                ],
              ],
            ),
          ],
        );
      },
    ),
  );
}

/// A running plugin.
class _RunningCard extends StatelessWidget {
  const _RunningCard({required this.plugin});
  final PluginSource plugin;

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final l = context.l10n;
    final s = plugin;
    final mf = s.manifest;
    final name = s.tr(s.info.name);
    final isCurrent = app.sourceId == s.id;
    final account = app.accounts[s.id];
    final update = app.pluginUpdates[s.id];
    final origin = app.pluginUpdateOrigin(s.id);
    final ver = versionLabel(s.info.version);
    final missing = missingServer(mf, s.setting);
    final _Status status = update != null
        ? (
            icon: 'download',
            text: l.pluginUpdateAvailable(versionLabel(update)),
            color: null,
          )
        : missing != null
        ? (
            icon: 'warning',
            text: l.pluginNeedSetting(
              missing.label.isEmpty ? missing.key : s.tr(missing.label),
            ),
            color: warnColor,
          )
        : account != null
        ? (icon: 'user', text: l.pluginSignedInAs(account.name), color: null)
        : s.can(Op.signIn)
        ? (icon: 'user', text: l.stateNotSignedIn, color: null)
        : (
            icon: 'globe',
            text: hostsText(mf, short: true, l10n: l),
            color: null,
          );
    void settings() => showPluginSettings(context, mf, s.dir, running: s);
    Future<void> disable() async {
      await app.setPluginEnabled(s.id, false);
      showToast(L.pluginDisabledToast(name));
    }

    return _PluginCard(
      icon: PluginIcon(id: s.id, name: name, image: pluginIconPath(mf, s.dir)),
      name: name,
      badges: [
        if (ver.isNotEmpty) UiBadge(ver),
        if (isCurrent) UiBadge(l.sourceInUse, accented: true),
        if (update != null) UiBadge(l.pluginHasUpdate, accented: true),
      ],
      author: mf.author.isEmpty ? s.id : mf.author,
      description: s.tr(mf.description),
      status: status,
      actions: [
        if (update != null && origin != null)
          Btn(
            label: l.actionUpdate,
            size: BtnSize.s,
            onTap: () => showInstallPlugin(context, link: origin),
          ),
      ],
      onSettings: settings,
      menu: () => MenuSpec(
        groups: [
          [
            if (s.can(Op.signIn))
              MenuItem(
                'user',
                account == null ? l.pluginSignInAccount : l.actionSignOut,
                onTap: () => account == null
                    ? app.signIn(s)
                    : confirmSignOut(context, s),
              ),
            MenuItem('gear', l.pluginSettingsEllipsis, onTap: settings),
          ],
          [
            MenuItem('pause', l.pluginDisable, onTap: disable),
            MenuItem(
              'download',
              l.pluginCheckUpdate,
              enabled: app.canCheckPluginUpdate(s.id),
              onTap: () => _checkPluginUpdate(app, s.id, name),
            ),
            MenuItem(
              'folder',
              l.sourceShowInFileManager,
              onTap: () => openExternal(s.dir),
            ),
            MenuItem(
              'refresh',
              l.pluginReload,
              onTap: () => _reloadPlugins(app),
            ),
          ],
          [
            MenuItem(
              'trash',
              l.pluginUninstallEllipsis,
              danger: true,
              onTap: () => _uninstall(context, s.id, name, s.dir),
            ),
          ],
        ],
      ),
    );
  }
}

/// A plugin the user disabled: not running; can only be enabled, configured or uninstalled.
class _DisabledCard extends StatelessWidget {
  const _DisabledCard({required this.dir, required this.manifest});
  final String dir;
  final PluginManifest manifest;

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final l = context.l10n;
    final mf = manifest;
    final name = pluginTr(dir, mf.info.name);
    final update = app.pluginUpdates[mf.id];
    final origin = app.pluginUpdateOrigin(mf.id);
    final ver = versionLabel(mf.info.version);
    return _PluginCard(
      icon: PluginIcon(
        id: mf.id,
        name: name,
        dim: true,
        image: pluginIconPath(mf, dir),
      ),
      name: name,
      dim: true,
      badges: [
        if (ver.isNotEmpty) UiBadge(ver),
        UiBadge(l.pluginDisabledBadge),
      ],
      author: mf.author.isEmpty ? mf.id : mf.author,
      description: pluginTr(dir, mf.description),
      status: update != null
          ? (
              icon: 'download',
              text: l.pluginUpdateAvailable(versionLabel(update)),
              color: null,
            )
          : (icon: 'pause', text: l.pluginDisabledBadge, color: null),
      actions: [
        if (update != null && origin != null)
          Btn(
            label: l.actionUpdate,
            size: BtnSize.s,
            onTap: () => showInstallPlugin(context, link: origin),
          ),
        Btn(
          label: l.actionEnable,
          size: BtnSize.s,
          onTap: () async {
            await app.setPluginEnabled(mf.id, true);
            showToast(L.pluginEnabledToast(name));
          },
        ),
      ],
      onSettings: () => showPluginSettings(context, mf, dir),
      menu: () => MenuSpec(
        groups: [
          [
            MenuItem(
              'download',
              l.pluginCheckUpdate,
              enabled: app.canCheckPluginUpdate(mf.id),
              onTap: () => _checkPluginUpdate(app, mf.id, name),
            ),
            MenuItem(
              'folder',
              l.sourceShowInFileManager,
              onTap: () => openExternal(dir),
            ),
          ],
          [
            MenuItem(
              'trash',
              l.pluginUninstallEllipsis,
              danger: true,
              onTap: () => _uninstall(context, mf.id, name, dir),
            ),
          ],
        ],
      ),
    );
  }
}

/// A plugin that failed to load: shows the reason.
class _FailedCard extends StatelessWidget {
  const _FailedCard({required this.dir, required this.reason});
  final String dir, reason;

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final l = context.l10n;
    final name = p.basename(dir);
    return _PluginCard(
      icon: PluginIcon(id: name, name: name, dim: true),
      name: name,
      dim: true,
      badges: [UiBadge(l.pluginNotLoadedBadge)],
      author: dir,
      error: reason,
      status: (
        icon: 'warning',
        text: l.pluginNotLoadedStatus,
        color: errorColor,
      ),
      actions: [
        Btn(
          label: l.actionReload,
          size: BtnSize.s,
          onTap: () => _reloadPlugins(app),
        ),
      ],
      menu: () => MenuSpec(
        groups: [
          [
            MenuItem(
              'folder',
              l.sourceShowInFileManager,
              onTap: () => openExternal(dir),
            ),
          ],
          [
            MenuItem(
              'trash',
              l.pluginDeleteEllipsis,
              danger: true,
              onTap: () => _uninstall(context, '', name, dir),
            ),
          ],
        ],
      ),
    );
  }
}

/// Placeholder next to local music when no plugins are installed.
class _EmptyCard extends StatelessWidget {
  const _EmptyCard();

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: squircle(
        24,
        side: BorderSide(color: P.dark ? wa(0.08) : ba(0.08)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Ico('plugin', size: 24, color: P.faint),
          const SizedBox(height: 12),
          tx(l.pluginEmptyTitle, 15, w: w700),
          const SizedBox(height: 6),
          tx(l.pluginEmptyHint, 13, w: w500, c: P.faint),
          const SizedBox(height: 16),
          Btn(
            label: l.pluginInstallTitle,
            size: BtnSize.s,
            onTap: () => showInstallPlugin(context),
          ),
        ],
      ),
    );
  }
}

// ───────────── MCP server settings page ─────────────

class _McpTab extends StatefulWidget {
  const _McpTab({super.key});

  @override
  State<_McpTab> createState() => _McpTabState();
}

class _McpTabState extends State<_McpTab> {
  final _portCtrl = TextEditingController();
  final _portFocus = FocusNode();
  int? _syncedPort;

  @override
  void dispose() {
    _portCtrl.dispose();
    _portFocus.dispose();
    super.dispose();
  }

  Future<void> _applyPort(AppState app) async {
    final parsed = int.tryParse(_portCtrl.text.trim());
    if (parsed == null || parsed < 1024 || parsed > 65535) {
      showToast(L.mcpPortRangeError);
      _portCtrl.text = '${app.mcpConfig.port}';
      return;
    }
    if (parsed == app.mcpConfig.port) return;
    await app.updateMcpConfig(app.mcpConfig.copyWith(port: parsed));
    showToast(L.mcpPortUpdated(parsed));
  }

  Future<void> _copy(String text, String label) async {
    await Clipboard.setData(ClipboardData(text: text));
    showToast(L.mcpCopiedLabel(label));
  }

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final l = context.l10n;
    final cfg = app.mcpConfig;
    final srv = app.mcp;
    final counts = srv.toolCounts;

    if (!_portFocus.hasFocus && _syncedPort != cfg.port) {
      _syncedPort = cfg.port;
      _portCtrl.text = '${cfg.port}';
    }

    final statusColor = srv.error != null
        ? const Color(0xFFE5484D)
        : srv.running
        ? const Color(0xFF30A46C)
        : P.faint;
    final statusText = srv.error != null
        ? srv.error!
        : srv.running
        ? l.mcpRunning(cfg.endpointUrl)
        : l.mcpStopped;

    final httpJson = cfg.httpClientConfigJson();
    final stdioJson = cfg.stdioBridgeConfigJson();

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 512,
          child: Column(
            children: [
              _Section(
                title: 'MCP Server',
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _row(
                      72,
                      l.mcpEnableLocal,
                      Toggle(
                        value: cfg.enabled,
                        onChanged: (v) =>
                            app.updateMcpConfig(cfg.copyWith(enabled: v)),
                      ),
                      hint: l.mcpEnableHint,
                    ),
                    _rule(),
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      child: Row(
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: statusColor,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: tx(statusText, 13, w: w600, c: P.muted),
                          ),
                          if (srv.running)
                            tx(
                              l.mcpSessions(srv.sessionCount),
                              12,
                              w: w600,
                              c: P.faint,
                              tnum: true,
                            ),
                        ],
                      ),
                    ),
                    _rule(),
                    _row(
                      68,
                      l.mcpListenPort,
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 96,
                            height: 36,
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            alignment: Alignment.center,
                            decoration: squircle(
                              18,
                              color: P.dark ? wa(0.08) : ba(0.06),
                            ),
                            child: InputBox(
                              controller: _portCtrl,
                              focusNode: _portFocus,
                              placeholder: '18888',
                              size: 13,
                              weight: w600,
                              onSubmitted: (_) => _applyPort(app),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Btn(
                            label: l.actionApply,
                            size: BtnSize.s,
                            kind: BtnKind.secondary,
                            onTap: () => _applyPort(app),
                          ),
                        ],
                      ),
                      hint: l.mcpPortHint,
                    ),
                    _rule(),
                    _row(
                      74,
                      l.mcpLazyMode,
                      Toggle(
                        value: cfg.lazyLoading,
                        onChanged: (v) =>
                            app.updateMcpConfig(cfg.copyWith(lazyLoading: v)),
                      ),
                      hint: cfg.lazyLoading
                          ? l.mcpLazyHintOn(counts.core, counts.lazy)
                          : l.mcpLazyHintOff(counts.total),
                    ),
                    _rule(),
                    _row(
                      72,
                      l.mcpReadOnly,
                      Toggle(
                        value: cfg.readOnly,
                        onChanged: (v) =>
                            app.updateMcpConfig(cfg.copyWith(readOnly: v)),
                      ),
                      hint: l.mcpReadOnlyHint,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),
              _Section(
                title: l.mcpAuthSection,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _row(
                      72,
                      l.mcpRequireToken,
                      Toggle(
                        value: cfg.requireAuth,
                        onChanged: (v) =>
                            app.updateMcpConfig(cfg.copyWith(requireAuth: v)),
                      ),
                      hint: l.mcpRequireTokenHint,
                    ),
                    if (cfg.requireAuth && cfg.token.isNotEmpty) ...[
                      _rule(),
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        child: Row(
                          children: [
                            Expanded(
                              child: tx(
                                '${cfg.token.substring(0, 8)}••••••••${cfg.token.substring(cfg.token.length - 4)}',
                                13,
                                w: w600,
                                c: P.muted,
                                tnum: true,
                              ),
                            ),
                            Btn(
                              label: l.actionCopy,
                              size: BtnSize.s,
                              kind: BtnKind.secondary,
                              onTap: () => _copy(cfg.token, 'Bearer Token'),
                            ),
                            const SizedBox(width: 8),
                            Btn(
                              label: l.actionReset,
                              size: BtnSize.s,
                              kind: BtnKind.secondary,
                              onTap: () => app.updateMcpConfig(
                                cfg.copyWith(token: McpConfig.generateToken()),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 24),
        SizedBox(
          width: 512,
          child: Column(
            children: [
              _Section(
                title: l.mcpHttpConfigTitle,
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 18),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      tx(
                        l.mcpHttpConfigDesc,
                        13,
                        w: w500,
                        c: P.muted,
                        lines: 2,
                      ),
                      const SizedBox(height: 12),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(14),
                        decoration: squircle(
                          12,
                          color: P.dark ? wa(0.05) : ba(0.04),
                        ),
                        child: tx(
                          httpJson,
                          12,
                          w: w500,
                          c: P.ink,
                          lines: 12,
                          h: 1.45,
                        ),
                      ),
                      const SizedBox(height: 14),
                      Btn(
                        label: l.mcpCopyHttpConfig,
                        size: BtnSize.m,
                        kind: BtnKind.primary,
                        onTap: () => _copy(httpJson, l.mcpHttpConfigLabel),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 28),
              _Section(
                title: l.mcpStdioConfigTitle,
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 18),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      tx(
                        l.mcpStdioConfigDesc,
                        13,
                        w: w500,
                        c: P.muted,
                        lines: 2,
                      ),
                      const SizedBox(height: 12),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(14),
                        decoration: squircle(
                          12,
                          color: P.dark ? wa(0.05) : ba(0.04),
                        ),
                        child: tx(
                          stdioJson,
                          12,
                          w: w500,
                          c: P.ink,
                          lines: 14,
                          h: 1.45,
                        ),
                      ),
                      const SizedBox(height: 14),
                      Btn(
                        label: l.mcpCopyStdioConfig,
                        size: BtnSize.m,
                        kind: BtnKind.secondary,
                        onTap: () => _copy(stdioJson, l.mcpStdioConfigLabel),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
