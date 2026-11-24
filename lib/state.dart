import 'dart:async';
import 'dart:math' as math;
import 'dart:convert';
import 'dart:io';

import 'package:flutter/foundation.dart' show listEquals;
import 'package:flutter/services.dart' show Clipboard, ClipboardData;
import 'package:flutter/widgets.dart';
import 'package:path/path.dart' as p;

import 'analytics.dart';
import 'cover_color.dart';
import 'data.dart';
import 'l10n/l10n.dart';
import 'music/local/local_source.dart';
import 'music/lrc.dart' as lrc;
import 'cache/audio_cache.dart';
import 'cache/image_cache.dart';
import 'cache/requests.dart';
import 'cache/swr.dart';
import 'comments.dart';
import 'mcp/config.dart';
import 'mcp/mcp_server.dart';
import 'music/models.dart' as m;
import 'music/player.dart';
import 'music/source.dart';
import 'plugin/installer.dart';
import 'plugin/locale.dart';
import 'plugin/manifest.dart';
import 'plugin/plugin_source.dart';
import 'system.dart';
import 'theme.dart';
import 'ui.dart' show showToast;
import 'version.dart' show compareVersions;
import 'web_sign_in.dart';

enum NpTab { lyrics, queue, similar, comments }

enum LyricMode { original, both, trans }

/// 整个界面的状态：路由、音乐来源、播放器、设置。
class AppState extends ChangeNotifier {
  AppState() {
    ImageDiskCache.instance.dir = p.join(supportDir(), 'cache', 'images');
    // 启动后过一会儿看看三份磁盘缓存有没有超过上限或过期
    _trimTimer = Timer(const Duration(seconds: 20), () {
      cache.trim().ignore();
      ImageDiskCache.instance.trim().ignore();
      audioCache.trim().ignore();
    });
    // 旧版只存首页、发现页的 page-cache，已经由 cache/api 取代
    Directory(p.join(supportDir(), 'page-cache'))
        .delete(recursive: true)
        .then((_) {}, onError: (_) {});
    _restorePlayer();
    _loadSearchHistory();
    pos.addListener(_savePlayerSoon);
  }

  Timer? _trimTimer;

  @override
  void notifyListeners() {
    super.notifyListeners();
    _savePlayerSoon();
    _trackPage();
  }

  // ───── 匿名统计 ─────
  String _trackedPage = '';

  /// 换了页面（或正在播放的标签）就记一次；只记页面种类，不带 id 和参数。
  void _trackPage() {
    final page = npOpen ? '/now-playing/${npTab.name}' : pageKind(path);
    if (page == _trackedPage) return;
    _trackedPage = page;
    Analytics.instance.event('page_open', {'app_page': page});
  }

  /// `/album/@源/id` → `/album`，`/library/albums` 保留第二段。
  static String pageKind(String path) {
    final s = path.split('?').first.split('/').where((x) => x.isNotEmpty);
    if (s.isEmpty) return '/';
    return s.first == 'library' && s.length > 1
        ? '/library/${s.elementAt(1)}'
        : '/${s.first}';
  }

  /// 每天随 app_active 发一次：设置偏好和装了哪些插件。
  List<AnalyticsEvent> analyticsSnapshot() => [
    (
      'settings_state',
      {
        'ui_language': lang,
        'music_source': sourceId,
        'mini_lyric': '$miniLyric',
        'minimize_to_tray': '$tray',
        'mcp_enabled': '${mcpConfig.enabled}',
        'plugin_count': plugins.length + disabledPlugins.length,
      },
    ),
    for (final s in plugins)
      (
        'plugin_state',
        {
          'plugin_id': s.id,
          'plugin_version': s.info.version,
          'plugin_enabled': 'true',
        },
      ),
    for (final m in disabledPlugins.values)
      (
        'plugin_state',
        {
          'plugin_id': m.id,
          'plugin_version': m.info.version,
          'plugin_enabled': 'false',
        },
      ),
  ];

  // ───── 路由 ─────
  // 调试用：--dart-define=ROUTE=/search 直接打开某页，NP=lyrics|queue|similar 打开正在播放，TRACK=n 选队列第 n 首
  // 启动页：有首页进首页，否则进发现，再否则进音乐库。插件加载完才知道，
  // 先用上次算出来的，加载完再改（用户还没点别处时）。
  final List<String> _stack = [
    _prefs()['start'] as String? ?? '/library/albums',
    if (const String.fromEnvironment('ROUTE').isNotEmpty)
      const String.fromEnvironment('ROUTE'),
  ];
  String get path => _stack.last;
  bool get canBack => _stack.length > 1;
  int navSerial = 0; // 每次跳转加一，用来驱动页面切换动画
  bool navBack = false;

  /// 后退过的页面，⌘] 前进用；跳到新页面时清空。
  final List<String> _forward = [];
  bool get canForward => _forward.isNotEmpty;

  void go(String p) {
    if (path == p) return;
    _forward.clear();
    _stack.add(p);
    navSerial++;
    navBack = false;
    _refreshLibraryIfShown();
    notifyListeners();
  }

  void replace(String p) {
    if (path == p) return;
    _stack[_stack.length - 1] = p;
    navSerial++;
    navBack = false;
    _refreshLibraryIfShown();
    notifyListeners();
  }

  void back() {
    if (!canBack) return;
    _forward.add(_stack.removeLast());
    navSerial++;
    navBack = true;
    _refreshLibraryIfShown();
    notifyListeners();
  }

  void forward() {
    if (!canForward) return;
    _stack.add(_forward.removeLast());
    navSerial++;
    navBack = false;
    _refreshLibraryIfShown();
    notifyListeners();
  }

  /// 侧边栏第 [i] 个页面（0 首页、1 发现、2 音乐库、3 搜索），和侧边栏按钮去同一个地方。
  /// 当前源没有首页或发现（本地模式两个都没有）时去音乐库。
  void goTab(int i) => go(switch (i) {
    0 when !hasHome => '/library/albums',
    1 when !hasDiscover => '/library/albums',
    0 => '/home',
    1 => '/discover',
    2 => '/library/albums',
    _ => '/search',
  });

  /// 侧边栏上显示的一级页面（goTab 的序号）。⌘1～4 按这个顺序。
  List<int> get visibleTabs => [if (hasHome) 0, if (hasDiscover) 1, 2, 3];

  /// 当前源有没有首页（插件提供 home）。本地音乐没有；插件还在加载时
  /// 先当作有（显示骨架），加载完再看插件给不给。
  bool get hasHome => _hasTab(Op.home);

  /// 当前源有没有发现页（插件提供 browse）。规则同 [hasHome]。
  bool get hasDiscover => _hasTab(Op.browse);

  bool _hasTab(String op) {
    if (localMode) return false;
    final s = remote ? sources[sourceId] : null;
    return s == null ? !pluginsLoaded : s.can(op);
  }

  /// 换源后回到新源的起始页（首页、发现或音乐库），前后历史都清掉（是上一个源的页面）。
  /// 在设置里换的就留在设置，后退回到起始页。
  void _resetToStart() {
    final start = _startPath;
    final cur = path;
    _stack
      ..clear()
      ..addAll([start, if (cur.startsWith('/settings')) cur]);
    _forward.clear();
    navSerial++;
    navBack = false;
  }

  /// 换了源以后还停在它没有的首页或发现：换到音乐库。
  void _leaveMissingTabs() {
    if ((path == '/home' && !hasHome) ||
        (path == '/discover' && !hasDiscover)) {
      replace('/library/albums');
    }
  }

  /// ⌘F：去搜索页并让搜索框获得焦点（已经在搜索页也会重新聚焦）。
  final ValueNotifier<int> searchFocus = ValueNotifier(0);
  void focusSearch() {
    go('/search');
    searchFocus.value++;
  }

  // ───── 正在播放 ─────
  bool npOpen = const String.fromEnvironment('NP').isNotEmpty;
  NpTab npTab = NpTab.values.firstWhere(
    (t) => t.name == const String.fromEnvironment('NP'),
    orElse: () => NpTab.lyrics,
  );
  LyricMode lyricMode = LyricMode.both;

  void openNowPlaying([NpTab? tab]) {
    if (tab != null) npTab = tab;
    npOpen = true;
    notifyListeners();
  }

  void closeNowPlaying() {
    npOpen = false;
    notifyListeners();
  }

  void setNpTab(NpTab t) {
    npTab = t;
    notifyListeners();
  }

  // ───── 音乐来源 ─────
  final Sources sources = Sources();
  LocalSource? local;

  /// 本地专辑（书架用）。
  List<Album> libraryAlbums = const [];
  final Map<String, List<Track>> _albumTracks = {};

  bool get hasLibrary => (local?.trackCount ?? 0) > 0;
  Album? albumOf(String id) =>
      _remoteAlbums[id] ?? libraryAlbums.where((a) => a.id == id).firstOrNull;

  /// 专辑的曲目；没加载过的返回 null。
  List<Track>? albumTracks(String id) => _albumTracks[id];

  /// 专辑页路由。真实专辑的 id 里可能有 / 等字符，要编码。插件的专辑
  /// （id 是 `@源/id`）去插件专辑页，没加载过曲目也能打开。
  static String albumRoute(String id) {
    final i = id.indexOf('/');
    if (id.startsWith('@') && i > 1) {
      return remoteRoute('album', id.substring(1, i), id.substring(i + 1));
    }
    return '/album/${Uri.encodeComponent(id)}';
  }

  static String get _home => homeDir;

  /// 默认扫描的文件夹：~/Music 和 ~/Documents/Music（存在的那些）。
  /// 也可以用 --dart-define=MUSIC_DIRS=/a:/b 指定（Windows 上用 ; 分隔）。
  static List<String> defaultMusicFolders() {
    const env = String.fromEnvironment('MUSIC_DIRS');
    final dirs = env.isNotEmpty
        ? env.split(Platform.isWindows ? ';' : ':')
        : [p.join(_home, 'Music'), p.join(_home, 'Documents', 'Music')];
    return dirs.where((d) => Directory(d).existsSync()).toList();
  }

  /// `flutter test` 下的数据目录：每个测试进程一个临时目录。否则测试里的
  /// AppState 会读写用户真实的 prefs.json、player.json（比如把当前源改成测试用的假源）。
  static final String? _testRoot =
      Platform.environment['FLUTTER_TEST'] == 'true'
      ? Directory.systemTemp.createTempSync('ypm_test_').path
      : null;

  static String _cacheDir() {
    if (_testRoot case final t?) return p.join(t, 'cache');
    final env = Platform.environment;
    if (Platform.isMacOS && _home.isNotEmpty) {
      return p.join(_home, 'Library', 'Caches', 'YesPlayMusic');
    }
    if (Platform.isWindows && (env['LOCALAPPDATA'] ?? '').isNotEmpty) {
      return p.join(env['LOCALAPPDATA']!, 'YesPlayMusic', 'Cache');
    }
    if (Platform.isLinux && _home.isNotEmpty) {
      final xdg = env['XDG_CACHE_HOME'] ?? '';
      return p.join(
        xdg.isNotEmpty ? xdg : p.join(_home, '.cache'),
        'YesPlayMusic',
      );
    }
    return p.join(Directory.systemTemp.path, 'YesPlayMusic');
  }

  /// 正在扫描本地音乐。扫描期间音乐库为空也不显示空状态，免得启动时闪一下。
  bool scanning = false;

  /// 本地音乐要扫描的文件夹，存在 prefs 里；没设置过时用 [defaultMusicFolders]。
  late List<String> musicFolders = [
    for (final x
        in (_prefs()['musicFolders'] as List?) ?? defaultMusicFolders())
      '$x',
  ];

  /// 加一个音乐文件夹并重新扫描。已经在列表里（或在已有文件夹里面）就不加。
  Future<void> addMusicFolder(String dir) async {
    dir = p.normalize(dir);
    if (musicFolders.any((f) => f == dir || p.isWithin(f, dir))) {
      showToast(L.sourceFolderAlreadyScanned);
      return;
    }
    // 新加的文件夹包含了已有的，就把已有的去掉
    musicFolders = [...musicFolders.where((f) => !p.isWithin(dir, f)), dir];
    _savePrefs({'musicFolders': musicFolders});
    await rescanLibrary();
  }

  Future<void> removeMusicFolder(String dir) async {
    musicFolders = musicFolders.where((f) => f != dir).toList();
    _savePrefs({'musicFolders': musicFolders});
    await loadLibrary();
  }

  /// 空状态里的「重新扫描」：扫完还是空的就提示一下。
  Future<void> rescanLibrary() async {
    await loadLibrary();
    if (!hasLibrary) showToast(L.sourceNoMusicFound);
  }

  /// 扫描本地音乐，生成书架；有歌时把播放队列换成第一张专辑（不自动播放）。
  Future<void> loadLibrary({List<String>? folders}) async {
    scanning = true;
    notifyListeners();
    try {
      await _scanLocal(folders);
    } finally {
      scanning = false;
      notifyListeners();
    }
  }

  Future<void> _scanLocal(List<String>? folders) async {
    final src = LocalSource(
      folders: folders ?? musicFolders,
      cacheDir: _cacheDir(),
    );
    await src.scan();
    if (local != null) await sources.remove(local!.id);
    local = src;
    sources.add(src);

    final home = await src.home();
    final found = home.sections.expand((s) => s.albums).toList();
    final out = <Album>[];
    _albumTracks.clear();
    for (final a in found) {
      final page = await src.album(a.id);
      _albumTracks[a.id] = page.tracks.map(Track.of).toList();
      out.add(
        Album(
          id: a.id,
          title: a.name,
          artist: a.artists.map((x) => x.name).join(', '),
          cover: a.imageUrl,
          year: a.year ?? 0,
          added: DateTime.tryParse(a.added)?.toLocal(),
          released: DateTime.tryParse(a.released),
          copyright: a.copyright,
          // 书脊宽度随曲目数变化，和设计稿的 42~64 区间一致
          spine: 42 + page.tracks.length.clamp(0, 22).toDouble(),
        ),
      );
    }
    out.sort((a, b) {
      final c = a.artist.toLowerCase().compareTo(b.artist.toLowerCase());
      return c != 0 ? c : a.year.compareTo(b.year);
    });
    libraryAlbums = out;
    _libraries.remove('local');
    await CoverColors.instance.preload(out.map((a) => a.cover));

    if (out.isNotEmpty) {
      if (!out.any((a) => a.id == shelfId)) shelfId = out.first.id;
    }
    notifyListeners();
  }

  // ───── 插件 ─────
  // 插件由第三方提供，应用本身不带任何插件。每个插件是 plugins/<id>/ 下的一个目录。

  /// 已加载的插件。
  List<PluginSource> plugins = const [];

  /// 设置里选的源，插件还没加载完时也有。
  String get chosenSource => _sourceId;

  /// 本地模式：当前源是本地音乐（插件还在加载时按设置里选的算）。
  /// 没有首页和发现。
  bool get localMode =>
      (remote || pluginsLoaded ? sourceId : chosenSource) == 'local';

  /// 第一次加载插件结束了（之前插件的页面先显示骨架）。
  bool pluginsLoaded = false;

  /// 当前源的起始页：有首页去首页，否则发现，再否则音乐库。
  String get _startPath {
    final s = remote ? sources[sourceId] : null;
    return s != null && s.can(Op.home)
        ? '/home'
        : s != null && s.can(Op.browse)
        ? '/discover'
        : '/library/albums';
  }

  void _pickStart() {
    final start = _startPath;
    _savePrefs({'start': start});
    if (_stack.length == 1 && _stack.first != start) _stack[0] = start;
  }

  // 每个源的首页上次有哪些区块（「样式:数量」），加载时照着画骨架，内容到了布局不跳。
  final Map<String, List<String>> _homeLayouts = {
    for (final e in ((_prefs()['homeLayout'] as Map?) ?? const {}).entries)
      '${e.key}': [for (final x in e.value as List) '$x'],
  };

  List<String> homeLayout(String key) =>
      _homeLayouts[key] ??
      (key.endsWith('/discover')
          ? const ['shelf:14', 'songs:12']
          : const ['modes:5', 'shelf:10', 'songs:12']);

  /// 记过的布局；没记过是 null（不给默认的）。
  List<String>? savedHomeLayout(String key) => _homeLayouts[key];

  void rememberHomeLayout(String source, List<String> layout) {
    if (listEquals(_homeLayouts[source], layout)) return;
    _homeLayouts[source] = layout;
    _savePrefs({'homeLayout': _homeLayouts});
  }

  /// 没能加载的插件：目录 → 原因。
  Map<String, String> pluginErrors = const {};

  /// 应用数据目录：macOS 上是 ~/Library/Application Support/YesPlayMusic。
  static String supportDir() {
    if (_testRoot case final t?) return p.join(t, 'support');
    if (Platform.isMacOS) {
      return p.join(_home, 'Library', 'Application Support', 'YesPlayMusic');
    }
    if (Platform.isWindows) {
      return p.join(Platform.environment['APPDATA'] ?? _home, 'YesPlayMusic');
    }
    final xdg = Platform.environment['XDG_DATA_HOME'] ?? '';
    return p.join(
      xdg.isNotEmpty ? xdg : p.join(_home, '.local', 'share'),
      'YesPlayMusic',
    );
  }

  static String pluginsDir() => p.join(supportDir(), 'plugins');

  /// （重新）加载插件目录里的所有插件。
  Future<void> loadPlugins() async {
    _pluginGen++;
    for (final s in plugins) {
      await sources.remove(s.id);
    }
    Directory(pluginsDir()).createSync(recursive: true);
    PluginSource.onAsk ??= (plugin, op, args) => switch (op) {
      'webSignIn' => webSignIn(args),
      'signInPrompt' => _signInPrompted(plugin, args),
      _ => throw StateError('$op is not available'),
    };
    // 插件跟应用界面语言走（host.language()、host.t() 和插件报错文案）
    clearPluginLocaleCache();
    PluginSource.language = bcp47Of(currentLocale);
    onGlobalLocaleChanged ??= (loc) {
      final tag = bcp47Of(loc);
      if (tag == PluginSource.language) return;
      PluginSource.language = tag;
      for (final s in plugins) {
        s.setLanguage(tag);
      }
      _scheduleRefresh(Duration.zero);
      _notifySoon();
    };
    final failed = <String, String>{};
    final skipped = <String, PluginManifest>{};
    final list = await startPlugins(
      pluginsDir(),
      dataRoot: p.join(supportDir(), 'plugin-data'),
      allowPrograms: allowPrograms,
      disabled: _disabledIds,
      skipped: skipped,
      failed: failed,
      onLog: (id, level, msg) => debugPrint('[plugin $id] $level: $msg'),
    );
    for (final s in list.toList()) {
      s.onStopped = _pluginStopped;
      try {
        sources.add(s);
      } on StateError {
        list.remove(s);
        failed[s.dir] = L.pluginErrIdTaken(s.id);
        await s.close();
      }
    }
    plugins = list;
    // 启动期间界面语言可能刚同步过来，再发一次（没变时插件那边忽略）
    for (final s in list) {
      s.setLanguage(PluginSource.language);
    }
    pluginErrors = failed;
    disabledPlugins = skipped;
    if (!pluginsLoaded) {
      pluginsLoaded = true;
      _pickStart();
    }
    _leaveMissingTabs();
    _direct.clear();
    _scheduleRefresh(const Duration(seconds: 1));
    _libraries.removeWhere((k, _) => k != 'local');
    accounts.clear();
    notifyListeners();
    for (final s in list) {
      if (s.can(Op.account)) _refreshAccount(s);
    }
    // 上次放的歌是插件的：插件到了才知道喜欢没有、才取得到歌词
    if (hasQueue && track.ref!.source != 'local') {
      checkLiked([track]);
      if (_lyrics.isEmpty) _loadLyrics(track);
    }
  }

  /// 每次 loadPlugins 加一：自动重启途中整体重新加载过，重启出来的就作废。
  int _pluginGen = 0;

  /// 插件目录 → 上次自动重启的时间。
  final _pluginRestarts = <String, DateTime>{};

  /// 插件运行中途停掉（死循环、内存用尽、进程崩溃）：先自动重启一次；
  /// 60 秒内又停掉就移到设置页的失败卡片，显示原因，用户点「重新加载」再启动。
  /// 音乐源的选择不动。
  void _pluginStopped(PluginSource s) {
    if (!plugins.contains(s)) return;
    debugPrint('[plugin ${s.id}] stopped: ${s.stopped}');
    final now = DateTime.now();
    final last = _pluginRestarts[s.dir];
    if (last == null || now.difference(last) > const Duration(seconds: 60)) {
      _pluginRestarts[s.dir] = now;
      _restartPlugin(s);
      return;
    }
    _dropPlugin(s, s.stopped ?? L.pluginErrStopped(s.info.name));
  }

  /// 把停掉的插件移到失败卡片。
  void _dropPlugin(PluginSource s, String why) {
    plugins = [...plugins]..remove(s);
    if (identical(sources[s.id], s)) sources.remove(s.id).ignore();
    accounts.remove(s.id);
    pluginErrors = {...pluginErrors, s.dir: why};
    showToast(why);
    _leaveMissingTabs();
    notifyListeners();
  }

  /// 重新启动停掉的插件。重启期间旧的那个留在原处（调用会直接失败），
  /// 新的起来后原地换掉：插件卡片、当前音乐源、账号都不会闪一下。
  Future<void> _restartPlugin(PluginSource old) async {
    final gen = _pluginGen;
    debugPrint('[plugin ${old.id}] 自动重启');
    final PluginSource s;
    try {
      s = await PluginSource.start(
        old.dir,
        dataRoot: p.join(supportDir(), 'plugin-data'),
        allowPrograms: allowPrograms.contains(old.id),
        onLog: (level, msg) =>
            debugPrint('[plugin ${p.basename(old.dir)}] $level: $msg'),
      );
    } catch (e) {
      if (gen == _pluginGen && plugins.contains(old)) {
        _dropPlugin(old, e is SourceError ? e.reason : '$e');
      }
      return;
    }
    // 重启期间整体重新加载过，或者旧的已经被移走了：这个不要了
    if (gen != _pluginGen || !plugins.contains(old)) {
      await s.close();
      return;
    }
    if (identical(sources[old.id], old)) sources.remove(old.id).ignore();
    try {
      sources.add(s);
    } on StateError {
      await s.close();
      _dropPlugin(old, L.pluginErrIdTaken(s.id));
      return;
    }
    s.onStopped = _pluginStopped;
    s.setLanguage(PluginSource.language);
    plugins = [for (final x in plugins) identical(x, old) ? s : x];
    if (s.id != old.id) accounts.remove(old.id);
    notifyListeners();
    if (s.can(Op.account)) _refreshAccount(s);
  }

  /// 用户允许运行本机程序的插件（host.spawn）。改了要重新加载插件才生效。
  Set<String> get allowPrograms => {
    for (final x in _prefs()['allowPrograms'] as List? ?? const []) '$x',
  };

  Future<void> setAllowPrograms(String id, bool on) async {
    final s = allowPrograms;
    on ? s.add(id) : s.remove(id);
    _savePrefs({'allowPrograms': s.toList()..sort()});
    await loadPlugins();
  }

  /// 用户停用的插件：目录 → plugin.json。不启动，只在设置页显示。
  Map<String, PluginManifest> disabledPlugins = const {};

  Set<String> get _disabledIds => {
    for (final x in _prefs()['disabledPlugins'] as List? ?? const []) '$x',
  };

  /// 启用或停用插件。停用当前音乐源时切回本地音乐。
  Future<void> setPluginEnabled(String id, bool on) async {
    final s = _disabledIds;
    on ? s.remove(id) : s.add(id);
    _savePrefs({'disabledPlugins': s.toList()..sort()});
    Analytics.instance.event(on ? 'plugin_enable' : 'plugin_disable', {
      'plugin_id': id,
    });
    if (!on && _sourceId == id) setSource('local');
    await loadPlugins();
  }

  /// 插件是从哪个链接装的（检查更新用）：id → 链接。手动放进目录的没有。
  Map<String, String> get pluginOrigins => {
    for (final e in ((_prefs()['pluginOrigins'] as Map?) ?? const {}).entries)
      '${e.key}': '${e.value}',
  };

  /// 有新版本的插件：id → 版本号。
  final Map<String, String> pluginUpdates = {};
  var _pluginUpdatesChecked = false;

  /// 检查从 GitHub 装的插件有没有新的 Release（每次启动查一次）。
  Future<void> checkPluginUpdates({bool force = false}) async {
    if (_pluginUpdatesChecked && !force) return;
    _pluginUpdatesChecked = true;
    final versions = {
      for (final s in plugins) s.id: s.info.version,
      for (final m in disabledPlugins.values) m.id: m.info.version,
    };
    for (final e in pluginOrigins.entries) {
      final gh = parseGitHub(e.value);
      final cur = versions[e.key];
      // 装的是某个分支时没有「新版本」可言
      if (gh == null || gh.ref != null || cur == null) continue;
      final v = await latestGitHubVersion(gh);
      if (v != null && compareVersions(v, cur) > 0) {
        pluginUpdates[e.key] = v;
      } else {
        pluginUpdates.remove(e.key);
      }
    }
    notifyListeners();
  }

  /// 下载插件、读出权限和能力，等用户确认。
  Future<PluginPackage> fetchPluginPackage(String link) =>
      fetchPlugin(link, pluginsRoot: pluginsDir());

  Future<PluginPackage> fetchPluginFolder(String folder) =>
      fetchPluginFromFolder(folder, pluginsRoot: pluginsDir());

  /// 装好（或更新）确认过的插件并重新加载。
  Future<void> installPluginPackage(PluginPackage pkg) async {
    final id = pkg.manifest.id;
    final old = [
      for (final s in plugins)
        if (s.id == id) s.dir,
      for (final e in disabledPlugins.entries)
        if (e.value.id == id) e.key,
    ].firstOrNull;
    await installPlugin(pkg, pluginsRoot: pluginsDir(), replace: old);
    Analytics.instance.event('plugin_install', {
      'plugin_id': id,
      'plugin_version': pkg.manifest.info.version,
      'is_update': '${old != null}',
    });
    final origins = pluginOrigins;
    pkg.origin.isEmpty ? origins.remove(id) : origins[id] = pkg.origin;
    _savePrefs({'pluginOrigins': origins});
    pluginUpdates.remove(id);
    await loadPlugins();
  }

  /// 卸载插件：删掉插件目录和它的数据（设置、登录状态、缓存）。
  Future<void> uninstallPlugin(String id, String dir) async {
    if (_sourceId == id) setSource('local');
    if (id.isNotEmpty) {
      Analytics.instance.event('plugin_uninstall', {'plugin_id': id});
    }
    // id 为空（没能加载、读不出 id 的插件）时只删插件目录
    for (final d in [
      dir,
      if (id.isNotEmpty) p.join(supportDir(), 'plugin-data', id),
    ]) {
      try {
        await Directory(d).delete(recursive: true);
      } on FileSystemException {
        // 已经没有了
      }
    }
    _savePrefs({
      'disabledPlugins': (_disabledIds..remove(id)).toList()..sort(),
      'allowPrograms': (allowPrograms..remove(id)).toList()..sort(),
      'pluginOrigins': pluginOrigins..remove(id),
    });
    pluginUpdates.remove(id);
    _dropCache(id);
    await loadPlugins();
  }

  // ───── 插件账号 ─────

  /// 插件里登录的账号；没登录的不在这里。
  final Map<String, m.Account> accounts = {};

  /// 正在登录的插件。
  final Set<String> signingIn = {};

  Future<void> _refreshAccount(Source s) async {
    try {
      final a = await s.account();
      a == null ? accounts.remove(s.id) : accounts[s.id] = a;
      // 确认了是谁（或者没登录）才换缓存的命名空间；取账号出错时不动
      _rememberAccount(s.id, a);
    } catch (e) {
      accounts.remove(s.id);
    }
    notifyListeners();
  }

  /// 保存插件设置（plugin.json 的 settings）。插件马上能读到新值；缓存的内容
  /// 和账号按新设置重新取。
  Future<void> setPluginSettings(
    PluginSource s,
    Map<String, String> values,
  ) async {
    var changed = false;
    for (final e in values.entries) {
      if (s.setting(e.key) != e.value) {
        await s.setSetting(e.key, e.value);
        changed = true;
      }
    }
    if (!changed) return;
    _dropCache(s.id);
    _libraries.remove(s.id);
    if (s.can(Op.account)) {
      await _refreshAccount(s);
    } else {
      notifyListeners();
    }
  }

  /// 插件登录时要显示的东西（host.signInPrompt）：二维码和说明。
  SignInPrompt? signInPrompt;

  // 每次登录一个编号；取消后，插件晚到的结果不再算数。
  final Map<String, int> _signInGen = {};

  Future<Object?> _signInPrompted(
    PluginSource plugin,
    Map<String, Object?> args,
  ) async {
    if (!signingIn.contains(plugin.id)) return null;
    signInPrompt = SignInPrompt(
      source: plugin.id,
      name: plugin.info.name,
      qr: '${args['qr'] ?? ''}',
      text: '${args['text'] ?? ''}',
    );
    notifyListeners();
    return null;
  }

  Future<void> signIn(Source s) async {
    if (!signingIn.add(s.id)) return;
    final gen = _signInGen[s.id] = (_signInGen[s.id] ?? 0) + 1;
    bool current() => _signInGen[s.id] == gen;
    notifyListeners();
    try {
      final a = await s.signIn();
      if (!current()) return;
      if (a != null) accounts[s.id] = a;
      // 换成这个账号的缓存；插件没给账号时去问一次
      if (a != null) {
        _rememberAccount(s.id, a);
      } else if (s.can(Op.account)) {
        await _refreshAccount(s);
      }
      _scheduleRefresh(Duration.zero);
      showToast(a == null ? L.stateSignedIn : L.toastSignedInAs(a.name));
    } on SourceError catch (e) {
      if (current()) {
        showToast(e.reason.isEmpty ? L.toastNotSignedIn : e.reason);
      }
    } finally {
      if (current()) {
        signingIn.remove(s.id);
        if (signInPrompt?.source == s.id) signInPrompt = null;
        notifyListeners();
      }
    }
  }

  /// 关掉登录窗口：不再等这次登录。
  void cancelSignIn() {
    final id = signInPrompt?.source;
    signInPrompt = null;
    if (id != null) {
      _signInGen[id] = (_signInGen[id] ?? 0) + 1;
      signingIn.remove(id);
    }
    notifyListeners();
  }

  Future<void> signOut(Source s) async {
    try {
      await s.signOut();
    } on SourceError catch (e) {
      showToast(e.reason.isEmpty ? L.toastSignOutFailed : e.reason);
      return;
    }
    accounts.remove(s.id);
    // 回到未登录的那套缓存；这个账号的留着，再登录时马上能用
    _rememberAccount(s.id, null);
    _scheduleRefresh(Duration.zero);
    notifyListeners();
  }

  // ───── 当前音乐源 ─────
  // 在设置里选：本地音乐，或某个插件。选了插件后，音乐库、搜索、专辑、歌手、
  // 歌单页显示这个插件的内容。换源时清空播放队列，关掉正在播放。

  String _sourceId = _prefs()['source'] as String? ?? 'local';

  /// 当前源的 id。选中的插件没加载时退回本地。
  String get sourceId => sources[_sourceId] != null ? _sourceId : 'local';

  /// 当前源是插件。
  bool get remote => sourceId != 'local';

  void setSource(String id) {
    if (id == sourceId) return;
    _sourceId = id;
    _savePrefs({'source': id});
    Analytics.instance.event('source_change', {'music_source': id});
    // 上一个源的歌不留在队列里
    npOpen = false;
    clearQueue();
    _scheduleRefresh();
    _resetToStart();
    notifyListeners();
  }

  static String _prefsPath() => p.join(supportDir(), 'prefs.json');

  static Map<String, Object?> _prefs() {
    try {
      final v = jsonDecode(File(_prefsPath()).readAsStringSync());
      return v is Map<String, Object?> ? v : const {};
    } catch (_) {
      return const {};
    }
  }

  static void _savePrefs(Map<String, Object?> change) {
    try {
      final f = File(_prefsPath());
      f.parent.createSync(recursive: true);
      f.writeAsStringSync(jsonEncode({..._prefs(), ...change}));
    } on FileSystemException catch (e) {
      debugPrint('prefs: $e');
    }
  }

  /// 插件页面的路由：`/album/@源/id`，id 编码后不含 /。
  static String remoteRoute(String kind, String source, String id) =>
      '/$kind/@$source/${Uri.encodeComponent(id)}';

  // ───── 插件数据缓存（SWR） ─────
  // 有缓存就先给（旧的也给），旧了就在后台重取，取到后通知界面换上。插件源的
  // 原始 JSON 存盘，重启后马上有内容。key 是「源@账号/路径」：换账号就是换一套
  // 缓存，旧账号的留着，切回来不用重新加载。

  final SwrStore cache = SwrStore(dir: p.join(supportDir(), 'cache', 'api'));
  final AudioDiskCache audioCache = AudioDiskCache(
    dir: p.join(supportDir(), 'cache', 'audio'),
  );
  StreamSubscription<String>? _cacheSub;

  /// 本地音乐这类不进缓存的源：取到的放在内存里，这次运行有效。
  final Map<String, Object?> _direct = {};
  final Map<String, Future<Object?>> _directInflight = {};

  /// 每个源上次确认的账号 id（存在 prefs）：启动时账号还没取到，先按它找缓存。
  final Map<String, String> _accountIds = {
    for (final e in ((_prefs()['accountIds'] as Map?) ?? const {}).entries)
      '${e.key}': '${e.value}',
  };

  void _rememberAccount(String source, m.Account? a) {
    final id = a?.id ?? '';
    if ((_accountIds[source] ?? '') == id) return;
    id.isEmpty ? _accountIds.remove(source) : _accountIds[source] = id;
    _savePrefs({'accountIds': _accountIds});
  }

  /// 「源@账号」：缓存的命名空间。
  String cacheSpace(String source) {
    final a = _accountIds[source] ?? '';
    return '$source@${a.isEmpty ? 'guest' : a}';
  }

  String _cacheKey(DataReq<Object?> r) =>
      '${cacheSpace(r.source)}/${PluginSource.language}/${r.path}';

  void _watchCache() {
    _cacheSub ??= cache.changes.listen((_) => _notifySoon());
  }

  /// 好几条缓存一起更新时只通知一次。
  bool _notifyQueued = false;
  void _notifySoon() {
    if (_notifyQueued) return;
    _notifyQueued = true;
    scheduleMicrotask(() {
      _notifyQueued = false;
      notifyListeners();
    });
  }

  /// 现在有的数据（旧的也给）；旧了顺便在后台重取。没有返回 null。
  T? peekData<T>(DataReq<T> r) {
    final s = sources[r.source];
    if (s == null) return null;
    if (s is! PluginSource) {
      final k = '${r.source}/${r.path}';
      return _direct.containsKey(k) ? _direct[k] as T : null;
    }
    _watchCache();
    final key = _cacheKey(r);
    final e = cache.peek(key, r.policy);
    cache.revalidate(key, r.policy, () => s.raw(r.op, r.params, r.trackList));
    return e?.value(r.decode);
  }

  /// 取新的（同一份正在取就等它）。
  Future<T> loadData<T>(DataReq<T> r) async {
    final s = sources[r.source];
    if (s == null) {
      throw SourceError(SourceErrorKind.failed, L.sourceNotFound);
    }
    if (s is! PluginSource) {
      final k = '${r.source}/${r.path}';
      final v = await (_directInflight[k] ??= r
          .direct(s)
          // 不能写成 `=> remove(k)`：返回值就是这个 future，会自己等自己
          .whenComplete(() {
            _directInflight.remove(k);
          }));
      _direct[k] = v;
      return v as T;
    }
    _watchCache();
    final raw = await cache.fetch(
      _cacheKey(r),
      r.policy,
      () => s.raw(r.op, r.params, r.trackList),
    );
    return r.decode(raw);
  }

  /// 不在页面里用的数据：有缓存马上返回（旧了后台重取），没有就等新的。
  Future<T> getData<T>(DataReq<T> r) async => peekData(r) ?? await loadData(r);

  /// 缓存里的这份数据作废（比如改了歌单）：下次用到时重取。
  void dropData(DataReq<Object?> r) {
    cache.invalidate(_cacheKey(r));
    _direct.remove('${r.source}/${r.path}');
  }

  /// 清掉一个源所有账号的缓存（插件设置改了，比如换了服务器地址或音质）。
  void _dropCache(String id) {
    cache.invalidate('$id@');
    audioCache.invalidate('$id@');
    if (_preloadedStream?.source == id) _preloadedStream = null;
    if (_preloadingAudioKey != null &&
        _preloadingAudioKey!.startsWith('$id@')) {
      _cancelPreload();
    }
    _direct.removeWhere((k, _) => k.startsWith('$id/'));
    _scheduleRefresh();
  }

  // ── 空闲时预取 ──
  // 插件加载完、切换源、登录退出后，在后台把当前源的首页和发现默认页取好；
  // 之后每 5 分钟看一眼，旧了就重取。页面打开时已经有内容。

  Timer? _refreshTimer;

  void _scheduleRefresh([Duration delay = const Duration(seconds: 2)]) {
    _refreshTimer?.cancel();
    _refreshTimer = Timer(delay, _refreshIdle);
  }

  void _refreshIdle() {
    final s = remote ? sources[sourceId] : null;
    if (s is PluginSource) {
      _watchCache();
      for (final r in [
        if (s.can(Op.home)) DataReq.home(s.id),
        if (s.can(Op.browse)) DataReq.browse(s.id, ''),
      ]) {
        cache.revalidate(
          _cacheKey(r),
          r.policy,
          () => s.raw(r.op, r.params, r.trackList),
        );
      }
    }
    _scheduleRefresh(const Duration(minutes: 5));
  }

  // 插件专辑：转成界面的 Album，和本地专辑一样由 AlbumPage 显示。
  final Map<String, Album> _remoteAlbums = {};

  /// 记下插件专辑，返回 AlbumPage 用的 id。
  String putAlbum(String source, m.AlbumPage page) {
    final a = page.album;
    final id = '@$source/${a.id}';
    final first = a.artists.firstOrNull;
    _remoteAlbums[id] = _withCachedRelease(
      Album(
        id: id,
        title: a.name,
        artist: a.artists.map((x) => x.name).join(', '),
        cover: a.imageUrl,
        year: a.year ?? 0,
        released: DateTime.tryParse(a.released),
        copyright: a.copyright,
        spine: 42,
        artistRoute: first == null || first.id.isEmpty
            ? ''
            : remoteRoute('artist', source, first.id),
      ),
    );
    _albumTracks[id] = [
      for (final t in page.tracks)
        if (!t.unavailable)
          Track.of(t.source.isEmpty ? t.withSource(source) : t),
    ];
    a.saved ? savedAlbums.add(id) : savedAlbums.remove(id);
    checkLiked(_albumTracks[id]!);
    return id;
  }

  // ───── 音乐库 ─────
  // 音乐库四个标签（歌曲、专辑、歌单、艺人）的数据，按源分开，第一次打开时
  // 从源加载并缓存。有 library 的源（本地、Subsonic 这类自建服务器）是整个
  // 曲库；流媒体源用喜欢的歌、收藏的专辑。艺人没有单独的数据时，从歌曲和
  // 专辑里统计。

  final Map<String, SourceLibrary> _libraries = {};

  /// 当前源的音乐库。本地没扫到音乐时为 null，界面显示空状态。
  SourceLibrary? get library {
    final id = sourceId;
    if (id == 'local' && !hasLibrary) return null;
    final s = sources[id];
    if (s == null) return null;
    return _libraries.putIfAbsent(id, () {
      final lib = SourceLibrary();
      scheduleMicrotask(() => _loadLibrary(s, lib));
      return lib;
    });
  }

  /// 在后台重取当前插件源的音乐库（在音乐平台的官方客户端里喜欢、收藏的歌要
  /// 这样才看得到）。界面上的列表不清空，取到后整体换上。30 秒内取过就不取。
  void refreshLibrary() {
    final s = sources[sourceId];
    final lib = _libraries[sourceId];
    if (s is! PluginSource || lib == null) return;
    if (lib.refreshing || lib.loading.isNotEmpty) return;
    final now = DateTime.now();
    if (now.difference(lib.loadedAt) < const Duration(seconds: 30)) return;
    lib.loadedAt = now;
    lib.refreshing = true;
    _loadPluginLibrary(
      s,
      lib,
      s.can(Op.library),
      () => _libraries[s.id] != lib,
    ).whenComplete(() => lib.refreshing = false);
  }

  /// 在音乐库或 Coverflow 页时重取音乐库：进入这些页面、窗口回到前台时调用。
  void _refreshLibraryIfShown() {
    if (path.startsWith('/library') || path.startsWith('/coverflow')) {
      refreshLibrary();
    }
  }

  /// 窗口回到前台。
  void onAppResume() => _refreshLibraryIfShown();

  /// 重新加载当前源的音乐库。
  void reloadLibrary() {
    _libraries.remove(sourceId);
    notifyListeners();
  }

  Future<void> _loadLibrary(Source s, SourceLibrary lib) async {
    bool stale() => _libraries[s.id] != lib;
    Future<void> part(String name, Future<void> Function() load) async {
      lib.loading.add(name);
      lib.errors.remove(name);
      notifyListeners();
      try {
        await load();
      } catch (e) {
        lib.errors[name] = e;
      } finally {
        lib.loading.remove(name);
        if (!stale()) notifyListeners();
      }
    }

    // 一页一页取，每页到了就显示。
    Future<List<T>> pages<T>(
      Future<(List<T>, bool)> Function(int offset) load,
      void Function(List<T>) show,
    ) async {
      final all = <T>[];
      for (var i = 0; i < 400; i++) {
        final (got, more) = await load(all.length);
        if (stale()) break;
        all.addAll(got);
        show(List.unmodifiable(all));
        notifyListeners();
        if (!more || got.isEmpty) break;
      }
      return all;
    }

    final whole = s.can(Op.library);
    if (s is PluginSource) return _loadPluginLibrary(s, lib, whole, stale);
    List<m.Artist> artists = const [];
    await Future.wait([
      part('tracks', () async {
        if (!whole && !s.can(Op.liked)) return;
        await pages<Track>((offset) async {
          if (whole) {
            final r = await s.library(m.SearchKind.tracks, offset: offset);
            return (
              r.tracks.map((t) => Track.of(t.withSource(s.id))).toList(),
              r.more,
            );
          }
          final r = await s.liked(offset: offset);
          return (
            r.tracks.map((t) => Track.of(t.withSource(s.id))).toList(),
            r.more,
          );
        }, (v) => lib.tracks = v);
      }),
      part('albums', () async {
        if (s.id == 'local') {
          lib.albums = libraryAlbums;
          return;
        }
        if (!whole && !s.can(Op.savedAlbums)) return;
        await pages<Album>((offset) async {
          if (whole) {
            final r = await s.library(m.SearchKind.albums, offset: offset);
            return (r.albums.map((a) => _shelfAlbum(s.id, a)).toList(), r.more);
          }
          final r = await s.savedAlbums(offset: offset);
          return (r.map((a) => _shelfAlbum(s.id, a)).toList(), r.isNotEmpty);
        }, (v) => lib.albums = v);
        if (!stale()) await _fillReleased(s, lib, stale);
      }),
      part('playlists', () async {
        if (s.can(Op.playlists)) lib.playlists = await s.playlists();
      }),
      if (whole)
        part('artists', () async {
          artists = await pages<m.Artist>((offset) async {
            final r = await s.library(m.SearchKind.artists, offset: offset);
            return (r.artists, r.more);
          }, (_) {});
        }),
    ]);
    if (stale()) return;
    lib.artists = _libraryArtists(s.id, lib, artists);
    notifyListeners();
  }

  /// 插件源的音乐库：每部分取完整份存进缓存（原始 JSON）。下次打开先显示
  /// 存的那份，后台全部重取完再整份换上；没存过的才一页一页显示、显示骨架。
  Future<void> _loadPluginLibrary(
    PluginSource s,
    SourceLibrary lib,
    bool whole,
    bool Function() stale,
  ) async {
    List<m.Artist> artists = const [];
    void artistsChanged() {
      lib.artists = _libraryArtists(s.id, lib, artists);
    }

    Future<void> snap(
      String name,
      String op, {
      Map<String, Object?> params = const {},
      String? field,
      bool paged = true,
      required void Function(List<Object?> raw) show,
    }) async {
      final key = '${cacheSpace(s.id)}/library/$name';
      final had = (await cache.read(key, Policies.mine))?.data;
      if (stale()) return;
      lib.errors.remove(name);
      if (had is List) {
        try {
          show(had);
          artistsChanged();
        } catch (_) {
          // 存的格式不对就当没有
        }
      } else {
        lib.loading.add(name);
      }
      notifyListeners();
      try {
        final all = <Object?>[];
        for (var i = 0; i < 400; i++) {
          final v = await s.raw(op, {
            ...params,
            if (paged) 'offset': all.length,
          });
          if (stale()) return;
          final items =
              (field == null ? v : (v as Map?)?[field]) as List? ?? const [];
          all.addAll(items);
          final more =
              paged &&
              (field == null ? items.isNotEmpty : (v as Map)['more'] == true);
          if (had is! List) {
            show(all);
            notifyListeners();
          }
          if (!more || items.isEmpty) break;
        }
        cache.put(key, Policies.mine, all);
        show(all);
        artistsChanged();
      } catch (e) {
        if (had is! List) lib.errors[name] = e;
      } finally {
        lib.loading.remove(name);
        if (!stale()) notifyListeners();
      }
    }

    List<T> each<T>(List<Object?> raw, T Function(m.Json j) f) =>
        List.unmodifiable([
          for (final x in raw)
            if (x is Map) f(x.cast<String, Object?>()),
        ]);
    Track track(m.Json j) => Track.of(m.Track.fromJson(j).withSource(s.id));
    Album album(m.Json j) => _shelfAlbum(s.id, m.Album.fromJson(j));

    await Future.wait([
      if (whole)
        snap(
          'tracks',
          Op.library,
          params: const {'kind': 'tracks'},
          field: 'tracks',
          show: (r) => lib.tracks = each(r, track),
        )
      else if (s.can(Op.liked))
        snap(
          'tracks',
          Op.liked,
          field: 'tracks',
          show: (r) => lib.tracks = each(r, track),
        ),
      if (whole || s.can(Op.savedAlbums))
        snap(
          'albums',
          whole ? Op.library : Op.savedAlbums,
          params: whole ? const {'kind': 'albums'} : const {},
          field: whole ? 'albums' : null,
          show: (r) => lib.albums = each(r, album),
        ).then((_) {
          if (!stale()) return _fillReleased(s, lib, stale);
        }),
      if (s.can(Op.playlists))
        snap(
          'playlists',
          Op.playlists,
          paged: false,
          show: (r) => lib.playlists = each(r, m.Playlist.fromJson),
        ),
      if (whole)
        snap(
          'artists',
          Op.library,
          params: const {'kind': 'artists'},
          field: 'artists',
          show: (r) => artists = each(r, m.Artist.fromJson),
        ),
    ]);
    if (stale()) return;
    artistsChanged();
    notifyListeners();
  }

  /// 专辑发行日期的缓存（专辑 id → yyyy-MM-dd，查过但不知道的是空串），
  /// 存在缓存目录里，免得每次启动都去查一遍专辑详情。
  Map<String, String>? _released;
  File get _releasedFile => File(p.join(_cacheDir(), 'released.json'));

  Map<String, String> _releasedCache() {
    if (_released != null) return _released!;
    try {
      final j = jsonDecode(_releasedFile.readAsStringSync()) as Map;
      return _released = j.cast<String, String>();
    } catch (_) {
      return _released = {};
    }
  }

  /// 音乐库列表没带发行日期的专辑，逐个查专辑详情补上，查完一起换上去。
  Future<void> _fillReleased(
    Source s,
    SourceLibrary lib,
    bool Function() stale,
  ) async {
    if (!s.can(Op.album)) return;
    final cache = _releasedCache();
    final todo = [
      for (final a in lib.albums)
        if (a.released == null && !cache.containsKey(a.id)) a.id,
    ];
    if (todo.isEmpty) return;
    final prefix = '@${s.id}/';
    var next = 0;
    Future<void> worker() async {
      while (next < todo.length && !stale()) {
        final id = todo[next++];
        try {
          final page = await s.album(id.substring(prefix.length));
          cache[id] = page.album.released;
        } catch (_) {
          // 查不到就下次再试
        }
      }
    }

    await Future.wait([for (var i = 0; i < 6; i++) worker()]);
    try {
      _releasedFile.parent.createSync(recursive: true);
      _releasedFile.writeAsStringSync(jsonEncode(cache));
    } catch (_) {}
    if (stale()) return;
    lib.albums = List.unmodifiable([
      for (final a in lib.albums) _withCachedRelease(a),
    ]);
    for (final a in lib.albums) {
      if (_remoteAlbums.containsKey(a.id)) _remoteAlbums[a.id] = a;
    }
  }

  Album _withCachedRelease(Album a) {
    if (a.released != null) return a;
    final d = DateTime.tryParse(_releasedCache()[a.id] ?? '');
    return d == null ? a : a.withReleased(d);
  }

  Album _shelfAlbum(String source, m.Album a) {
    final id = '@$source/${a.id}';
    final first = a.artists.firstOrNull;
    final al = _withCachedRelease(
      Album(
        id: id,
        title: a.name,
        artist: a.artists.map((x) => x.name).join(', '),
        cover: a.imageUrl,
        year: a.year ?? 0,
        added: DateTime.tryParse(a.added)?.toLocal(),
        released: DateTime.tryParse(a.released),
        copyright: a.copyright,
        // 不知道曲目数，书脊宽度按 id 散开在设计稿的 42~64 之间
        spine: 42 + (a.id.hashCode % 23).abs().toDouble(),
        artistRoute: first == null || first.id.isEmpty
            ? ''
            : remoteRoute('artist', source, first.id),
      ),
    );
    _remoteAlbums.putIfAbsent(id, () => al);
    return al;
  }

  /// 气泡里的艺人：源给的全部艺人，或者从歌曲、专辑里统计出来的；按歌曲数
  /// （没有歌曲时按专辑数）从多到少。
  List<LibraryArtist> _libraryArtists(
    String source,
    SourceLibrary lib,
    List<m.Artist> given,
  ) {
    final count = <String, int>{}, cover = <String, String>{};
    final found = <String, m.Artist>{};
    String k(m.Artist a) => a.id.isNotEmpty ? a.id : a.name.toLowerCase();
    for (final t in lib.tracks) {
      for (final a in t.ref?.artists ?? const <m.Artist>[]) {
        count[k(a)] = (count[k(a)] ?? 0) + 1;
        found.putIfAbsent(k(a), () => a);
        if (t.cover.isNotEmpty) cover.putIfAbsent(k(a), () => t.cover);
      }
    }
    final byName = <String, String>{};
    for (final al in lib.albums) {
      for (final n in al.artist.split(', ')) {
        byName.putIfAbsent(n.toLowerCase(), () => al.cover);
        if (lib.tracks.isEmpty) {
          count[n.toLowerCase()] = (count[n.toLowerCase()] ?? 0) + 1;
          found.putIfAbsent(n.toLowerCase(), () => m.Artist(id: '', name: n));
        }
      }
    }
    final list = given.isNotEmpty ? given : found.values.toList();
    final out = [
      for (final a in list)
        if (a.name.isNotEmpty)
          LibraryArtist(
            id: a.id,
            name: a.name,
            cover: a.imageUrl.isNotEmpty
                ? a.imageUrl
                : cover[k(a)] ?? byName[a.name.toLowerCase()] ?? '',
            hasAvatar: a.imageUrl.isNotEmpty,
            route: a.id.isEmpty ? '' : remoteRoute('artist', source, a.id),
            weight: count[k(a)] ?? count[a.name.toLowerCase()] ?? 0,
          ),
    ]..sort((a, b) => b.weight.compareTo(a.weight));
    return out;
  }

  /// 播放一张专辑；插件的专辑还没取过曲目时先取。
  Future<void> playAlbumById(String id) async {
    if (albumTracks(id)?.isNotEmpty ?? false) return playAlbum(id);
    final i = id.indexOf('/');
    if (!id.startsWith('@') || i < 2) return;
    final s = sources[id.substring(1, i)];
    if (s == null) return;
    try {
      putAlbum(s.id, await s.album(id.substring(i + 1)));
      playAlbum(id);
    } on SourceError catch (e) {
      showToast(e.reason.isEmpty ? L.toastPlayAlbumFailed : e.reason);
    }
  }

  /// 播放一个歌单。
  Future<void> playPlaylist(String source, String id) async {
    final s = sources[source];
    if (s == null) return;
    try {
      final p = await s.playlist(id);
      playList(
        [
          for (final t in p.tracks)
            if (!t.unavailable) Track.of(t.withSource(source)),
        ],
        from: 'playlist:$source/$id',
        name: p.name,
      );
    } on SourceError catch (e) {
      showToast(e.reason.isEmpty ? L.toastPlayPlaylistFailed : e.reason);
    }
  }

  /// 随机播放一位艺人的所有歌曲。
  Future<void> playArtistShuffle(
    String source, {
    required String id,
    required String name,
  }) async {
    final s = sources[source];
    List<Track> tracks = const [];
    if (s != null && id.isNotEmpty && s.can(Op.artist)) {
      try {
        final page = await getData(DataReq.artist(source, id));
        tracks = [
          for (final t in page.tracks)
            if (!t.unavailable) Track.of(t.withSource(source)),
        ];
      } on SourceError catch (e) {
        tracks = _libraryTracksForArtist(source, id: id, name: name);
        if (tracks.isEmpty) {
          showToast(e.reason.isEmpty ? L.stateLoadFailed : e.reason);
          return;
        }
      }
    }
    if (tracks.isEmpty) {
      tracks = _libraryTracksForArtist(source, id: id, name: name);
    }
    if (tracks.isEmpty) return;
    final shuffled = List.of(tracks)..shuffle();
    final key = id.isNotEmpty ? id : name.toLowerCase();
    playList(shuffled, from: 'artist:$source/$key', name: name);
  }

  List<Track> _libraryTracksForArtist(
    String source, {
    required String id,
    required String name,
  }) {
    final lib = _libraries[source];
    if (lib == null) return const [];
    final lower = name.toLowerCase();
    return [
      for (final t in lib.tracks)
        if (_trackHasArtist(t, id: id, lowerName: lower)) t,
    ];
  }

  bool _trackHasArtist(
    Track t, {
    required String id,
    required String lowerName,
  }) {
    final artists = t.ref?.artists;
    if (artists != null && artists.isNotEmpty) {
      return artists.any(
        (a) =>
            (id.isNotEmpty && a.id == id) || a.name.toLowerCase() == lowerName,
      );
    }
    return t.artist.split(', ').any((n) => n.trim().toLowerCase() == lowerName);
  }

  // ───── 搜索记录 ─────
  // 最近搜索的词、从搜索结果里点开过的东西，存在 search_history.json。

  static String _historyPath() => p.join(supportDir(), 'search_history.json');

  late List<String> searchQueries;
  late List<SearchHit> searchHits;

  void _loadSearchHistory() {
    searchQueries = [];
    searchHits = [];
    try {
      final f = File(_historyPath());
      if (!f.existsSync()) return;
      final j = (jsonDecode(f.readAsStringSync()) as Map)
          .cast<String, Object?>();
      searchQueries = [
        for (final x in j['queries'] as List? ?? const [])
          if (x is String && x.isNotEmpty) x,
      ];
      searchHits = [
        for (final x in j['hits'] as List? ?? const [])
          if (x is Map) SearchHit.fromJson(x.cast()),
      ];
    } catch (e) {
      debugPrint('search history: $e');
    }
  }

  void _saveSearchHistory() {
    try {
      final f = File(_historyPath());
      f.parent.createSync(recursive: true);
      f.writeAsStringSync(
        jsonEncode({
          'queries': searchQueries,
          'hits': [for (final h in searchHits) h.toJson()],
        }),
      );
    } catch (e) {
      debugPrint('search history: $e');
    }
  }

  /// 记下一个搜过的词，放到最前面。
  void rememberQuery(String q) {
    q = q.trim();
    if (q.isEmpty) return;
    searchQueries = [
      q,
      ...searchQueries.where((x) => x != q),
    ].take(12).toList();
    _saveSearchHistory();
    notifyListeners();
  }

  /// 记下从搜索结果里点开的东西，放到最前面。
  void rememberHit(SearchHit h) {
    searchHits = [
      h,
      ...searchHits.where((x) => x.key != h.key),
    ].take(8).toList();
    _saveSearchHistory();
    notifyListeners();
  }

  void forgetHit(SearchHit h) {
    searchHits = searchHits.where((x) => x.key != h.key).toList();
    _saveSearchHistory();
    notifyListeners();
  }

  void clearSearchQueries() {
    searchQueries = [];
    _saveSearchHistory();
    notifyListeners();
  }

  /// 某个源的热门搜索（缓存一小时）。源不支持或取不到就是空的。
  Future<List<m.HotSearch>> hotSearches(String source) {
    final s = sources[source];
    if (s == null || !s.can(Op.hotSearches)) return Future.value(const []);
    return getData(DataReq.hotSearches(source))
        .catchError((Object e) => <m.HotSearch>[]);
  }

  // ───── 播放器 ─────
  // 队列里的歌交给 AudioEngine 播放。
  List<Track> queue = [];

  /// 队列里有能播的歌。
  bool get hasQueue => queue.any((t) => t.ref != null);
  int index = const int.fromEnvironment('TRACK');

  /// 当前这首；队列为空时是一首空白的歌（界面不显示播放器）。
  Track get track => queue.isEmpty ? Track.none : queue[index];
  @visibleForTesting
  Track? get nextTrack => index + 1 < queue.length
      ? queue[index + 1]
      : (repeat && queue.isNotEmpty ? queue.first : null);

  /// 接下来要放的歌。
  List<Track> get upNext => hasQueue ? queue.sublist(index + 1) : const [];

  bool playing = false;

  // ───── 记住播放状态 ─────
  // 队列、第几首、进度、来源存在 player.json；下次启动恢复成暂停状态。
  // 只存真实歌曲，没放过真实歌曲就什么都不存，悬浮播放器也不显示。

  static String _playerPath() => p.join(supportDir(), 'player.json');
  Timer? _playerSave;
  String _playerSaved = '';

  void _restorePlayer() {
    try {
      final f = File(_playerPath());
      if (!f.existsSync()) return;
      final j = (jsonDecode(f.readAsStringSync()) as Map)
          .cast<String, Object?>();
      final ts = [
        for (final x in j['tracks'] as List? ?? const [])
          if (x is Map) Track.of(m.Track.fromJson(x.cast())),
      ];
      if (ts.isEmpty) return;
      queue = ts;
      index = ((j['index'] as num?)?.toInt() ?? 0).clamp(0, ts.length - 1);
      position = ((j['position'] as num?)?.toDouble() ?? 0).clamp(
        0,
        track.seconds.toDouble(),
      );
      queueFrom = j['from'] as String? ?? '';
      _queueName = j['name'] as String? ?? '';
      shuffle = j['shuffle'] == true;
      repeat = j['repeat'] != false;
      playing = false;
    } catch (e) {
      debugPrint('player: $e');
    }
  }

  /// 状态变了：最多每 2 秒写一次。
  void _savePlayerSoon() {
    if (_playerSave?.isActive ?? false) return;
    _playerSave = Timer(const Duration(seconds: 2), _savePlayer);
  }

  void _savePlayer() {
    if (!hasQueue) return;
    final real = [
      for (final t in queue)
        if (t.ref != null) t,
    ];
    final text = jsonEncode({
      'tracks': [for (final t in real) t.ref!.toJson()],
      'index': math.max(0, real.indexOf(track)),
      'position': position.floorToDouble(),
      'from': queueFrom,
      'name': _queueName,
      'shuffle': shuffle,
      'repeat': repeat,
    });
    if (text == _playerSaved) return;
    _playerSaved = text;
    try {
      final f = File(_playerPath());
      f.parent.createSync(recursive: true);
      f.writeAsStringSync(text);
    } catch (e) {
      debugPrint('player: $e');
    }
  }

  /// 当前队列是从哪里放的：`album:<专辑 id>`、`playlist:<源>/<歌单 id>`、
  /// `library`（音乐库的歌曲）；其他（一组歌、示例队列）为空。
  String queueFrom = '';

  /// 「正在播放 · 来自 …」里的名字：专辑名、歌单名、「音乐库」等；空的不显示。
  /// 音乐库的名字显示时才翻译：存下来的是放歌时的语言，换语言后会对不上。
  String get queueName => queueFrom == 'library' ? L.navLibrary : _queueName;
  String _queueName = '';

  /// 「来自 …」能点进去的页面：来源是专辑或歌单时有，电台、搜索结果、音乐库这类没有。
  String? get queueFromRoute {
    final f = queueFrom;
    if (f.startsWith('album:') && f.length > 6) {
      return albumRoute(f.substring(6));
    }
    if (f.startsWith('playlist:')) {
      final v = f.substring(9);
      final i = v.indexOf('/');
      if (i > 0) {
        return remoteRoute('playlist', v.substring(0, i), v.substring(i + 1));
      }
    }
    return null;
  }

  /// 一首歌的专辑页；源不支持或不知道是哪张专辑时为 null。
  String? albumRouteOf(Track t) {
    final r = t.ref;
    if (r == null || r.album.id.isEmpty) return null;
    final s = sources[r.source];
    if (s == null || !s.can(Op.album)) return null;
    return remoteRoute('album', r.source, r.album.id);
  }

  /// 某个源里一位艺人的页面；源不支持或没有 id 时为 null。
  String? artistRouteFor(String source, String id) {
    final s = sources[source];
    if (id.isEmpty || s == null || !s.can(Op.artist)) return null;
    return remoteRoute('artist', source, id);
  }

  /// 去某个页面；正在播放开着就先收起。
  void open(String route) {
    npOpen = false;
    go(route);
    notifyListeners();
  }

  /// 随机播放前的队列顺序，关掉随机时恢复。
  List<Track>? _unshuffled;

  /// 播放进度（秒）。单独做成 ValueNotifier，只让进度相关的组件每帧重建。
  final ValueNotifier<double> pos = ValueNotifier(0);
  double get position => pos.value;
  set position(double v) => pos.value = v;
  double get progress =>
      track.seconds == 0 ? 0 : (position / track.seconds).clamp(0.0, 1.0);

  /// 滑块位置；实际响度按 AudioEngine.mpvVolume 的指数曲线换算。
  /// 0.72 约 −11 dB，和改曲线前默认的 0.65 一样响。
  // 音量和静音记在 prefs 里，重启后还是上次的
  double volume = ((_prefs()['volume'] as num?) ?? 0.72).toDouble().clamp(
    0.0,
    1.0,
  );
  bool muted = _prefs()['muted'] == true;
  Timer? _volumeSave;

  /// 拖音量条时一直在变，停下来半秒后再写盘。
  void _saveVolumeSoon() {
    _volumeSave?.cancel();
    _volumeSave = Timer(
      const Duration(milliseconds: 500),
      () => _savePrefs({'volume': volume, 'muted': muted}),
    );
  }

  bool shuffle = false;
  bool repeat = true;
  final Set<String> liked = {};

  bool get isLiked => liked.contains(track.key);

  AudioEngine? _engine;

  /// 引擎里当前加载的是哪首歌（Track.key）。
  String? _loadedKey;

  /// 引擎里真正已经打开的是哪首歌。切歌后、新歌打开前它还是旧歌（或空），
  /// 旧歌的进度和「播完」都不能算到新歌头上。
  String? _engineKey;
  bool get _real => track.ref != null;
  bool get _engineOnTrack => _real && _engineKey == track.key;

  AudioEngine get _eng => _engine ??= _makeEngine();

  AudioEngine _makeEngine() {
    final e = AudioEngine();
    e.onPosition = (d) {
      if (!_engineOnTrack || _scrubbing || _seeking > 0) return;
      // mpv 每秒上报很多次位置；界面 10 次/秒足够，往回跳（seek）时立即更新。
      final v = d.inMilliseconds / 1000;
      if (v < position || v - position >= 0.1) position = v;
    };
    e.onCompleted = () {
      if (_engineOnTrack) next();
    };
    e.onError = (msg) => showToast(L.toastPlaybackError(msg));
    e.setVolume(effectiveVolume);
    return e;
  }

  void _stopEngine() {
    _cancelPreload();
    if (_loadedKey == null && _engineKey == null) return;
    _loadedKey = null;
    _engineKey = null;
    _engine?.stop();
  }

  String? _cachingAudioKey;
  Timer? _preloadTimer;
  String? _preloadKey;
  String? _preloadingAudioKey;
  ({String key, String source, m.AudioStream stream, DateTime at})?
  _preloadedStream;
  static const _preloadStreamTtl = Duration(minutes: 10);

  Track? get _nextTrack {
    if (queue.isEmpty) return null;
    if (index + 1 < queue.length) return queue[index + 1];
    if (repeat && queue.length > 1) return queue[0];
    return null;
  }

  void _cancelPreload({String? keepAudioKey}) {
    _preloadTimer?.cancel();
    _preloadTimer = null;
    _preloadKey = null;
    if (_preloadingAudioKey != null &&
        _preloadingAudioKey != keepAudioKey &&
        _preloadingAudioKey != _cachingAudioKey) {
      audioCache.cancel(_preloadingAudioKey!);
    }
    _preloadingAudioKey = null;
  }

  m.AudioStream? _takePreloadedStream(String key) {
    final p = _preloadedStream;
    if (p == null) return null;
    if (p.key != key) return null;
    _preloadedStream = null;
    if (DateTime.now().difference(p.at) >= _preloadStreamTtl) return null;
    return p.stream;
  }

  /// 当前歌稳定播放后，在后台预载下一首的歌词和音源。
  void _schedulePreloadNext([
    Duration delay = const Duration(milliseconds: 1200),
  ]) {
    _preloadTimer?.cancel();
    _preloadTimer = null;
    if (!playing) return;
    final next = _nextTrack;
    if (next == null || next.key == track.key || next.ref == null) {
      _cancelPreload();
      return;
    }
    _preloadTimer = Timer(delay, () => _preloadNext(next));
  }

  Future<void> _preloadNext(Track t) async {
    if (!playing || _nextTrack?.key != t.key) return;
    final ref = t.ref;
    if (ref == null) return;
    _preloadKey = t.key;

    // 1. 预载歌词（走数据缓存，切过去时可直接同步命中）
    final src = sources[ref.source];
    if (src != null && src.can(Op.lyrics)) {
      final req = DataReq.lyrics(ref.source, ref.id);
      if (peekData(req) == null) {
        loadData(req).then((_) {}, onError: (_) {});
      }
    }

    // 2. 预载音源：先看磁盘缓存，没有就提前取播放地址并在后台缓存音频文件
    if (ref.source == 'local') return;
    final audioKey = '${cacheSpace(ref.source)}/${ref.id}';
    if (await audioCache.get(audioKey) != null) return;
    if (_preloadKey != t.key || _nextTrack?.key != t.key) return;

    final existing = _preloadedStream;
    if (existing != null &&
        existing.key == t.key &&
        DateTime.now().difference(existing.at) < _preloadStreamTtl) {
      return;
    }

    try {
      final s = await sources.stream(ref);
      if (_preloadKey != t.key || _nextTrack?.key != t.key) return;
      _preloadedStream = (
        key: t.key,
        source: ref.source,
        stream: s,
        at: DateTime.now(),
      );
      if (AudioDiskCache.isCacheable(s)) {
        if (_preloadingAudioKey != null &&
            _preloadingAudioKey != audioKey &&
            _preloadingAudioKey != _cachingAudioKey) {
          audioCache.cancel(_preloadingAudioKey!);
        }
        _preloadingAudioKey = audioKey;
        audioCache.cache(audioKey, s).whenComplete(() {
          if (_preloadingAudioKey == audioKey) _preloadingAudioKey = null;
        }).ignore();
      }
    } catch (_) {
      // 预载失败不影响当前播放，切到这首时再正常重试
    }
  }

  /// 让引擎跟上当前状态：换歌就重新打开，否则只切换播放/暂停。
  Future<void> _sync() async {
    _topUpStation();
    final t = track;
    final ref = t.ref;
    if (ref == null) {
      _stopEngine();
      return;
    }
    if (_loadedKey == t.key) {
      playing ? await _eng.play() : await _eng.pause();
      if (playing) _schedulePreloadNext();
      return;
    }
    _loadedKey = t.key;
    _scrubbing = false;
    // 歌词已在缓存里（比如预载好了）就同步填上，切歌首帧不闪无歌词界面
    if (_applyCachedLyrics(t)) notifyListeners();
    // 先停掉旧歌：取新歌地址期间旧歌不再出声，也不再上报进度
    if (_engineKey != null) {
      _engineKey = null;
      _engine?.stop();
    }
    final audioKey = ref.source == 'local'
        ? null
        : '${cacheSpace(ref.source)}/${ref.id}';
    if (_cachingAudioKey != null && _cachingAudioKey != audioKey) {
      audioCache.cancel(_cachingAudioKey!);
      _cachingAudioKey = null;
    }
    if (audioKey != null && _preloadingAudioKey == audioKey) {
      // 正在预载的刚好就是切过来的这首，转成当前下载任务，不要取消
      _cachingAudioKey = audioKey;
      _preloadingAudioKey = null;
      _preloadTimer?.cancel();
      _preloadTimer = null;
      _preloadKey = null;
    } else {
      _cancelPreload(keepAudioKey: audioKey);
    }
    // 命中磁盘音频缓存（一个月内有效）：直接播放本地文件，不走网络也不做 SWR
    m.AudioStream? cached;
    if (audioKey != null) {
      cached = await audioCache.get(audioKey);
      if (_loadedKey != t.key) return;
    }
    final preloaded = cached == null ? _takePreloadedStream(t.key) : null;
    // 连续切歌时，只给停下来的那首向插件要地址和歌词；已预载的直接开播。
    if (ref.source != 'local' && cached == null && preloaded == null) {
      await Future<void>.delayed(const Duration(milliseconds: 300));
      if (_loadedKey != t.key) return;
    }
    _loadLyrics(t);
    try {
      final s = cached ?? preloaded ?? await sources.stream(ref);
      if (_loadedKey != t.key) return; // 取地址期间已经切到别的歌
      final at = position;
      await _eng.open(
        s,
        play: playing,
        start: at > 0.5 ? Duration(milliseconds: (at * 1000).round()) : null,
      );
      if (_loadedKey == t.key) {
        _engineKey = t.key;
        // 只记哪个源，不记哪首歌；启动时恢复队列（不自动播放）不算
        if (playing) {
          Analytics.instance.event('play', {
            'music_source': ref.source,
            'from_cache': '${cached != null}',
          });
        }
        if (cached == null &&
            audioKey != null &&
            AudioDiskCache.isCacheable(s)) {
          _cachingAudioKey = audioKey;
          audioCache.cache(audioKey, s).ignore();
        }
        if (playing) _schedulePreloadNext();
      }
    } on SourceError catch (e) {
      if (_loadedKey != t.key) return;
      _loadedKey = null;
      playing = false;
      showToast(e.reason.isEmpty ? L.toastCannotPlayTrack(t.title) : e.reason);
      notifyListeners();
    } catch (e) {
      // 引擎打开失败等意外错误：同样放下这首。否则 _loadedKey 停在这首上，
      // 之后点播放只会对空引擎 play，这首再也放不出来；错误还会变成未捕获异常。
      debugPrint('play: $e');
      if (_loadedKey != t.key) return;
      _loadedKey = null;
      playing = false;
      showToast(L.toastCannotPlayTrack(t.title));
      notifyListeners();
    }
  }

  void togglePlay() {
    playing = !playing;
    notifyListeners();
    _sync();
  }

  void play() {
    playing = true;
    notifyListeners();
    _sync();
  }

  void pause() {
    if (!playing) return;
    playing = false;
    notifyListeners();
    _sync();
  }

  // 拖进度条时只移动显示的位置，松手才真正跳转；跳转完成前忽略 mpv 报来的旧位置。
  bool _scrubbing = false;
  int _seeking = 0;

  /// 拖动中：只更新显示的位置。
  void scrub(double frac) {
    _scrubbing = true;
    position = frac.clamp(0.0, 1.0) * track.seconds;
  }

  /// 跳到 [frac]（0~1）。拖进度条时在松手时调用。
  void seek(double frac) {
    _scrubbing = false;
    position = frac.clamp(0.0, 1.0) * track.seconds;
    if (_engineOnTrack) {
      _seeking++;
      _eng
          .seek(Duration(milliseconds: (position * 1000).round()))
          .whenComplete(() => _seeking--);
    }
  }

  /// 快进 / 快退 [s] 秒。
  void seekBy(double s) {
    if (track.seconds <= 0) return;
    seek((position + s) / track.seconds);
  }

  void next() {
    if (queue.isEmpty) return;
    // 电台放到最后一首：等下一批到了再接着放
    if (index + 1 >= queue.length && station != null && !repeat) {
      _stationStalled = true;
      _topUpStation();
      return;
    }
    // 暂停时点下一首也直接开始播放
    if (index + 1 < queue.length) {
      index++;
      playing = true;
    } else if (repeat) {
      index = 0;
      playing = true;
    } else {
      playing = false;
    }
    position = 0;
    notifyListeners();
    _sync();
  }

  void prev() {
    if (queue.isEmpty) return;
    if (position > 3 || index == 0) {
      seek(0);
    } else {
      index--;
      position = 0;
    }
    notifyListeners();
    _sync();
  }

  /// 播放某首歌：队列里有就跳过去，没有就插到当前之后。
  void playTrack(Track t) {
    checkLiked([t]);
    final i = queue.indexWhere((q) => q.key == t.key);
    if (i >= 0) {
      index = i;
    } else if (queue.isEmpty) {
      queue = [t];
      index = 0;
    } else {
      queue.insert(index + 1, t);
      index++;
    }
    position = 0;
    playing = true;
    notifyListeners();
    _sync();
  }

  /// 用一张真实专辑替换队列，从第 [start] 首开始播放。
  /// [shuffled] 见 [playList]。
  void playAlbum(String id, {int start = 0, bool? shuffled}) {
    final ts = _albumTracks[id];
    if (ts != null) {
      playList(
        ts,
        start: start,
        from: 'album:$id',
        name: albumOf(id)?.title ?? '',
        shuffled: shuffled,
      );
    }
  }

  /// 用一组歌替换队列，从第 [start] 首开始播放。
  /// [from] 见 [queueFrom]，[name] 见 [queueName]。
  /// [shuffled]：true 是随机播放（打开随机模式，从随机一首开始，[start] 不用）；
  /// false 是按顺序播放（关掉随机模式）；null 跟着当前的随机模式。
  void playList(
    List<Track> ts, {
    int start = 0,
    String from = '',
    String name = '',
    bool? shuffled,
  }) {
    if (ts.isEmpty) return;
    queueFrom = from;
    _queueName = name;
    queue = List.of(ts);
    checkLiked(queue);
    index = start.clamp(0, ts.length - 1);
    _unshuffled = null;
    if (shuffled != null) shuffle = shuffled;
    if (shuffled == true) {
      // 整张随机：随机挑一首先放，其余打乱接在后面；关掉随机时回到原顺序
      _unshuffled = List.of(queue);
      final first = queue.removeAt(math.Random().nextInt(queue.length));
      queue = [first, ...queue..shuffle()];
      index = 0;
    } else if (shuffle) {
      _shuffleRest();
    }
    position = 0;
    playing = true;
    notifyListeners();
    _sync();
  }

  void playQueueAt(int i) {
    if (queue.isEmpty) return;
    index = i.clamp(0, queue.length - 1);
    position = 0;
    playing = true;
    notifyListeners();
    _sync();
  }

  void addNext(Track t) {
    queue.isEmpty ? queue.add(t) : queue.insert(index + 1, t);
    notifyListeners();
    if (playing) _schedulePreloadNext();
  }

  void addToQueue(Track t) {
    queue.add(t);
    notifyListeners();
    if (playing) _schedulePreloadNext();
  }

  void removeQueueAt(int i) {
    if (i < 0 || i >= queue.length) return;
    if (queue.length == 1) {
      clearQueue();
      return;
    }
    final removingCurrent = i == index;
    final removed = queue.removeAt(i);
    // 随机期间删掉的歌也要从原顺序里去掉，否则关掉随机时又回来了
    _unshuffled?.remove(removed);
    if (i < index) {
      index--;
    } else if (index >= queue.length) {
      index = queue.length - 1;
    }
    if (removingCurrent) position = 0;
    notifyListeners();
    if (removingCurrent) {
      _sync();
    } else if (playing) {
      _schedulePreloadNext();
    }
  }

  void clearQueue() {
    queue = [];
    index = 0;
    position = 0;
    playing = false;
    queueFrom = '';
    _queueName = '';
    _unshuffled = null;
    _stopEngine();
    // 不然下次启动又恢复成清空前的队列
    _playerSave?.cancel();
    _playerSaved = '';
    try {
      File(_playerPath()).deleteSync();
    } on FileSystemException {
      // 本来就没有
    }
    notifyListeners();
  }

  /// 随机播放：打乱当前这首之后的歌；关掉时恢复原来的顺序，当前这首不变。
  void toggleShuffle() {
    shuffle = !shuffle;
    if (shuffle) {
      _unshuffled = List.of(queue);
      _shuffleRest();
    } else if (_unshuffled != null) {
      final cur = track;
      // 随机期间加进队列的歌接在原顺序后面
      final extra = queue.where((t) => !_unshuffled!.contains(t));
      queue = [..._unshuffled!, ...extra];
      index = math.max(0, queue.indexOf(cur));
      _unshuffled = null;
    }
    notifyListeners();
    if (playing) _schedulePreloadNext();
  }

  void _shuffleRest() {
    if (queue.isEmpty) return;
    _unshuffled ??= List.of(queue);
    final rest = queue.sublist(index + 1)..shuffle();
    queue = [...queue.sublist(0, index + 1), ...rest];
  }

  // ───── 电台 ─────
  // 电台的队列从 [queueFrom] = `station:<源>/<电台 id>` 认出来；快放完时向源要下一批。

  /// 正在放的电台 (源, 电台 id)；不是电台时为 null。
  (String, String)? get station {
    if (!queueFrom.startsWith('station:')) return null;
    final v = queueFrom.substring(8);
    final i = v.indexOf('/');
    return i > 0 ? (v.substring(0, i), v.substring(i + 1)) : null;
  }

  bool _stationBusy = false;

  /// 放到了最后一首，在等下一批。
  bool _stationStalled = false;

  /// 电台的一批歌，放不了的去掉。
  Future<List<Track>> stationBatch(
    String source,
    String id, {
    String seed = '',
  }) async {
    final s = sources[source];
    if (s == null || !s.can(Op.station)) return const [];
    final p = await s.station(id, seed: seed);
    final out = [
      for (final t in p.tracks)
        if (!t.unavailable) Track.of(t.withSource(source)),
    ];
    // 卡片上的红心要对：取到就查一下喜欢没有
    checkLiked(out);
    return out;
  }

  /// 放一个电台，[name] 显示在「正在播放 · 来自 …」。[first] 是已经取到的
  /// 第一批（首页上预览的那些），没有就现取，接着当前这首歌放。
  Future<void> playStation(
    String source,
    String id,
    String name, {
    List<Track>? first,
    String? seed,
  }) async {
    try {
      final cur = track.ref;
      final ts =
          first ??
          await stationBatch(
            source,
            id,
            seed: seed ?? (cur != null && cur.source == source ? cur.id : ''),
          );
      if (ts.isEmpty) return showToast(L.toastStationEmpty(name));
      _stationStalled = false;
      playList(ts, from: 'station:$source/$id', name: name);
    } on SourceError catch (e) {
      showToast(e.reason.isEmpty ? L.toastStationOpenFailed(name) : e.reason);
    }
  }

  // ───── 歌曲右键菜单要用的 ─────

  final Map<String, Future<List<m.Playlist>>> _editable = {};

  /// 这个源里自己建的、能往里加歌的歌单（「我喜欢的音乐」这类固定歌单除外）。
  Future<List<m.Playlist>> editablePlaylists(String source) {
    final s = sources[source];
    if (s == null || !s.can(Op.playlists)) return Future.value(const []);
    return _editable[source] ??= s
        .playlists()
        .then((ps) => ps.where((p) => p.mine && !p.fixed).toList())
        .catchError((Object e) {
          _editable.remove(source);
          throw e;
        });
  }

  /// 歌单内容变了：下次进歌单页重新取，音乐库里的歌单列表也重新取。
  void _playlistChanged(String source, String id) {
    dropData(DataReq.playlist(source, id));
    _editable.remove(source);
  }

  String _why(Object e, String fallback) =>
      e is SourceError && e.reason.isNotEmpty ? e.reason : fallback;

  Future<void> addToPlaylist(Track t, m.Playlist p) async {
    final r = t.ref;
    final s = r == null ? null : sources[r.source];
    if (r == null || s == null) return;
    try {
      await s.addToPlaylist(p.id, [r.id]);
      _playlistChanged(r.source, p.id);
      showToast(L.toastAddedToPlaylist(p.name));
    } catch (e) {
      showToast(_why(e, L.toastAddToPlaylistFailed(p.name)));
    }
  }

  Future<void> createPlaylistWith(Track t, String name) async {
    final r = t.ref;
    final s = r == null ? null : sources[r.source];
    if (r == null || s == null) return;
    try {
      final p = await s.createPlaylist(name);
      _editable.remove(r.source);
      _libraries.remove(r.source);
      if (s.can(Op.addToPlaylist)) await s.addToPlaylist(p.id, [r.id]);
      showToast(L.toastPlaylistCreated(name));
      notifyListeners();
    } catch (e) {
      showToast(_why(e, L.toastCreatePlaylistFailed));
    }
  }

  /// 从歌单 [playlist] 里删掉这首。成功返回 true。
  Future<bool> removeFromPlaylist(Track t, String playlist) async {
    final r = t.ref;
    final s = r == null ? null : sources[r.source];
    if (r == null || s == null) return false;
    try {
      await s.removeFromPlaylist(playlist, [r.id]);
      _playlistChanged(r.source, playlist);
      showToast(L.toastRemovedFromPlaylist);
      return true;
    } catch (e) {
      showToast(_why(e, L.toastRemoveFromPlaylistFailed));
      return false;
    }
  }

  /// 放这首歌的相似歌曲。
  Future<void> playSimilar(Track t) async {
    final r = t.ref;
    final s = r == null ? null : sources[r.source];
    if (r == null || s == null) return;
    try {
      final ts = [
        for (final x in await getData(DataReq.similar(r.source, r.id)))
          if (!x.unavailable) Track.of(x.withSource(r.source)),
      ];
      if (ts.isEmpty) return showToast(L.toastNoSimilarFound);
      playList([t, ...ts], name: L.toastSimilarQueueName(t.title));
    } catch (e) {
      showToast(_why(e, L.toastFindSimilarFailed));
    }
  }

  /// 执行插件加的菜单项，再按插件的结果提示、复制、打开页面或放歌。
  Future<void> runMenuAction(
    m.MenuEntry e,
    Track t, {
    String playlist = '',
  }) async {
    final r = t.ref;
    final s = r == null ? null : sources[r.source];
    if (r == null || s == null) return;
    try {
      final res = await s.menuAction(e.id, r, playlist: playlist);
      if (res.copy.isNotEmpty) {
        await Clipboard.setData(ClipboardData(text: res.copy));
      }
      if (res.toast.isNotEmpty) {
        showToast(res.toast);
      } else if (res.copy.isNotEmpty) {
        showToast(L.stateCopied);
      }
      if (res.openKind.isNotEmpty && res.openId.isNotEmpty) {
        open(remoteRoute(res.openKind, r.source, res.openId));
      }
      if (res.tracks.isNotEmpty) {
        playList([
          for (final x in res.tracks)
            if (!x.unavailable) Track.of(x.withSource(r.source)),
        ], name: res.name.isEmpty ? e.title : res.name);
      }
      if (res.station.isNotEmpty) {
        playStation(
          r.source,
          res.station,
          res.name.isEmpty ? e.title : res.name,
          seed: res.seed,
        );
      }
    } catch (err) {
      showToast(_why(err, L.toastActionFailed(e.title)));
    }
  }

  void _topUpStation() {
    final st = station;
    if (st == null || _stationBusy || index < queue.length - 2) return;
    _stationBusy = true;
    final from = queueFrom;
    stationBatch(st.$1, st.$2, seed: queue.last.ref?.id ?? '')
        .then(
          (ts) {
            if (queueFrom != from) return;
            final have = {for (final t in queue) t.key};
            final add = [
              for (final t in ts)
                if (have.add(t.key)) t,
            ];
            queue.addAll(add);
            checkLiked(add);
            if (_stationStalled) {
              _stationStalled = false;
              if (add.isEmpty) {
                playing = false;
              } else {
                index++;
                position = 0;
                playing = true;
              }
              _sync();
            }
            notifyListeners();
          },
          onError: (Object _) {
            if (!_stationStalled) return;
            _stationStalled = false;
            playing = false;
            notifyListeners();
          },
        )
        .whenComplete(() => _stationBusy = false);
  }

  /// 源能不能对这首歌说「不喜欢」。
  bool canDislike(Track t) {
    final r = t.ref;
    return r != null && (sources[r.source]?.can(Op.dislike) ?? false);
  }

  /// 不喜欢：告诉源，并从队列里拿掉；正在放的就跳到下一首。
  Future<void> dislike(Track t) async {
    final ref = t.ref;
    final s = ref == null ? null : sources[ref.source];
    if (ref == null || s == null || !s.can(Op.dislike)) return;
    final st = station;
    final i = queue.indexWhere((q) => q.key == t.key);
    if (i >= 0 && i == index) {
      next();
      if (index == i + 1) {
        queue.removeAt(i);
        index--;
      }
    } else if (i >= 0) {
      queue.removeAt(i);
      if (i < index) index--;
    }
    notifyListeners();
    try {
      await s.dislike(
        ref.id,
        station: st != null && st.$1 == ref.source ? st.$2 : '',
      );
      showToast(L.toastDisliked);
    } on SourceError catch (e) {
      showToast(
        e.reason.isEmpty ? L.toastDislikeFailed(s.info.name) : e.reason,
      );
    }
  }

  // ───── 评论 ─────
  final Map<String, CommentFeed> _comments = {};

  /// 当前歌曲的源有没有评论。
  bool get canComments {
    final r = track.ref;
    return r != null && (sources[r.source]?.can(Op.comments) ?? false);
  }

  /// [t] 按 [sort] 排的评论；切回来时还是原来那份，翻到哪里接着翻。
  CommentFeed? commentsOf(Track t, CommentSort sort) {
    final r = t.ref;
    final s = r == null ? null : sources[r.source];
    if (r == null || s == null || !s.can(Op.comments)) return null;
    final k = '${t.key}|${sort.id}';
    final hit = _comments.remove(k);
    if (hit != null) return _comments[k] = hit;
    if (_comments.length >= 12) {
      final old = _comments.keys.first;
      _comments.remove(old)!.dispose();
    }
    return _comments[k] = CommentFeed(s, r.id, sort);
  }

  // ───── 相似歌曲 ─────
  // 存在缓存里（一天内不重取）；转成界面的 Track 按源数据的那份列表记一次。
  final _similarTracks = Expando<List<Track>>();
  final Set<String> _similarLoading = {}, _similarFailed = {};

  /// 当前歌曲的源能不能给出相似歌曲（本地音乐不能）。
  bool get canSimilar {
    final r = track.ref;
    return r != null && (sources[r.source]?.can(Op.similar) ?? false);
  }

  /// 和 [t] 相似的歌；还没取过时开始取，取到前返回 null。
  List<Track>? similarTo(Track t) {
    final r = t.ref;
    if (r == null) return const [];
    final s = sources[r.source];
    if (s == null || !s.can(Op.similar)) return const [];
    final req = DataReq.similar(r.source, r.id);
    final got = peekData(req);
    if (got != null) {
      return _similarTracks[got] ??= [
        for (final x in got)
          if (!x.unavailable) Track.of(x.withSource(s.id)),
      ];
    }
    if (_similarFailed.contains(t.key)) return const [];
    if (_similarLoading.add(t.key)) {
      loadData(req)
          .then<void>((_) {}, onError: (_) => _similarFailed.add(t.key))
          .whenComplete(() {
            _similarLoading.remove(t.key);
            notifyListeners();
          });
    }
    return null;
  }

  void toggleRepeat() {
    repeat = !repeat;
    notifyListeners();
    if (playing) _schedulePreloadNext();
  }

  /// 喜欢 / 取消喜欢一首歌。来自插件的歌同步到源（比如平台上的「我喜欢的音乐」歌单），
  /// 先改界面，源报错再改回来。
  void toggleLike([Track? t]) {
    final tr = t ?? track;
    final k = tr.key;
    // 上一次还没回来：再点会和失败回滚互相打架，先不理
    if (_liking.contains(k)) return;
    final on = !liked.contains(k);
    void set(bool v) => v ? liked.add(k) : liked.remove(k);
    set(on);
    notifyListeners();
    final ref = tr.ref;
    final s = ref == null ? null : sources[ref.source];
    if (ref == null || s == null || !s.can(Op.like)) return;
    _liking.add(k);
    s
        .like(ref.id, on)
        .then(
          (_) {
            _likeKnown.add(k);
            _libraryTrack(s, tr, on);
          },
          onError: (Object e) {
            set(!on);
            notifyListeners();
            showToast(
              e is SourceError && e.reason.isNotEmpty
                  ? e.reason
                  : (on ? L.toastLikeFailed : L.toastUnlikeFailed),
            );
          },
        )
        .whenComplete(() => _liking.remove(k));
  }

  /// 正在告诉源喜欢 / 取消喜欢的歌（key）。
  final _liking = <String>{};

  /// 流媒体源的音乐库就是喜欢的歌和收藏的专辑：喜欢 / 收藏成功后直接改已加载的
  /// 音乐库，不用整个重新加载。自建服务器这类「整个曲库」的源不受影响。
  SourceLibrary? _streamingLibrary(Source s) =>
      s.can(Op.library) ? null : _libraries[s.id];

  void _libraryTrack(Source s, Track t, bool on) {
    final lib = _streamingLibrary(s);
    if (lib == null) return;
    final rest = lib.tracks.where((x) => x.key != t.key);
    lib.tracks = List.unmodifiable([
      if (on)
        Track(
          title: t.title,
          artist: t.artist,
          album: t.album,
          cover: t.cover,
          seconds: t.seconds,
          mv: t.mv,
          ref: t.ref,
          added: DateTime.now(),
        ),
      ...rest,
    ]);
    lib.artists = _libraryArtists(s.id, lib, const []);
    notifyListeners();
  }

  void _libraryAlbum(Source s, Album al, bool on) {
    final lib = _streamingLibrary(s);
    if (lib == null) return;
    final rest = lib.albums.where((x) => x.id != al.id);
    lib.albums = List.unmodifiable([
      if (on)
        Album(
          id: al.id,
          title: al.title,
          artist: al.artist,
          cover: al.cover,
          year: al.year,
          kind: al.kind,
          artistRoute: al.artistRoute,
          added: DateTime.now(),
          spine: 42 + (al.id.hashCode % 23).abs().toDouble(),
        ),
      ...rest,
    ]);
    lib.artists = _libraryArtists(s.id, lib, const []);
    notifyListeners();
  }

  /// 已经向源问过是否喜欢的歌（Track.key）。
  final Set<String> _likeKnown = {};

  /// 向源查一批歌是否已喜欢，更新 [liked]。问过的不再问；查不到就算了。
  Future<void> checkLiked(Iterable<Track> ts) async {
    final bySource = <String, Map<String, String>>{}; // 源 → 歌 id → key
    for (final t in ts) {
      final ref = t.ref;
      if (ref == null || ref.id.isEmpty || !_likeKnown.add(t.key)) continue;
      (bySource[ref.source] ??= {})[ref.id] = t.key;
    }
    for (final MapEntry(key: src, value: ids) in bySource.entries) {
      final s = sources[src];
      if (s == null || !s.can(Op.isLiked)) continue;
      try {
        final r = await s.isLiked(ids.keys.toList());
        for (final MapEntry(key: id, value: on) in r.entries) {
          final k = ids[id];
          if (k == null) continue;
          on ? liked.add(k) : liked.remove(k);
        }
        notifyListeners();
      } catch (_) {
        _likeKnown.removeAll(ids.values);
      }
    }
  }

  void setVolume(double v) {
    volume = v.clamp(0.0, 1.0);
    muted = volume == 0;
    _engine?.setVolume(effectiveVolume);
    _saveVolumeSoon();
    notifyListeners();
  }

  /// 音量加减 [d]（0~1）；静音时先取消静音。
  void volumeBy(double d) {
    if (muted) {
      muted = false;
      if (volume == 0) volume = 0.1;
    }
    setVolume(volume + d);
  }

  void toggleMute() {
    muted = !muted;
    _engine?.setVolume(effectiveVolume);
    _saveVolumeSoon();
    notifyListeners();
  }

  // ───── 歌词 ─────
  List<LyricLine> _lyrics = const [];
  String? _lyricsKey;

  /// 当前歌曲的歌词，从来源加载（异步，加载前为空）。
  List<LyricLine> get lyricLines =>
      _lyricsKey == track.key ? _lyrics : const [];

  bool get hasLyrics => lyricLines.isNotEmpty;

  /// 当前歌曲还在向来源取歌词（源支持歌词且尚未完成）。
  bool get lyricsLoading {
    if (_lyricsKey == track.key) return false;
    final ref = track.ref;
    if (ref == null) return false;
    final src = sources[ref.source];
    return src != null && src.can(Op.lyrics);
  }

  List<LyricLine> _parseLyrics(m.Lyrics l) => [
    for (final x in lrc.lyricLines(l))
      if (x.text.isNotEmpty) LyricLine(x.text, x.translation, x.start),
  ];

  bool _applyCachedLyrics(Track t) {
    if (_lyricsKey == t.key) return false;
    final ref = t.ref;
    if (ref == null) return false;
    final src = sources[ref.source];
    if (src == null || !src.can(Op.lyrics)) return false;
    final cached = peekData(DataReq.lyrics(ref.source, ref.id));
    if (cached == null) return false;
    _lyrics = _parseLyrics(cached);
    _lyricsKey = t.key;
    return true;
  }

  /// 正在唱的那一行。读 [position]，所以要放在 [pos] 的监听里用。
  int get lyricIndex {
    final ls = lyricLines;
    if (ls.isEmpty) return 0;
    final ms = (position * 1000).round();
    var lo = 0, hi = ls.length - 1, ans = 0;
    while (lo <= hi) {
      final mid = (lo + hi) >> 1;
      if (ls[mid].start <= ms) {
        ans = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return ans;
  }

  /// 点歌词跳到那一行。
  void seekLyric(int i) {
    final ls = lyricLines;
    if (i < 0 || i >= ls.length) return;
    seek(track.seconds == 0 ? 0 : ls[i].start / 1000 / track.seconds);
  }

  Future<void> _loadLyrics(Track t) async {
    final ref = t.ref;
    if (ref == null || _lyricsKey == t.key) return;
    if (_applyCachedLyrics(t)) {
      notifyListeners();
      return;
    }
    try {
      final src = sources[ref.source];
      final l = src == null || !src.can(Op.lyrics)
          ? const m.Lyrics()
          : await getData(DataReq.lyrics(ref.source, ref.id));
      if (track.key != t.key) return;
      _lyrics = _parseLyrics(l);
      _lyricsKey = t.key;
      notifyListeners();
    } catch (_) {
      // 歌词不是必需的，加载失败就当没有
      if (track.key == t.key) {
        _lyrics = const [];
        _lyricsKey = t.key;
        notifyListeners();
      }
    }
  }

  double get effectiveVolume => muted ? 0 : volume;

  // ───── 设置 ─────
  int swatch = 0;
  String lang = _prefs()['lang'] as String? ?? 'system';
  bool miniLyric = true;
  bool tray = false;

  Locale? get locale => AppLanguage.byCode(lang).locale;

  void setLang(String code) {
    final normalized = AppLanguage.byCode(code).code;
    if (lang == normalized) return;
    lang = normalized;
    _savePrefs({'lang': lang});
    notifyListeners();
  }

  /// 三份磁盘缓存现在各占多少字节：(数据, 图片, 音频)。
  Future<(int, int, int)> cacheSizes() async => (
    await cache.size(),
    await ImageDiskCache.instance.size(),
    await audioCache.size(),
  );

  /// 清空数据、图片和音频缓存；正在显示的页面没了缓存会自己重取。
  Future<void> clearCache() async {
    _cancelPreload();
    _preloadedStream = null;
    await cache.clear();
    await ImageDiskCache.instance.clear();
    await audioCache.clear();
    _direct.clear();
    _scheduleRefresh();
    notifyListeners();
  }

  /// 只提供深色主题（设置里不再有深浅色切换）。
  bool get isDark => true;

  void applyTheme() {
    P = isDark ? Palette.darkPalette : Palette.lightPalette;
    accent = (isDark ? swatchesDark : swatchesLight)[swatch];
  }

  void update(void Function() f) {
    f();
    notifyListeners();
  }

  // ───── 页面里需要跨页保留的一点状态 ─────
  String shelfId = '';
  int shelfSort = 1;

  /// 收藏的专辑（[albumOf] 用的 id）。
  final Set<String> savedAlbums = {};

  /// 收藏 / 取消收藏一张专辑；插件的专辑同步到源，源报错就改回来。
  Future<void> toggleSaveAlbum(Album al) async {
    final on = !savedAlbums.contains(al.id);
    void set(bool v) => v ? savedAlbums.add(al.id) : savedAlbums.remove(al.id);
    set(on);
    notifyListeners();
    final i = al.id.indexOf('/');
    if (al.id.startsWith('@') && i > 1) {
      final s = sources[al.id.substring(1, i)];
      if (s != null && s.can(Op.saveAlbum)) {
        try {
          await s.saveAlbum(al.id.substring(i + 1), on);
          _libraryAlbum(s, al, on);
        } catch (e) {
          set(!on);
          notifyListeners();
          showToast(
            e is SourceError && e.reason.isNotEmpty
                ? e.reason
                : (on ? L.toastSaveAlbumFailed : L.toastUnsaveAlbumFailed),
          );
          return;
        }
      }
    }
    showToast(on ? L.toastAlbumSaved(al.title) : L.toastAlbumUnsaved);
  }

  // ───── MCP Server ─────
  McpConfig mcpConfig = McpConfig.fromJson(_prefs()['mcp']);
  late final McpServer mcp = McpServer(this, onStatusChanged: notifyListeners);

  Future<void> startMcpIfEnabled() async {
    if (mcpConfig.enabled) {
      await mcp.applyConfig(mcpConfig);
    }
  }

  Future<void> updateMcpConfig(McpConfig next) async {
    final normalized = (next.requireAuth && next.token.isEmpty)
        ? next.copyWith(token: McpConfig.generateToken())
        : next;
    mcpConfig = normalized;
    _savePrefs({'mcp': normalized.toJson()});
    await mcp.applyConfig(normalized);
    notifyListeners();
  }

  @override
  void dispose() {
    _pluginGen++; // 正在自动重启的插件不再放回来
    mcp.stop(notify: false);
    _trimTimer?.cancel();
    _refreshTimer?.cancel();
    _preloadTimer?.cancel();
    _cacheSub?.cancel();
    // 拖完音量半秒内退出：把还没写的音量写掉
    if (_volumeSave?.isActive ?? false) {
      _volumeSave!.cancel();
      _savePrefs({'volume': volume, 'muted': muted});
    }
    _playerSave?.cancel();
    _savePlayer();
    _engine?.dispose();
    audioCache.dispose();
    cache.dispose();
    sources.closeAll();
    pos.dispose();
    super.dispose();
  }
}

/// 通过 InheritedNotifier 下发，任何改动都会让依赖它的组件重建。
class AppScope extends InheritedNotifier<AppState> {
  const AppScope({super.key, required AppState state, required super.child})
    : super(notifier: state);

  static AppState of(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<AppScope>()!.notifier!;

  /// 只读取，不订阅。
  static AppState read(BuildContext context) =>
      context.getInheritedWidgetOfExactType<AppScope>()!.notifier!;
}

extension AppX on BuildContext {
  AppState get app => AppScope.of(this);
  AppState get appRead => AppScope.read(this);
}

/// 一个源的音乐库，加载中会逐步填上。
class SourceLibrary {
  /// 上次开始从源加载的时间，[AppState.refreshLibrary] 用来限制频率。
  DateTime loadedAt = DateTime.now();
  bool refreshing = false;

  List<Track> tracks = const [];
  List<Album> albums = const [];
  List<m.Playlist> playlists = const [];
  List<LibraryArtist> artists = const [];

  /// 正在加载的部分：tracks、albums、playlists、artists。
  final Set<String> loading = {};
  final Map<String, Object> errors = {};
}

/// 音乐库「艺人」里的一位。
class LibraryArtist {
  const LibraryArtist({
    this.id = '',
    required this.name,
    required this.cover,
    this.hasAvatar = false,
    required this.route,
    required this.weight,
  });
  final String id, name, cover;

  /// cover 本身就是艺人头像（而不是从曲目或专辑封面凑的）。
  final bool hasAvatar;

  /// 点进去的页面；为空就不能点。
  final String route;

  /// 曲库里这位艺人的歌曲数（或专辑数），决定气泡大小。
  final int weight;
}

/// 插件登录时要应用显示的东西。
class SignInPrompt {
  const SignInPrompt({
    required this.source,
    required this.name,
    required this.qr,
    required this.text,
  });
  final String source, name, qr, text;
}

/// 从搜索结果里点开过的一样东西：歌、专辑、歌手或歌单。
class SearchHit {
  const SearchHit({
    required this.kind,
    required this.source,
    required this.id,
    required this.title,
    this.sub = '',
    this.cover = '',
    this.track,
  });

  /// track / album / artist / playlist。
  final String kind;
  final String source, id, title, sub, cover;

  /// 歌曲本身，点了直接放。
  final m.Track? track;

  String get key => '$source:$kind:$id';

  factory SearchHit.ofTrack(m.Track t) => SearchHit(
    kind: 'track',
    source: t.source,
    id: t.id,
    title: t.name,
    sub: t.artistNames,
    cover: t.album.imageUrl,
    track: t,
  );

  factory SearchHit.fromJson(Map<String, Object?> j) => SearchHit(
    kind: j['kind'] as String? ?? '',
    source: j['source'] as String? ?? '',
    id: j['id'] as String? ?? '',
    title: j['title'] as String? ?? '',
    sub: j['sub'] as String? ?? '',
    cover: j['cover'] as String? ?? '',
    track: j['track'] is Map
        ? m.Track.fromJson((j['track'] as Map).cast())
        : null,
  );

  Map<String, Object?> toJson() => {
    'kind': kind,
    'source': source,
    'id': id,
    'title': title,
    if (sub.isNotEmpty) 'sub': sub,
    if (cover.isNotEmpty) 'cover': cover,
    if (track != null) 'track': track!.toJson(),
  };
}
