// 插件卡片、设置弹窗、安装弹窗共用的小部件（Sketch 定稿「v31 / 设置 · 插件」）。

import 'dart:io';

import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:path/path.dart' as p;

import '../l10n/l10n.dart';
import '../music/models.dart' as m;
import '../music/source.dart';
import '../plugin/locale.dart';
import '../plugin/manifest.dart';
import '../plugin/plugin_source.dart';
import '../state.dart';
import '../theme.dart';
import '../ui.dart';

const _pluginColors = [
  Color(0xFF6E56CF),
  Color(0xFF2F7D6D),
  Color(0xFFB4532A),
  Color(0xFF2F7DE1),
  Color(0xFFB84C72),
];

/// 插件自带图标的完整路径；没写或文件不在时为 null。
String? pluginIconPath(PluginManifest mf, String dir) {
  if (mf.icon.isEmpty) return null;
  final f = p.join(dir, mf.icon);
  return File(f).existsSync() ? f : null;
}

/// 插件图标：插件给了图标就用它；[bundled] 时用 App 自带的官方插件图标
/// （只给「官方插件」里还没装的用）；否则按 id 取一个颜色写名字的第一个字。
/// [round] 时裁成圆形（侧边栏头像）。
class PluginIcon extends StatelessWidget {
  const PluginIcon({
    super.key,
    required this.id,
    required this.name,
    this.image,
    this.size = 48,
    this.dim = false,
    this.round = false,
    this.bundled = false,
  });
  final String id, name;
  final String? image;
  final double size;
  final bool dim, round, bundled;

  @override
  Widget build(BuildContext context) {
    final radius = round
        ? BorderRadius.circular(size / 2)
        : BorderRadius.circular(size * 0.28);
    final letter = _letter();
    final img = image;
    return Opacity(
      opacity: dim ? 0.5 : 1,
      child: SizedBox(
        width: size,
        height: size,
        child: ClipRSuperellipse(
          borderRadius: radius,
          child: img == null
              ? (bundled
                    ? Image.asset(
                        'assets/plugins/$id.png',
                        fit: BoxFit.cover,
                        cacheWidth: (size * 3).round(),
                      )
                    : letter)
              : Image.file(
                  File(img),
                  fit: BoxFit.cover,
                  cacheWidth: (size * 3).round(),
                  errorBuilder: (_, _, _) => letter,
                ),
        ),
      ),
    );
  }

  Widget _letter() {
    final t = name.trim();
    final ch = t.isEmpty
        ? 'P'
        : String.fromCharCode(t.runes.first).toUpperCase();
    return Container(
      alignment: Alignment.center,
      color: _pluginColors[id.hashCode.abs() % _pluginColors.length],
      child: tx(ch, size * 0.42, w: w800, c: white),
    );
  }
}

String versionLabel(String v) =>
    v.isEmpty ? '' : (v.startsWith('v') ? v : 'v$v');

/// 插件导出的功能，换成给人看的名字（去重，按这里的顺序）。
List<String> capabilityLabels(Set<String> ops, [AppLocalizations? l10n]) {
  final l = l10n ?? L;
  final groups = <(String, List<String>)>[
    (l.pluginSignInAccount, [Op.signIn]),
    (l.navHome, [Op.home]),
    (l.navDiscover, [Op.browse]),
    (l.navLibrary, [Op.library]),
    (l.navSearch, [Op.search]),
    (l.capSuggest, [Op.suggest, Op.hotSearches]),
    (l.actionPlay, [Op.stream]),
    (l.capLyrics, [Op.lyrics]),
    (l.capPlaylist, [Op.playlists, Op.playlist]),
    (
      l.capEditPlaylist,
      [
        Op.createPlaylist,
        Op.renamePlaylist,
        Op.deletePlaylist,
        Op.addToPlaylist,
        Op.removeFromPlaylist,
        Op.movePlaylistTrack,
      ],
    ),
    (
      l.capFavorites,
      [
        Op.liked,
        Op.like,
        Op.savedAlbums,
        Op.saveAlbum,
        Op.followArtist,
        Op.savePlaylist,
      ],
    ),
    (l.capAlbum, [Op.album]),
    (l.capArtist, [Op.artist]),
    (l.capRadio, [Op.station]),
    (l.capSimilar, [Op.similar]),
    (l.capHistory, [Op.recent, Op.played]),
    (l.npComments, [Op.comments, Op.postComment, Op.likeComment]),
    (l.navProfile, [Op.profile]),
    (l.capDislike, [Op.dislike]),
    (l.capTrackMenu, [Op.trackMenu, Op.menuAction]),
  ];
  return [
    for (final (label, keys) in groups)
      if (keys.any(ops.contains)) label,
  ];
}

/// 用插件目录里的 locales/<语言>.json 翻译 plugin.json 里的静态文案。
String pluginTr(String dir, String text) =>
    pluginTranslate(dir, bcp47Of(currentLocale), text);

/// 插件在侧边栏加的自己的页面（内置页面已经由功能表示）。
List<String> navTitles(PluginManifest mf, {String? dir}) => [
  for (final n in mf.info.navigation)
    if (n.builtin.isEmpty && n.title.isNotEmpty)
      dir == null ? n.title : pluginTr(dir, n.title),
];

/// permissions.network 换成给人看的一句话；[short] 时最多列两个。
String hostsText(
  PluginManifest mf, {
  bool short = false,
  AppLocalizations? l10n,
}) {
  final l = l10n ?? L;
  final joiner = listJoiner(currentLocale);
  final hs = mf.network;
  if (hs.isEmpty) return l.pluginPermNoNetwork;
  if (hs.contains('*')) return l.pluginPermAnyWebsiteFull;
  final shown = <String>[];
  var server = false;
  for (final h in hs) {
    final mm = RegExp(r'^\{setting:([^{}]+)\}$').firstMatch(h.trim());
    if (mm == null) {
      shown.add(h);
    } else {
      server = true;
    }
  }
  if (short) {
    final list = [...shown, if (server) l.pluginYourServer];
    final head = list.take(2).join(joiner);
    return list.length > 2
        ? l.pluginCanAccessHostsMore(head, list.length)
        : l.pluginCanAccessHosts(head);
  }
  if (shown.isEmpty) return l.pluginOnlyYourServer;
  final joined = shown.join(joiner);
  return server ? l.pluginAndYourServer(joined) : joined;
}

String programsText(List<String> ps, [AppLocalizations? l10n]) =>
    ps.contains('*')
    ? (l10n ?? L).pluginAnyProgram
    : {for (final x in ps) x.split('/').last}.join(listJoiner(currentLocale));

/// 必填但还空着的服务器设置（network 里写了 {setting:key} 的）。
m.Setting? missingServer(PluginManifest mf, String Function(String) value) {
  for (final h in mf.network) {
    final mm = RegExp(r'^\{setting:([^{}]+)\}$').firstMatch(h.trim());
    if (mm == null || value(mm[1]!).trim().isNotEmpty) continue;
    for (final s in mf.info.settings) {
      if (s.key == mm[1]) return s;
    }
  }
  return null;
}

/// 弹窗里的能力标签（28 高，可带图标）。
class InfoChip extends StatelessWidget {
  const InfoChip(this.label, {super.key, this.icon});
  final String label;
  final String? icon;

  @override
  Widget build(BuildContext context) => Container(
    height: 28,
    padding: const EdgeInsets.symmetric(horizontal: 12),
    decoration: squircle(14, color: P.dark ? wa(0.08) : ba(0.05)),
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (icon != null) ...[
          Ico(icon!, size: 16, color: P.muted),
          const SizedBox(width: 6),
        ],
        tx(label, 13, w: w500),
      ],
    ),
  );
}

/// 弹窗里的小节标题。
Widget sectionLabel(String s) => tx(s, 13, w: w600, c: P.faint);

/// 权限一行：圆形图标、标题（可带徽章）、说明，右边可放开关。
class PermRow extends StatelessWidget {
  const PermRow({
    super.key,
    required this.icon,
    required this.title,
    required this.detail,
    this.badge,
    this.iconColor,
    this.trailing,
  });
  final String icon, title, detail;
  final String? badge;
  final Color? iconColor;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) => Row(
    children: [
      Container(
        width: 36,
        height: 36,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: P.dark ? wa(0.08) : ba(0.05),
        ),
        child: Ico(icon, size: 16, color: iconColor ?? P.ink),
      ),
      const SizedBox(width: 16),
      Expanded(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Flexible(child: tx(title, 14, w: w600)),
                if (badge != null) ...[
                  const SizedBox(width: 8),
                  UiBadge(badge!),
                ],
              ],
            ),
            const SizedBox(height: 2),
            Text(
              detail,
              style: ts(13, w: w500, c: P.muted, h: 20 / 13),
            ),
          ],
        ),
      ),
      if (trailing != null) ...[const SizedBox(width: 16), trailing!],
    ],
  );
}

/// 弹窗标题区：插件图标、名字、版本、作者，右上角关闭。
class PluginDialogHeader extends StatelessWidget {
  const PluginDialogHeader({
    super.key,
    required this.manifest,
    required this.dir,
    required this.onClose,
    this.subtitle,
    this.badges = const [],
  });
  final PluginManifest manifest;
  final String dir;
  final VoidCallback onClose;
  final String? subtitle;
  final List<Widget> badges;

  @override
  Widget build(BuildContext context) {
    final mf = manifest;
    final name = pluginTr(dir, mf.info.name);
    final ver = versionLabel(mf.info.version);
    final sub = subtitle ?? (mf.author.isEmpty ? mf.id : mf.author);
    return Row(
      children: [
        PluginIcon(id: mf.id, name: name, image: pluginIconPath(mf, dir)),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Flexible(child: tx(name, 18, w: w700)),
                  if (ver.isNotEmpty) ...[
                    const SizedBox(width: 8),
                    UiBadge(ver),
                  ],
                  for (final b in badges) ...[const SizedBox(width: 6), b],
                ],
              ),
              const SizedBox(height: 4),
              tx(sub, 13, w: w500, c: P.faint),
            ],
          ),
        ),
        const SizedBox(width: 16),
        IconBtn(
          'close',
          size: BtnSize.s,
          tip: context.l10n.actionClose,
          onTap: onClose,
        ),
      ],
    );
  }
}

OverlayEntry? _dialog;

/// 打开一个插件弹窗（遮罩、Esc 关闭、淡入）。返回关闭函数。[width] 为空时
/// 由内容决定宽度（安装弹窗两步宽度不同）。[onDismiss] 在点遮罩或按 Esc 时调用。
VoidCallback showPluginDialog(
  BuildContext context, {
  double? width,
  VoidCallback? onDismiss,
  required Widget Function(VoidCallback close) builder,
}) {
  _dialog?.remove();
  _dialog = null;
  late final OverlayEntry self;
  var closed = false;
  void close() {
    if (closed) return;
    closed = true;
    if (identical(_dialog, self)) _dialog = null;
    self.remove();
  }

  void dismiss() {
    onDismiss?.call();
    close();
  }

  self = _dialog = OverlayEntry(
    builder: (ctx) => Shortcuts(
      shortcuts: const {
        SingleActivator(LogicalKeyboardKey.escape): DismissIntent(),
      },
      child: Actions(
        actions: {
          DismissIntent: CallbackAction<DismissIntent>(
            onInvoke: (_) {
              dismiss();
              return null;
            },
          ),
        },
        child: Focus(
          autofocus: true,
          child: Stack(
            children: [
              Positioned.fill(
                child: GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: dismiss,
                  child: ColoredBox(color: ba(0.6)),
                ),
              ),
              Center(
                child: TweenAnimationBuilder<double>(
                  tween: Tween(begin: 0, end: 1),
                  duration: const Duration(milliseconds: 200),
                  curve: Curves.easeOutCubic,
                  builder: (_, t, c) => Opacity(
                    opacity: t,
                    child: Transform.scale(scale: 0.96 + 0.04 * t, child: c),
                  ),
                  child: AnimatedSize(
                    duration: const Duration(milliseconds: 200),
                    curve: Curves.easeOutCubic,
                    child: Container(
                      width: width,
                      constraints: BoxConstraints(
                        maxHeight: MediaQuery.sizeOf(ctx).height - 64,
                      ),
                      decoration: squircle(
                        28,
                        color: P.dark ? const Color(0xFF1C1C1F) : P.floating,
                        side: BorderSide(color: P.dark ? wa(0.08) : ba(0.08)),
                        shadows: [
                          BoxShadow(
                            color: ba(P.dark ? 0.6 : 0.2),
                            blurRadius: 64,
                            spreadRadius: -8,
                            offset: const Offset(0, 24),
                          ),
                        ],
                      ),
                      child: builder(close),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    ),
  );
  Overlay.of(context, rootOverlay: true).insert(self);
  return close;
}

/// 输入框外壳：40 或 48 高的胶囊，聚焦时亮一点。
class FieldShell extends StatelessWidget {
  const FieldShell({
    super.key,
    required this.focus,
    required this.child,
    this.height = 40,
  });
  final FocusNode focus;
  final Widget child;
  final double height;

  @override
  Widget build(BuildContext context) => ListenableBuilder(
    listenable: focus,
    builder: (_, _) => GestureDetector(
      onTap: focus.requestFocus,
      child: AnimatedContainer(
        duration: fast,
        height: height,
        padding: EdgeInsets.symmetric(horizontal: height >= 48 ? 20 : 16),
        decoration: squircle(
          height / 2,
          color: P.dark
              ? (focus.hasFocus ? wa(0.12) : wa(0.08))
              : (focus.hasFocus ? ba(0.10) : ba(0.06)),
        ),
        alignment: Alignment.centerLeft,
        child: child,
      ),
    ),
  );
}

/// 红色的文字按钮（卸载）。
class DangerTextBtn extends StatelessWidget {
  const DangerTextBtn({
    super.key,
    required this.label,
    required this.icon,
    required this.onTap,
  });
  final String label, icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    const red = Color(0xFFFF8589);
    return Tap(
      onTap: onTap,
      builder: (_, h, p) => PressScale(
        pressed: p,
        down: 0.95,
        child: AnimatedContainer(
          duration: fast,
          height: 48,
          padding: const EdgeInsets.symmetric(horizontal: 18),
          decoration: squircle(
            24,
            color: h ? const Color(0x1FE5484D) : const Color(0x00E5484D),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Ico(icon, size: 16, color: red),
              const SizedBox(width: 8),
              tx(label, 14, w: w700, c: red, f: F.semi),
            ],
          ),
        ),
      ),
    );
  }
}

const warnColor = Color(0xFFF5B14C);
const errorColor = Color(0xFFFF8589);

// ───── 音乐来源（设置页的单选和侧边栏头像弹出的菜单共用） ─────

/// 能当音乐来源的插件：提供音乐库或搜索。只补歌词这类插件不算。
bool isMusicSource(PluginSource s) => s.can(Op.library) || s.can(Op.search);

/// 可选的音乐来源：本地音乐在前，然后是在运行的插件。
List<({String id, String name})> musicSources(AppState app) => [
  (id: 'local', name: L.sourceLocal),
  for (final s in app.plugins)
    if (isMusicSource(s) || app.sourceId == s.id)
      (id: s.id, name: s.tr(s.info.name)),
];

/// 来源名字下面的一行小字。
({String text, Color? color}) sourceLine(AppState app, String id) {
  if (id == 'local') {
    if (app.scanning) return (text: L.sourceScanning, color: null);
    if (app.musicFolders.isEmpty) return (text: L.sourceNoFolders, color: null);
    return (text: L.countAlbums(app.libraryAlbums.length), color: null);
  }
  final s = app.plugins.where((p) => p.id == id).firstOrNull;
  if (s == null) return (text: '', color: null);
  final missing = missingServer(s.manifest, s.setting);
  if (missing != null) {
    return (
      text: L.pluginNeedSetting(
        missing.label.isEmpty ? missing.key : s.tr(missing.label),
      ),
      color: warnColor,
    );
  }
  final account = app.accounts[id];
  if (account != null) {
    return (text: L.pluginSignedInAs(account.name), color: null);
  }
  if (s.can(Op.signIn)) return (text: L.stateNotSignedIn, color: null);
  return (text: s.manifest.author, color: null);
}

void useSource(AppState app, String id, String name) {
  if (app.sourceId == id) return;
  app.setSource(id);
  showToast(L.sourceSwitchedTo(name));
}

/// 来源图标：本地音乐是 Music 图标，插件用自己的图标。[round] 时是圆形。
class SourceIcon extends StatelessWidget {
  const SourceIcon({
    super.key,
    required this.id,
    required this.name,
    this.size = 40,
    this.round = false,
  });
  final String id, name;
  final double size;
  final bool round;

  @override
  Widget build(BuildContext context) {
    if (id == 'local') {
      return Container(
        width: size,
        height: size,
        alignment: Alignment.center,
        decoration: squircle(round ? size / 2 : size * 0.28, color: P.raised),
        child: Ico('music', size: size >= 36 ? 20 : 16),
      );
    }
    final s = context.app.plugins.where((x) => x.id == id).firstOrNull;
    return PluginIcon(
      id: id,
      name: name,
      size: size,
      round: round,
      image: s == null ? null : pluginIconPath(s.manifest, s.dir),
    );
  }
}

/// 官方插件，显示在插件页「官方插件」里。
/// 图标随 App 带在 `assets/plugins/<id>.png`，还没装时也能显示。
class OfficialPlugin {
  const OfficialPlugin(this.id, this.name, this.link);

  /// 和插件 plugin.json 里的 id 一致，用来判断装没装。
  final String id, name;

  /// 安装链接（GitHub 仓库或 Release）；空的表示还没发布。
  final String link;

  String descOf(AppLocalizations l) => switch (id) {
    'jellyfin' => l.officialJellyfinDesc,
    'plex' => l.officialPlexDesc,
    'subsonic' => l.officialSubsonicDesc,
    'emby' => l.officialEmbyDesc,
    _ => '',
  };
}

const officialPlugins = [
  OfficialPlugin(
    'jellyfin',
    'Jellyfin',
    'github.com/qier222/ypm-plugin-jellyfin',
  ),
  OfficialPlugin('plex', 'Plex', 'github.com/qier222/ypm-plugin-plex'),
  OfficialPlugin(
    'subsonic',
    'Subsonic',
    'github.com/qier222/ypm-plugin-subsonic',
  ),
  OfficialPlugin('emby', 'Emby', 'github.com/qier222/ypm-plugin-emby'),
];
