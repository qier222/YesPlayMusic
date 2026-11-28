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
import 'music/eq.dart';
import 'music/player.dart';
import 'music/replay_gain.dart';
import 'music/scrobble.dart';
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

enum PlaybackRepeatMode { off, all, one }

/// State for the whole UI: routing, music sources, player, settings.
class AppState extends ChangeNotifier {
  AppState() {
    ImageDiskCache.instance.dir = p.join(supportDir(), 'cache', 'images');
    // Shortly after launch, check whether the three disk caches are over their caps or expired
    _trimTimer = Timer(const Duration(seconds: 20), () {
      cache.trim().ignore();
      ImageDiskCache.instance.trim().ignore();
      audioCache.trim().ignore();
    });
    // Older versions only stored page-cache for home and Discover, now replaced by cache/api
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

  // ───── Anonymous stats ─────
  String _trackedPage = '';

  /// Records once whenever the page (or the Now Playing tab) changes; only the page kind, no ids or params.
  void _trackPage() {
    final page = npOpen ? '/now-playing/${npTab.name}' : pageKind(path);
    if (page == _trackedPage) return;
    _trackedPage = page;
    Analytics.instance.event('page_open', {'app_page': page});
  }

  /// `/album/@source/id` → `/album`; `/library/albums` keeps the second segment.
  static String pageKind(String path) {
    final s = path.split('?').first.split('/').where((x) => x.isNotEmpty);
    if (s.isEmpty) return '/';
    return s.first == 'library' && s.length > 1
        ? '/library/${s.elementAt(1)}'
        : '/${s.first}';
  }

  /// Sent once a day with app_active: preferences and installed plugins.
  List<AnalyticsEvent> analyticsSnapshot() => [
    (
      'settings_state',
      {
        'ui_language': lang,
        'music_source': sourceId,
        'theme_mode': isDark ? 'dark' : 'light',
        'accent_swatch': swatchKeys[swatch.clamp(0, swatchKeys.length - 1)],
        'local_library_size': Analytics.librarySizeBucket(
          local?.trackCount ?? 0,
        ),
        'mini_lyric': '$miniLyric',
        'minimize_to_tray': '$keepRunning',
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

  // ───── Routing ─────
  // For debugging: --dart-define=ROUTE=/search opens a page directly, NP=lyrics|queue|similar opens Now Playing, TRACK=n selects the nth song in the queue
  // Start page: home if there is one, otherwise Discover, otherwise the library. Only known after plugins load,
  // so use the last computed one first and change it after loading (if the user hasn't navigated elsewhere yet).
  final List<String> _stack = [
    _prefs()['start'] as String? ?? '/library/albums',
    if (const String.fromEnvironment('ROUTE').isNotEmpty)
      const String.fromEnvironment('ROUTE'),
  ];
  String get path => _stack.last;
  bool get canBack => _stack.length > 1;
  // Incremented on every navigation, drives page transition animations
  int navSerial = 0;
  bool navBack = false;

  /// Pages navigated back from, for ⌘] forward; cleared when navigating to a new page.
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

  /// The [i]th sidebar page (0 home, 1 Discover, 2 library, 3 search), going to the same place as the sidebar button.
  /// Goes to the library when the current source has no home or Discover (local mode has neither).
  void goTab(int i) => go(switch (i) {
    0 when !hasHome => '/library/albums',
    1 when !hasDiscover => '/library/albums',
    0 => '/home',
    1 => '/discover',
    2 => '/library/albums',
    _ => '/search',
  });

  /// Top-level pages shown in the sidebar (goTab indices). ⌘1–4 follow this order.
  List<int> get visibleTabs => [if (hasHome) 0, if (hasDiscover) 1, 2, 3];

  /// Whether the current source has a home page (the plugin provides home). Local music doesn't; while a plugin is still loading
  /// assume it does (show the skeleton), then check whether the plugin provides it after loading.
  bool get hasHome => _hasTab(Op.home);

  /// Whether the current source has a Discover page (the plugin provides browse). Same rule as [hasHome].
  bool get hasDiscover => _hasTab(Op.browse);

  bool _hasTab(String op) {
    if (localMode) return false;
    final s = remote ? sources[sourceId] : null;
    return s == null ? !pluginsLoaded : s.can(op);
  }

  /// After switching sources, go to the new source's start page (home, Discover or library) and clear back/forward history (those were the previous source's pages).
  /// If switched from Settings, stay in Settings, and going back leads to the start page.
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

  /// Still on a home or Discover page the new source doesn't have: switch to the library.
  void _leaveMissingTabs() {
    if ((path == '/home' && !hasHome) ||
        (path == '/discover' && !hasDiscover)) {
      replace('/library/albums');
    }
  }

  /// ⌘F: go to the search page and focus the search field (refocuses even when already on the search page).
  final ValueNotifier<int> searchFocus = ValueNotifier(0);
  void focusSearch() {
    go('/search');
    searchFocus.value++;
  }

  // ───── Now Playing ─────
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

  // ───── Music sources ─────
  final Sources sources = Sources();
  LocalSource? local;

  /// Local albums (for the shelf).
  List<Album> libraryAlbums = const [];
  final Map<String, List<Track>> _albumTracks = {};

  bool get hasLibrary => (local?.trackCount ?? 0) > 0;
  Album? albumOf(String id) =>
      _remoteAlbums[id] ?? libraryAlbums.where((a) => a.id == id).firstOrNull;

  /// An album's tracks; null if never loaded.
  List<Track>? albumTracks(String id) => _albumTracks[id];

  /// Album page route. Real album ids may contain / and other characters and must be encoded. Plugin albums
  /// (id `@source/id`) go to the plugin album page, which opens even when tracks haven't loaded.
  static String albumRoute(String id) {
    final i = id.indexOf('/');
    if (id.startsWith('@') && i > 1) {
      return remoteRoute('album', id.substring(1, i), id.substring(i + 1));
    }
    return '/album/${Uri.encodeComponent(id)}';
  }

  static String get _home => homeDir;

  /// Default folders to scan: ~/Music and ~/Documents/Music (those that exist).
  /// Can also be set with --dart-define=MUSIC_DIRS=/a:/b (separated by ; on Windows).
  static List<String> defaultMusicFolders() {
    const env = String.fromEnvironment('MUSIC_DIRS');
    final dirs = env.isNotEmpty
        ? env.split(Platform.isWindows ? ';' : ':')
        : [p.join(_home, 'Music'), p.join(_home, 'Documents', 'Music')];
    return dirs.where((d) => Directory(d).existsSync()).toList();
  }

  /// Data directory under `flutter test`: a temp directory per test process. Otherwise AppState in tests
  /// would read and write the user's real prefs.json and player.json (e.g. switching the current source to a fake test source).
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

  /// Local music is being scanned. While scanning, an empty library doesn't show the empty state, avoiding a flash at launch.
  bool scanning = false;

  /// Files read so far by the running scan.
  int scanProgress = 0;

  /// Music folders the last scan skipped because they couldn't be read or stopped responding.
  List<String> unreadableFolders = const [];

  /// Bumped by every [loadLibrary]; a scan whose number is no longer current drops its result.
  int _scanGen = 0;
  LocalSource? _scanSrc;

  /// Folders to scan for local music, stored in prefs; [defaultMusicFolders] when never set.
  late List<String> musicFolders = [
    for (final x
        in (_prefs()['musicFolders'] as List?) ?? defaultMusicFolders())
      '$x',
  ];

  /// Adds a music folder and rescans. Not added if it's already in the list (or inside an existing folder).
  Future<void> addMusicFolder(String dir) async {
    dir = p.normalize(dir);
    if (musicFolders.any((f) => f == dir || p.isWithin(f, dir))) {
      showToast(L.sourceFolderAlreadyScanned);
      return;
    }
    // If the new folder contains existing ones, remove those
    musicFolders = [...musicFolders.where((f) => !p.isWithin(dir, f)), dir];
    _savePrefs({'musicFolders': musicFolders});
    await rescanLibrary();
  }

  Future<void> removeMusicFolder(String dir) async {
    musicFolders = musicFolders.where((f) => f != dir).toList();
    _savePrefs({'musicFolders': musicFolders});
    await loadLibrary();
  }

  /// "Rescan" in the empty state: shows a message if it's still empty after scanning.
  Future<void> rescanLibrary() async {
    if (await loadLibrary() && !hasLibrary) showToast(L.sourceNoMusicFound);
  }

  /// Stops the running scan; the library keeps what it had before.
  void cancelScan() => _scanSrc?.cancelScan();

  /// Scans local music and builds the shelf; when there are songs, replaces the queue with the first album (without playing).
  /// A new call supersedes a running one. Returns false when the scan was cancelled or superseded.
  Future<bool> loadLibrary({List<String>? folders}) async {
    final gen = ++_scanGen;
    _scanSrc?.cancelScan();
    scanning = true;
    scanProgress = 0;
    notifyListeners();
    try {
      return await _scanLocal(folders, gen);
    } on ScanCancelled {
      return false;
    } finally {
      if (gen == _scanGen) {
        _scanSrc = null;
        scanning = false;
        notifyListeners();
      }
    }
  }

  Future<bool> _scanLocal(List<String>? folders, int gen) async {
    final src = LocalSource(
      folders: folders ?? musicFolders,
      cacheDir: _cacheDir(),
    );
    _scanSrc = src;
    final sinceNotify = Stopwatch()..start();
    await src.scan(
      onProgress: (n) {
        scanProgress = n;
        // Rebuilding the app for every file is wasteful on big libraries
        if (sinceNotify.elapsedMilliseconds >= 200) {
          sinceNotify.reset();
          notifyListeners();
        }
      },
    );
    if (gen != _scanGen) return false;
    unreadableFolders = src.unreadable;
    if (src.unreadable.isNotEmpty) {
      showToast(L.sourceFoldersUnreadable(src.unreadable.length));
    }
    if (local != null) await sources.remove(local!.id);
    local = src;
    sources.add(src);
    final lyricsPrefix = '${src.id}/lyrics/';
    _direct.removeWhere((key, _) => key.startsWith(lyricsPrefix));
    _directInflight.removeWhere((key, _) => key.startsWith(lyricsPrefix));
    final current = track;
    final ref = current.ref;
    if (ref != null &&
        ref.source == src.id &&
        !src.unreadable.any((folder) => p.isWithin(folder, ref.id))) {
      _lyricsKey = null;
      unawaited(_loadLyrics(current));
    }

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
          artistImage: a.artists.firstOrNull?.imageUrl ?? '',
          cover: a.imageUrl,
          year: a.year ?? 0,
          added: DateTime.tryParse(a.added)?.toLocal(),
          released: DateTime.tryParse(a.released),
          copyright: a.copyright,
          // Spine width varies with track count, within the design's 42–64 range
          spine: 42 + page.tracks.length.clamp(0, 22).toDouble(),
        ),
      );
    }
    out.sort((a, b) {
      final c = a.artist.toLowerCase().compareTo(b.artist.toLowerCase());
      return c != 0 ? c : a.year.compareTo(b.year);
    });
    if (gen != _scanGen) return false;
    libraryAlbums = out;
    _libraries.remove('local');
    await CoverColors.instance.preload(out.map((a) => a.cover));

    if (out.isNotEmpty) {
      if (!out.any((a) => a.id == shelfId)) shelfId = out.first.id;
    }
    notifyListeners();
    return true;
  }

  // ───── Plugins ─────
  // Plugins come from third parties; the app itself ships none. Each plugin is a directory under plugins/<id>/.

  /// Loaded plugins.
  List<PluginSource> plugins = const [];

  /// The source chosen in settings, available even before plugins finish loading.
  String get chosenSource => _sourceId;

  /// Local mode: the current source is local music (while plugins are loading, based on the choice in settings).
  /// No home or Discover.
  bool get localMode =>
      (remote || pluginsLoaded ? sourceId : chosenSource) == 'local';

  /// The first plugin load has finished (plugin pages show skeletons before then).
  bool pluginsLoaded = false;

  /// The current source's start page: home if available, otherwise Discover, otherwise the library.
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

  // Sections ("style:count") each source's home had last time; the skeleton is drawn from them while loading so the layout doesn't jump when content arrives.
  final Map<String, List<String>> _homeLayouts = {
    for (final e in ((_prefs()['homeLayout'] as Map?) ?? const {}).entries)
      '${e.key}': [for (final x in e.value as List) '$x'],
  };

  List<String> homeLayout(String key) =>
      _homeLayouts[key] ??
      (key.endsWith('/discover')
          ? const ['shelf:14', 'songs:12']
          : const ['modes:5', 'shelf:10', 'songs:12']);

  /// Remembered layout; null if never remembered (no default given).
  List<String>? savedHomeLayout(String key) => _homeLayouts[key];

  void rememberHomeLayout(String source, List<String> layout) {
    if (listEquals(_homeLayouts[source], layout)) return;
    _homeLayouts[source] = layout;
    _savePrefs({'homeLayout': _homeLayouts});
  }

  /// Plugins that failed to load: directory → reason.
  Map<String, String> pluginErrors = const {};

  /// App data directory: ~/Library/Application Support/YesPlayMusic on macOS.
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

  /// (Re)loads all plugins in the plugin directory.
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
    // Plugins follow the app UI language (host.language(), host.t() and plugin error messages)
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
    // The UI language may have just synced during startup, so send it again (plugins ignore it if unchanged)
    for (final s in list) {
      s.setLanguage(PluginSource.language);
    }
    pluginErrors = failed;
    disabledPlugins = skipped;
    if (!pluginsLoaded) {
      pluginsLoaded = true;
      _pickStart();
      _schedulePluginUpdates();
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
    // The last song played was from a plugin: whether it's liked and its lyrics are only available once the plugin is up
    if (hasQueue && track.ref!.source != 'local') {
      checkLiked([track]);
      if (_lyrics.isEmpty) _loadLyrics(track);
    }
  }

  /// Incremented on every loadPlugins: if everything was reloaded during an auto-restart, the restarted one is discarded.
  int _pluginGen = 0;

  /// Plugin directory → time of the last auto-restart.
  final _pluginRestarts = <String, DateTime>{};

  /// A plugin stopped mid-run (infinite loop, out of memory, process crash): auto-restart once first;
  /// if it stops again within 60 seconds, move it to a failure card on the settings page showing the reason, and the user clicks "Reload" to start it again.
  /// The music source selection stays as is.
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

  /// Moves a stopped plugin to the failure cards.
  void _dropPlugin(PluginSource s, String why) {
    plugins = [...plugins]..remove(s);
    if (identical(sources[s.id], s)) sources.remove(s.id).ignore();
    accounts.remove(s.id);
    pluginErrors = {...pluginErrors, s.dir: why};
    showToast(why);
    _leaveMissingTabs();
    notifyListeners();
  }

  /// Restarts a stopped plugin. While restarting, the old one stays in place (calls fail right away),
  /// and the new one replaces it in place once up: the plugin card, current music source and account don't flash.
  Future<void> _restartPlugin(PluginSource old) async {
    final gen = _pluginGen;
    debugPrint('[plugin ${old.id}] auto-restarting');
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
    // Everything was reloaded during the restart, or the old one was already moved away: drop this one
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

  /// Plugins the user allowed to run local programs (host.spawn). Changes take effect after reloading plugins.
  Set<String> get allowPrograms => {
    for (final x in _prefs()['allowPrograms'] as List? ?? const []) '$x',
  };

  Future<void> setAllowPrograms(String id, bool on) async {
    final s = allowPrograms;
    on ? s.add(id) : s.remove(id);
    _savePrefs({'allowPrograms': s.toList()..sort()});
    await loadPlugins();
  }

  /// Plugins the user disabled: directory → plugin.json. Not started, only shown on the settings page.
  Map<String, PluginManifest> disabledPlugins = const {};

  Set<String> get _disabledIds => {
    for (final x in _prefs()['disabledPlugins'] as List? ?? const []) '$x',
  };

  /// Enables or disables a plugin. Disabling the current music source switches back to local music.
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

  /// The link each plugin was installed from (for update checks): id → link. Absent for ones placed in the directory manually.
  Map<String, String> get pluginOrigins => {
    for (final e in ((_prefs()['pluginOrigins'] as Map?) ?? const {}).entries)
      '${e.key}': '${e.value}',
  };

  /// Plugins with a new version: id → version.
  final Map<String, String> pluginUpdates = {};
  var _pluginUpdatesChecked = false;

  /// Plugins that install new versions in the background, stored in prefs.
  Set<String> get autoUpdatePlugins => {
    for (final x in _prefs()['autoUpdatePlugins'] as List? ?? const []) '$x',
  };

  void setAutoUpdatePlugin(String id, bool on) {
    final s = autoUpdatePlugins;
    on ? s.add(id) : s.remove(id);
    _savePrefs({'autoUpdatePlugins': s.toList()..sort()});
    notifyListeners();
    if (on) _autoUpdatePlugins();
  }

  /// The link used for update checks and updates: the install origin recorded in prefs,
  /// falling back to `repository` declared in plugin.json when no install origin was recorded.
  String? pluginUpdateOrigin(String id) {
    final origin = pluginOrigins[id];
    if (origin != null && origin.isNotEmpty) return origin;
    final repo = _manifestOf(id)?.repository ?? '';
    return repo.isEmpty ? null : repo;
  }

  /// Whether [id] can be checked for updates: installed from a GitHub repo or Release,
  /// or declaring a GitHub repository in plugin.json. When a branch was installed there's no such thing as a "new version".
  bool canCheckPluginUpdate(String id) {
    final gh = parseGitHub(pluginUpdateOrigin(id) ?? '');
    return gh != null && gh.ref == null;
  }

  /// Manifest of the installed plugin with [id] (enabled or disabled).
  PluginManifest? _manifestOf(String id) =>
      plugins.where((s) => s.id == id).firstOrNull?.manifest ??
      disabledPlugins.values.where((m) => m.id == id).firstOrNull;

  /// Checks one plugin for a new Release. Returns the new version, or null when it's up to date.
  /// Throws [InstallError] when GitHub can't be reached.
  Future<String?> checkPluginUpdate(String id) async {
    final gh = parseGitHub(pluginUpdateOrigin(id) ?? '');
    final cur = _manifestOf(id)?.info.version;
    if (gh == null || gh.ref != null || cur == null) return null;
    final v = await latestGitHubVersion(gh, strict: true);
    if (v != null && compareVersions(v, cur) > 0) {
      pluginUpdates[id] = v;
    } else {
      pluginUpdates.remove(id);
    }
    notifyListeners();
    return pluginUpdates[id];
  }

  /// Checks plugins installed from GitHub (or declaring a GitHub repository) for new Releases
  /// (once per launch unless [force]), then installs the ones with auto update on.
  Future<void> checkPluginUpdates({bool force = false}) async {
    if (_pluginUpdatesChecked && !force) return;
    _pluginUpdatesChecked = true;
    final ids = {
      for (final s in plugins) s.id,
      for (final m in disabledPlugins.values) m.id,
    };
    for (final id in ids) {
      if (!canCheckPluginUpdate(id)) continue;
      try {
        await checkPluginUpdate(id);
      } on InstallError catch (e) {
        debugPrint('[plugin $id] update check failed: $e');
      }
    }
    await _autoUpdatePlugins();
  }

  /// How often plugins with auto update on are checked while the app is running.
  static const _pluginUpdateInterval = Duration(hours: 6);
  Timer? _pluginUpdateTimer;

  /// Starts background update checks: shortly after launch, then every [_pluginUpdateInterval].
  /// Nothing is fetched while no plugin has auto update on.
  void _schedulePluginUpdates() {
    void tick() {
      if (autoUpdatePlugins.isNotEmpty) checkPluginUpdates(force: true);
    }

    _pluginUpdateTimer?.cancel();
    _pluginUpdateTimer = Timer(const Duration(seconds: 10), () {
      tick();
      _pluginUpdateTimer = Timer.periodic(_pluginUpdateInterval, (_) => tick());
    });
  }

  var _autoUpdating = false;

  /// Installs available updates for plugins with auto update on. Left for the user to update by hand:
  /// versions asking for new permissions, ones needing a newer app, and the plugin of the song playing right now.
  Future<void> _autoUpdatePlugins() async {
    if (_autoUpdating) return;
    _autoUpdating = true;
    try {
      for (final id in autoUpdatePlugins) {
        final origin = pluginUpdateOrigin(id);
        final current = _manifestOf(id);
        if (!pluginUpdates.containsKey(id) || origin == null) continue;
        if (current == null || (playing && track.ref?.source == id)) continue;
        PluginPackage? pkg;
        try {
          pkg = await fetchPluginPackage(origin);
          if (pkg.blocked != null ||
              pkg.manifest.id != id ||
              pluginIdConflict(pkg) != null ||
              permissionsGrow(current, pkg.manifest)) {
            await pkg.discard();
            continue;
          }
          final version = pkg.manifest.info.version;
          await installPluginPackage(pkg);
          final s = plugins.where((s) => s.id == id).firstOrNull;
          showToast(
            L.pluginAutoUpdatedToast(
              s?.tr(s.info.name) ?? current.info.name,
              version,
            ),
          );
        } catch (e) {
          debugPrint('[plugin $id] auto update failed: $e');
          await pkg?.discard();
        }
      }
    } finally {
      _autoUpdating = false;
    }
  }

  /// Downloads a plugin, reads its permissions and capabilities, and waits for the user to confirm.
  Future<PluginPackage> fetchPluginPackage(String link) =>
      fetchPlugin(link, pluginsRoot: pluginsDir());

  Future<PluginPackage> fetchPluginFolder(String folder) =>
      fetchPluginFromFolder(folder, pluginsRoot: pluginsDir());

  /// Directory of the installed plugin with [id] (enabled or disabled); null when not installed.
  String? _installedDir(String id) => [
    for (final s in plugins)
      if (s.id == id) s.dir,
    for (final e in disabledPlugins.entries)
      if (e.value.id == id) e.key,
  ].firstOrNull;

  /// When a plugin with the same id but from a different origin is installed, where that one came from
  /// (the link as shown to the user; empty when unknown, e.g. a local folder or placed manually).
  /// Null when nothing with this id is installed, or it's the same plugin (an update).
  String? pluginIdConflict(PluginPackage pkg) {
    final id = pkg.manifest.id;
    if (_installedDir(id) == null) return null;
    final old = pluginUpdateOrigin(id) ?? '';
    return sameOrigin(old, pkg.origin) ? null : originLabel(old);
  }

  /// Installs (or updates) a confirmed plugin and reloads. Replacing a different plugin with the same id
  /// ([pluginIdConflict]) installs it fresh: the old one's settings, sign-in state and granted permissions are cleared.
  Future<void> installPluginPackage(PluginPackage pkg) async {
    final id = pkg.manifest.id;
    final old = _installedDir(id);
    final replace = pluginIdConflict(pkg) != null;
    if (replace) {
      // Stop the old plugin first so it can't write into its data directory after it's deleted
      await sources.remove(id);
      try {
        await Directory(p.join(supportDir(), 'plugin-data', id))
            .delete(recursive: true);
      } on FileSystemException {
        // Nothing stored
      }
      _savePrefs({
        'disabledPlugins': (_disabledIds..remove(id)).toList()..sort(),
        'allowPrograms': (allowPrograms..remove(id)).toList()..sort(),
        'autoUpdatePlugins': (autoUpdatePlugins..remove(id)).toList()..sort(),
      });
      _dropCache(id);
    }
    await installPlugin(pkg, pluginsRoot: pluginsDir(), replace: old);
    Analytics.instance.event('plugin_install', {
      'plugin_id': id,
      'plugin_version': pkg.manifest.info.version,
      'is_update': '${old != null && !replace}',
      'is_replace': '$replace',
    });
    final origins = pluginOrigins;
    pkg.origin.isEmpty ? origins.remove(id) : origins[id] = pkg.origin;
    _savePrefs({'pluginOrigins': origins});
    pluginUpdates.remove(id);
    await loadPlugins();
  }

  /// Uninstalls a plugin: deletes the plugin directory and its data (settings, sign-in state, cache).
  Future<void> uninstallPlugin(String id, String dir) async {
    if (_sourceId == id) setSource('local');
    if (id.isNotEmpty) {
      Analytics.instance.event('plugin_uninstall', {'plugin_id': id});
    }
    // When the id is empty (a plugin that failed to load or whose id can't be read), only delete the plugin directory
    for (final d in [
      dir,
      if (id.isNotEmpty) p.join(supportDir(), 'plugin-data', id),
    ]) {
      try {
        await Directory(d).delete(recursive: true);
      } on FileSystemException {
        // Already gone
      }
    }
    _savePrefs({
      'disabledPlugins': (_disabledIds..remove(id)).toList()..sort(),
      'allowPrograms': (allowPrograms..remove(id)).toList()..sort(),
      'autoUpdatePlugins': (autoUpdatePlugins..remove(id)).toList()..sort(),
      'pluginOrigins': pluginOrigins..remove(id),
    });
    pluginUpdates.remove(id);
    _dropCache(id);
    await loadPlugins();
  }

  // ───── Plugin accounts ─────

  /// Accounts signed in through plugins; plugins not signed in aren't here.
  final Map<String, m.Account> accounts = {};

  /// Plugins currently signing in.
  final Set<String> signingIn = {};

  Future<void> _refreshAccount(Source s) async {
    try {
      final a = await s.account();
      a == null ? accounts.remove(s.id) : accounts[s.id] = a;
      // Only switch the cache namespace once we know who it is (or that nobody's signed in); leave it alone if fetching the account fails
      _rememberAccount(s.id, a);
    } catch (e) {
      accounts.remove(s.id);
    }
    notifyListeners();
  }

  /// Saves plugin settings (settings in plugin.json). The plugin can read the new values right away; cached content
  /// and the account are fetched again with the new settings.
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

  /// What to show while a plugin signs in (host.signInPrompt): a QR code and instructions.
  SignInPrompt? signInPrompt;

  // Each sign-in gets a number; after cancelling, late results from the plugin no longer count.
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
      // Switch to this account's cache; ask once if the plugin didn't provide an account
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

  /// Closes the sign-in window: stops waiting for this sign-in.
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
    // Go back to the signed-out cache; this account's cache stays and is usable right away on the next sign-in
    _rememberAccount(s.id, null);
    _scheduleRefresh(Duration.zero);
    notifyListeners();
  }

  // ───── Current music source ─────
  // Chosen in Settings: local music or a plugin. With a plugin chosen, the library, search, album, artist
  // and playlist pages show that plugin's content. Switching sources clears the queue and closes Now Playing.

  String _sourceId = _prefs()['source'] as String? ?? 'local';

  /// The current source's id. Falls back to local when the chosen plugin isn't loaded.
  String get sourceId => sources[_sourceId] != null ? _sourceId : 'local';

  /// The current source is a plugin.
  bool get remote => sourceId != 'local';

  void setSource(String id) {
    if (id == sourceId) return;
    _sourceId = id;
    _savePrefs({'source': id});
    Analytics.instance.event('source_change', {'music_source': id});
    // Songs from the previous source don't stay in the queue
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

  /// Route for plugin pages: `/album/@source/id`, with the id encoded so it has no /.
  static String remoteRoute(String kind, String source, String id) =>
      '/$kind/@$source/${Uri.encodeComponent(id)}';

  // ───── Plugin data cache (SWR) ─────
  // Serve the cache first if any (even stale), refetch in the background when stale, and notify the UI to swap in the result. Plugin sources'
  // raw JSON is stored on disk, so there's content right after a restart. Keys are "source@account/path": switching accounts switches to another
  // set of caches, and the old account's stay, so switching back needs no reload.

  final SwrStore cache = SwrStore(dir: p.join(supportDir(), 'cache', 'api'));
  final AudioDiskCache audioCache = AudioDiskCache(
    dir: p.join(supportDir(), 'cache', 'audio'),
  );
  StreamSubscription<String>? _cacheSub;

  /// Sources that aren't cached, like local music: results are kept in memory for this run.
  final Map<String, Object?> _direct = {};
  final Map<String, Future<Object?>> _directInflight = {};

  /// The account id last confirmed for each source (stored in prefs): at launch the account isn't fetched yet, so caches are found by it first.
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

  /// "source@account": the cache namespace.
  String cacheSpace(String source) {
    final a = _accountIds[source] ?? '';
    return '$source@${a.isEmpty ? 'guest' : a}';
  }

  String _cacheKey(DataReq<Object?> r) =>
      '${cacheSpace(r.source)}/${PluginSource.language}/${r.path}';

  void _watchCache() {
    _cacheSub ??= cache.changes.listen((_) => _notifySoon());
  }

  /// Notifies only once when several cache entries update together.
  bool _notifyQueued = false;
  void _notifySoon() {
    if (_notifyQueued) return;
    _notifyQueued = true;
    scheduleMicrotask(() {
      _notifyQueued = false;
      notifyListeners();
    });
  }

  /// The data available now (even stale); refetches in the background when stale. Returns null if none.
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

  /// Fetches new data (waits if the same data is already being fetched).
  Future<T> loadData<T>(DataReq<T> r) async {
    final s = sources[r.source];
    if (s == null) {
      throw SourceError(SourceErrorKind.failed, L.sourceNotFound);
    }
    if (s is! PluginSource) {
      final k = '${r.source}/${r.path}';
      final pending = _directInflight[k];
      if (pending != null) return (await pending) as T;
      late final Future<T> request;
      request = r
          .direct(s)
          .then((value) {
            if (identical(_directInflight[k], request)) _direct[k] = value;
            return value;
          })
          .whenComplete(() {
            if (identical(_directInflight[k], request)) {
              _directInflight.remove(k);
            }
          });
      _directInflight[k] = request;
      return request;
    }
    _watchCache();
    final raw = await cache.fetch(
      _cacheKey(r),
      r.policy,
      () => s.raw(r.op, r.params, r.trackList),
    );
    return r.decode(raw);
  }

  /// Data not used within a page: returns the cache right away if present (refetching in the background when stale), otherwise waits for new data.
  Future<T> getData<T>(DataReq<T> r) async => peekData(r) ?? await loadData(r);

  /// Invalidates this data in the cache (e.g. after changing a playlist): refetched the next time it's used.
  void dropData(DataReq<Object?> r) {
    cache.invalidate(_cacheKey(r));
    _direct.remove('${r.source}/${r.path}');
  }

  /// Clears a source's caches for all accounts (plugin settings changed, e.g. a different server address or audio quality).
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

  // ── Prefetch when idle ──
  // After plugins load, the source switches, or sign-in/out, prefetch the current source's home and default Discover page in the background;
  // then check every 5 minutes and refetch when stale. Pages already have content when opened.

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

  // Plugin albums: converted to a UI Album and shown by AlbumPage like local albums.
  final Map<String, Album> _remoteAlbums = {};

  /// Remembers a plugin album and returns the id for AlbumPage.
  String putAlbum(String source, m.AlbumPage page) {
    final a = page.album;
    final id = '@$source/${a.id}';
    final first = a.artists.firstOrNull;
    _remoteAlbums[id] = _withCachedRelease(
      Album(
        id: id,
        title: a.name,
        artist: a.artists.map((x) => x.name).join(', '),
        artistImage: first?.imageUrl ?? '',
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

  // ───── Library ─────
  // Data for the four library tabs (songs, albums, playlists, artists), per source, loaded from the source
  // and cached on first open. Sources with library (local, self-hosted servers like Subsonic) give the whole
  // collection; streaming sources use liked songs and saved albums. When there's no separate artist data, artists are counted from songs and
  // albums.

  final Map<String, SourceLibrary> _libraries = {};

  /// The current source's library. null when no local music was found; the UI shows the empty state.
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

  /// Refetches the current plugin source's library in the background (needed to see songs liked or saved in the music platform's official client).
  /// The list in the UI isn't cleared; the result is swapped in as a whole. Skipped if fetched within 30 seconds.
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

  /// Refetches the library while on the library or Coverflow page: called when entering those pages and when the window comes to the front.
  void _refreshLibraryIfShown() {
    if (path.startsWith('/library') || path.startsWith('/coverflow')) {
      refreshLibrary();
    }
  }

  /// The window came to the front.
  void onAppResume() => _refreshLibraryIfShown();

  /// Reloads the current source's library.
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

    // Fetch page by page, showing each page as it arrives.
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

  /// Plugin source library: each part is fetched in full and cached (raw JSON). The next open shows the stored copy first
  /// and swaps in the full refetch when done; only when nothing is stored does it show page by page with a skeleton.
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
          // Treat a stored copy in the wrong format as missing
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

  /// Cache of album release dates (album id → yyyy-MM-dd; an empty string when looked up but unknown),
  /// stored in the cache directory so album details aren't looked up on every launch.
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

  /// For albums whose library listing has no release date, look up album details one by one and swap them in together when done.
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
          // Can't find it, try again next time
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
        artistImage: first?.imageUrl ?? '',
        cover: a.imageUrl,
        year: a.year ?? 0,
        added: DateTime.tryParse(a.added)?.toLocal(),
        released: DateTime.tryParse(a.released),
        copyright: a.copyright,
        // Track count unknown: spread the spine width by id within the design's 42–64
        spine: 42 + (a.id.hashCode % 23).abs().toDouble(),
        artistRoute: first == null || first.id.isEmpty
            ? ''
            : remoteRoute('artist', source, first.id),
      ),
    );
    _remoteAlbums.putIfAbsent(id, () => al);
    return al;
  }

  /// Artists in the bubbles: all artists from the source, or counted from songs and albums; sorted by song count
  /// (album count when there are no songs), descending.
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

  /// Plays an album; fetches the tracks first if a plugin album's tracks haven't been fetched yet.
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

  /// Plays a playlist.
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

  /// Shuffles all songs by an artist.
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

  // ───── Search history ─────
  // Recent search terms and things opened from search results, stored in search_history.json.

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

  /// Records a searched term, moving it to the front.
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

  /// Records something opened from the search results, moving it to the front.
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

  /// A source's trending searches (cached for an hour). Empty if the source doesn't support it or it can't be fetched.
  Future<List<m.HotSearch>> hotSearches(String source) {
    final s = sources[source];
    if (s == null || !s.can(Op.hotSearches)) return Future.value(const []);
    return getData(DataReq.hotSearches(source))
        .catchError((Object e) => <m.HotSearch>[]);
  }

  // ───── Player ─────
  // Songs in the queue are played by AudioEngine.
  List<Track> queue = [];

  /// The queue has playable songs.
  bool get hasQueue => queue.any((t) => t.ref != null);
  int index = const int.fromEnvironment('TRACK');

  /// The current song; a blank song when the queue is empty (the UI hides the player).
  Track get track => queue.isEmpty ? Track.none : queue[index];
  @visibleForTesting
  Track? get nextTrack {
    if (queue.isEmpty) return null;
    if (repeatMode == PlaybackRepeatMode.one) return track;
    if (index + 1 < queue.length) return queue[index + 1];
    return repeatMode == PlaybackRepeatMode.all ? queue.first : null;
  }

  /// Songs coming up next.
  List<Track> get upNext => hasQueue ? queue.sublist(index + 1) : const [];

  bool playing = false;

  // ───── Remembering playback state ─────
  // The queue, its original order, current index, position and origin are stored in player.json and restored paused on the next launch.
  // Only real songs are stored; if no real song was ever played nothing is stored and the floating player isn't shown.

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
      if (shuffle) _unshuffled = _restoreUnshuffled(j['unshuffled'], ts);
      final savedRepeat = j['repeat'];
      repeatMode = switch (savedRepeat) {
        'off' => PlaybackRepeatMode.off,
        'one' => PlaybackRepeatMode.one,
        false => PlaybackRepeatMode.off,
        _ => PlaybackRepeatMode.all,
      };
      playing = false;
    } catch (e) {
      debugPrint('player: $e');
    }
  }

  List<Track>? _restoreUnshuffled(Object? raw, List<Track> tracks) {
    if (raw is! List) return null;
    final seen = <int>{};
    final original = <Track>[];
    for (final i in raw) {
      if (i is! int || i < 0 || i >= tracks.length || !seen.add(i)) {
        return null;
      }
      original.add(tracks[i]);
    }
    return original;
  }

  /// State changed: written at most once every 2 seconds.
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
    final original = _unshuffled;
    final text = jsonEncode({
      'tracks': [for (final t in real) t.ref!.toJson()],
      if (shuffle && original != null)
        'unshuffled': _unshuffledIndices(real, original),
      'index': math.max(0, real.indexOf(track)),
      'position': position.floorToDouble(),
      'from': queueFrom,
      'name': _queueName,
      'shuffle': shuffle,
      'repeat': repeatMode.name,
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

  List<int> _unshuffledIndices(List<Track> tracks, List<Track> original) {
    final indices = <Track, List<int>>{};
    for (var i = tracks.length - 1; i >= 0; i--) {
      (indices[tracks[i]] ??= []).add(i);
    }
    return [
      for (final t in original)
        if (indices[t] case final positions? when positions.isNotEmpty)
          positions.removeLast(),
    ];
  }

  /// Where the current queue was played from: `album:<album id>`, `playlist:<source>/<playlist id>`,
  /// `library` (library songs); empty for anything else (a set of songs, the sample queue).
  String queueFrom = '';

  /// The name in "Now Playing · from …": album name, playlist name, "Library", etc.; hidden when empty.
  /// The library name is translated only when displayed: what's stored is in the language at play time and would mismatch after switching languages.
  String get queueName => queueFrom == 'library' ? L.navLibrary : _queueName;
  String _queueName = '';

  /// The page "from …" links to: present when the origin is an album or playlist, absent for stations, search results, the library and the like.
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

  /// A song's album page; null when the source doesn't support it or the album is unknown.
  String? albumRouteOf(Track t) {
    final r = t.ref;
    if (r == null || r.album.id.isEmpty) return null;
    final s = sources[r.source];
    if (s == null || !s.can(Op.album)) return null;
    return remoteRoute('album', r.source, r.album.id);
  }

  /// An artist's page in a source; null when the source doesn't support it or there's no id.
  String? artistRouteFor(String source, String id) {
    final s = sources[source];
    if (id.isEmpty || s == null || !s.can(Op.artist)) return null;
    return remoteRoute('artist', source, id);
  }

  /// Goes to a page, collapsing Now Playing first if open.
  void open(String route) {
    npOpen = false;
    go(route);
    notifyListeners();
  }

  /// Queue order before shuffling, restored when shuffle is turned off.
  List<Track>? _unshuffled;

  /// Playback position (seconds). A separate ValueNotifier so only progress-related widgets rebuild each frame.
  final ValueNotifier<double> pos = ValueNotifier(0);
  double get position => pos.value;
  set position(double v) => pos.value = v;

  /// Current track's duration in seconds, if known.
  double get playbackDuration => track.seconds > 0
      ? track.seconds.toDouble()
      : (_engineOnTrack ? _engineSeconds : 0);
  double get progress {
    final total = playbackDuration;
    return total == 0 ? 0 : (position / total).clamp(0.0, 1.0);
  }

  /// Slider position; actual loudness is converted with AudioEngine.mpvVolume's exponential curve.
  /// 0.72 is about −11 dB, as loud as the default 0.65 before the curve changed.
  // Volume and mute are stored in prefs, so they survive restarts
  double volume = ((_prefs()['volume'] as num?) ?? 0.72).toDouble().clamp(
    0.0,
    1.0,
  );
  bool muted = _prefs()['muted'] == true;
  Timer? _volumeSave;

  /// Changes constantly while dragging the volume bar; written to disk half a second after it stops.
  void _saveVolumeSoon() {
    _volumeSave?.cancel();
    _volumeSave = Timer(
      const Duration(milliseconds: 500),
      () => _savePrefs({'volume': volume, 'muted': muted}),
    );
  }

  bool shuffle = false;
  PlaybackRepeatMode repeatMode = PlaybackRepeatMode.all;
  final Set<String> liked = {};

  bool get isLiked => liked.contains(track.key);

  PlaybackEngine? _engine;

  /// Creates the playback engine; tests swap in a fake.
  @visibleForTesting
  static PlaybackEngine Function() engineFactory = AudioEngine.new;

  /// Which song is currently loaded in the engine (Track.key).
  String? _loadedKey;

  /// Which song the engine has actually opened. After switching songs and before the new one opens, it's still the old song (or empty),
  /// so the old song's progress and "finished" must not be credited to the new one.
  String? _engineKey;
  bool get _real => track.ref != null;
  bool get _engineOnTrack => _real && _engineKey == track.key;

  PlaybackEngine get _eng => _engine ??= _makeEngine();

  /// Scrobbling: decides the timing and notifies every plugin that exports
  /// nowPlaying / scrobble. Once a track counts, its own source is told too
  /// (played) so it can keep its own play history.
  late final _scrobbler = Scrobbler(
    onNowPlaying: (t) => _broadcast(Op.nowPlaying, (s) => s.nowPlaying(t)),
    onScrobble: (t, at, ms) {
      sources[t.source]
          ?.played(t)
          .catchError((Object e) => debugPrint('played ${t.source}: $e'));
      _broadcast(
        Op.scrobble,
        (s) => s.scrobble(t, startedAt: at, playedMs: ms),
      );
    },
  );

  // ── Playback state (playback) ──
  Timer? _playbackTimer;
  String _playbackSent = '';

  /// Playback state may have changed: wait briefly (rapid track changes or
  /// play clicks send only the last one) and skip it if the track and
  /// play / pause match what was last sent; [force] (a new track opened, a
  /// seek) always sends.
  void _playbackSoon({bool force = false}) {
    if (!sources.all.any((s) => s.can(Op.playback))) return;
    if (force) _playbackSent = '';
    _playbackTimer?.cancel();
    _playbackTimer = Timer(const Duration(milliseconds: 300), () {
      final r = track.ref;
      final on = r != null && playing;
      final sig = '${r?.key}|$on';
      if (sig == _playbackSent) return;
      _playbackSent = sig;
      final ms = (position * 1000).round();
      _broadcast(
        Op.playback,
        (s) => s.playback(r, playing: on, positionMs: ms),
      );
    });
  }

  void _broadcast(String op, Future<void> Function(Source s) call) {
    for (final s in sources.all.toList()) {
      if (!s.can(op)) continue;
      // Don't bother the user when a report fails; plugins handle retries and offline backlog
      call(s).catchError((Object e) => debugPrint('$op ${s.id}: $e'));
    }
  }

  PlaybackEngine _makeEngine() {
    final e = engineFactory();
    e.onPosition = (d) {
      if (!_engineOnTrack || _scrubbing || _seeking > 0) return;
      // mpv reports the position many times a second; 10 per second is enough for the UI, with immediate updates on seek.
      final v = d.inMilliseconds / 1000;
      if (v < position || v - position >= 0.1) position = v;
      if (_gaplessDurationPending && d > Duration.zero) {
        _gaplessDurationPending = false;
        if (_engineSeconds <= 0) unawaited(_readGaplessDuration(e, track.key));
      }
      _scrobbler.position(track.ref!, v, playing: playing);
      _reconcileNext();
    };
    e.onDuration = (d) {
      if (_engineOnTrack) _setEngineDuration(d);
    };
    e.onCompleted = () {
      if (!_engineOnTrack) return;
      _scrobbler.reset();
      // Sleep timer "after this track": stop at the start of the next one
      if (sleepAfterTrack) {
        _clearSleep();
        _next(play: false, completed: true);
        return;
      }
      if (repeatMode == PlaybackRepeatMode.one) {
        _repeatCurrent();
        return;
      }
      _next(play: true, completed: true);
    };
    e.onAdvanced = _onAdvanced;
    e.onError = (msg) => showToast(L.toastPlaybackError(msg));
    e.setVolume(effectiveVolume);
    e.setEq(eq);
    return e;
  }

  void _stopEngine() {
    _cancelPreload();
    _armedSig = null;
    _gaplessDurationPending = false;
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
    if (repeatMode == PlaybackRepeatMode.one) return track;
    if (index + 1 < queue.length) return queue[index + 1];
    if (repeatMode == PlaybackRepeatMode.all && queue.length > 1) {
      return queue[0];
    }
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

  /// Once the current song plays steadily, preload the next song's lyrics and audio in the background.
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

    // 0. Preload the cover: downloads it into the image disk cache and
    // extracts its colors, so the Now Playing background can start its
    // transition the moment the song changes instead of waiting on the network
    if (t.cover.isNotEmpty) CoverColors.instance.load(t.cover).ignore();

    // 1. Preload lyrics (through the data cache, so switching to it hits synchronously)
    final src = sources[ref.source];
    if (src != null && src.can(Op.lyrics)) {
      final req = DataReq.lyrics(ref.source, ref.id);
      if (peekData(req) == null) {
        loadData(req).then((_) {}, onError: (_) {});
      }
    }

    // 2. Preload audio: check the disk cache first; if absent, fetch the playback URL early and cache the audio file in the background
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
      // A preload failure doesn't affect current playback; it retries normally when switching to that song
    }
  }

  // ───── Gapless playback ─────
  // Shortly before the current track ends, queue the next one (a local file or
  // cached audio) in mpv, which continues by itself; [_onAdvanced] then moves the
  // app's current track along. When the next track changes (play next, removal,
  // shuffle, repeat, ReplayGain setting…) it's dropped and queued again, so queue
  // operations don't need to sync mpv: the position callback reconciles it.

  /// Seconds before the end at which the next track is queued.
  static const _gaplessLead = 30.0;

  /// The track queued in mpv: `key|replaygain`.
  String? _armedSig;
  bool _arming = false;

  /// Which track last failed to queue (not cached yet) and when; retried after a second.
  String? _armMissSig;
  DateTime _armMissAt = DateTime(0);

  /// Duration of the current track reported by mpv (seconds), more exact than the metadata; 0 until known.
  double _engineSeconds = 0;
  bool _gaplessDurationPending = false;

  Future<void> _readGaplessDuration(PlaybackEngine engine, String key) async {
    final duration = await engine.readDuration();
    if (_engineOnTrack && track.key == key && _engineSeconds <= 0) {
      _setEngineDuration(duration);
    }
  }

  void _setEngineDuration(Duration duration) {
    final previous = playbackDuration;
    _engineSeconds = duration.isNegative ? 0 : duration.inMilliseconds / 1000;
    if (playbackDuration != previous) notifyListeners();
  }

  /// The stream playing in the engine, for ReplayGain setting changes.
  m.AudioStream? _engineStream;

  /// The track that should be queued in mpv now; null when none should.
  Track? get _gaplessNext {
    if (sleepAfterTrack) return null;
    final n = _nextTrack;
    if (n == null || n.ref == null || n.key == track.key) return null;
    return n;
  }

  void _reconcileNext() {
    final e = _engine;
    if (e == null || !_engineOnTrack) return;
    final n = _gaplessNext;
    final sig = n == null ? null : '${n.key}|$_rg';
    if (e.queuedKey != null && sig != _armedSig) {
      _armedSig = null;
      e.dropQueued().ignore();
    }
    if (n == null || sig == _armedSig || _arming || !playing) return;
    final total = _engineSeconds > 0
        ? _engineSeconds
        : track.seconds.toDouble();
    if (total <= 0 || total - position > _gaplessLead) return;
    // If it isn't cached yet, check again every second (the preload may still be downloading)
    if (sig == _armMissSig &&
        DateTime.now().difference(_armMissAt) < const Duration(seconds: 1)) {
      return;
    }
    _arming = true;
    _armNext(n, sig!).whenComplete(() => _arming = false);
  }

  Future<void> _armNext(Track t, String sig) async {
    final ref = t.ref!;
    try {
      // Only queue local files: no headers or expiring URLs, and mpv prefetches them fast
      final m.AudioStream? s = ref.source == 'local'
          ? await sources.stream(ref)
          : await audioCache.get('${cacheSpace(ref.source)}/${ref.id}');
      if (s == null || !s.url.startsWith('file:')) {
        _armMissSig = sig;
        _armMissAt = DateTime.now();
        return;
      }
      final n = _gaplessNext;
      if (!_engineOnTrack || n == null || '${n.key}|$_rg' != sig) return;
      final rg = _rg;
      await _eng.queueNext(s, key: t.key, rg: rg, gainDb: streamGainDb(s, rg));
      _armedSig = sig;
      _armedStream = s;
    } catch (e) {
      debugPrint('gapless: $e');
    }
  }

  m.AudioStream? _armedStream;

  /// mpv moved on to the queued track.
  void _onAdvanced(String key) {
    _armedSig = null;
    _engineSeconds = 0;
    final s = _armedStream;
    _armedStream = null;
    final n = _nextTrack;
    if (n != null && n.key == key) {
      index = index + 1 < queue.length ? index + 1 : 0;
    } else {
      // The queue changed at the last moment: follow mpv if its track is still queued, otherwise reopen from the queue
      final i = queue.indexWhere((t) => t.key == key);
      if (i < 0) {
        _loadedKey = key;
        _engineKey = key;
        _sync();
        return;
      }
      index = i;
    }
    final t = track;
    position = 0;
    _scrubbing = false;
    _loadedKey = key;
    _engineKey = key;
    _engineStream = s;
    // The duration stream drops equal values, and its state can still be stale
    // until the next file starts producing positions.
    _gaplessDurationPending = true;
    _preloadedStream = null;
    // A new listen for scrobbling, and tell plugins the track changed
    _scrobbler.reset();
    _playbackSoon(force: true);
    _topUpStation();
    if (!_applyCachedLyrics(t)) _loadLyrics(t);
    final ref = t.ref;
    if (ref != null) {
      Analytics.instance.event('play', {
        'music_source': ref.source,
        'from_cache': '${ref.source != 'local'}',
      });
    }
    notifyListeners();
    _schedulePreloadNext();
  }

  // ───── Volume normalization ─────
  GainMode gainMode = GainMode.values.firstWhere(
    (x) => x.name == _prefs()['gainMode'],
    orElse: () => GainMode.smart,
  );

  /// The replaygain value for mpv: in smart mode, album gain when an album plays in order.
  String get _rg => mpvReplayGain(
    gainMode,
    albumOrder: queueFrom.startsWith('album:') && !shuffle,
  );

  void setGainMode(GainMode mode) {
    if (gainMode == mode) return;
    gainMode = mode;
    _savePrefs({'gainMode': mode.name});
    final rg = _rg;
    final s = _engineStream;
    if (_engineKey != null) {
      _engine?.setReplayGain(rg, s == null ? 0 : streamGainDb(s, rg));
    }
    notifyListeners();
  }

  // ───── Equalizer ─────
  EqSettings eq = EqSettings.fromJson(_prefs()['eq']);
  Timer? _eqSave;

  /// Changes continuously while dragging: the engine follows immediately, prefs are saved half a second after it stops.
  void setEq(EqSettings s) {
    eq = s;
    _engine?.setEq(s);
    _eqSave?.cancel();
    _eqSave = Timer(
      const Duration(milliseconds: 500),
      () => _savePrefs({'eq': eq.toJson()}),
    );
    notifyListeners();
  }

  // ───── Sleep timer ─────
  // Fades out over the last [sleepFade] and pauses at the deadline; can also stop
  // after the current track. The fade only scales the engine volume, not the saved one.

  /// The deadline; null when off or when stopping after the current track.
  DateTime? sleepAt;

  /// Stop when the current track ends.
  bool sleepAfterTrack = false;

  static const sleepFade = Duration(seconds: 20);
  Timer? _sleepTick;

  bool get sleepOn => sleepAt != null || sleepAfterTrack;

  /// Time left; null unless a time was set.
  Duration? get sleepLeft {
    final at = sleepAt;
    if (at == null) return null;
    final d = at.difference(DateTime.now());
    return d.isNegative ? Duration.zero : d;
  }

  /// Stop after [d]; null turns it off.
  void setSleepTimer(Duration? d) {
    _clearSleep();
    if (d != null) {
      sleepAt = DateTime.now().add(d);
      _sleepTick = Timer.periodic(
        const Duration(milliseconds: 250),
        (_) => _onSleepTick(),
      );
    }
    notifyListeners();
  }

  /// Stop when the current track ends.
  void setSleepAfterTrack() {
    _clearSleep();
    sleepAfterTrack = true;
    // Drop the track queued in mpv so playback really stops at the end of this one
    _reconcileNext();
    notifyListeners();
  }

  void _clearSleep() {
    _sleepTick?.cancel();
    _sleepTick = null;
    sleepAt = null;
    sleepAfterTrack = false;
    _engine?.setFade(1);
  }

  void _onSleepTick() {
    final left = sleepLeft;
    if (left == null) return;
    if (left == Duration.zero) {
      // Pause before restoring the volume so there's no sudden burst
      final e = _engine;
      _sleepTick?.cancel();
      _sleepTick = null;
      sleepAt = null;
      pause();
      e?.setFade(1);
      notifyListeners();
      return;
    }
    _engine?.setFade(sleepFadeAt(left));
  }

  /// Volume factor (amplitude) with [left] to go: drops to 0 over the last [sleepFade]
  /// on a square curve, which sounds more even than linear.
  static double sleepFadeAt(Duration left) {
    if (left >= sleepFade) return 1;
    final x = left.inMilliseconds / sleepFade.inMilliseconds;
    return (x * x).clamp(0.0, 1.0);
  }

  /// Brings the engine in line with the current state: reopens on song change, otherwise just toggles play/pause.
  Future<void> _sync() async {
    _playbackSoon();
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
    _armedSig = null;
    _gaplessDurationPending = false;
    // If lyrics are already cached (e.g. preloaded), fill them in synchronously so the first frame after switching doesn't flash the no-lyrics view
    if (_applyCachedLyrics(t)) notifyListeners();
    // Stop the old song first: while fetching the new URL, the old song stays silent and stops reporting progress
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
      // The song being preloaded is exactly the one switched to: turn it into the current download instead of cancelling
      _cachingAudioKey = audioKey;
      _preloadingAudioKey = null;
      _preloadTimer?.cancel();
      _preloadTimer = null;
      _preloadKey = null;
    } else {
      _cancelPreload(keepAudioKey: audioKey);
    }
    // Disk audio cache hit (valid for a month): play the local file directly, no network and no SWR
    m.AudioStream? cached;
    if (audioKey != null) {
      cached = await audioCache.get(audioKey);
      if (_loadedKey != t.key) return;
    }
    final preloaded = cached == null ? _takePreloadedStream(t.key) : null;
    // When skipping through songs quickly, only ask the plugin for the URL and lyrics of the song that's settled on; preloaded ones start right away.
    if (ref.source != 'local' && cached == null && preloaded == null) {
      await Future<void>.delayed(const Duration(milliseconds: 300));
      if (_loadedKey != t.key) return;
    }
    _loadLyrics(t);
    try {
      final s = cached ?? preloaded ?? await sources.stream(ref);
      // Switched to another song while fetching the URL
      if (_loadedKey != t.key) return;
      final at = position;
      final rg = _rg;
      _engineSeconds = 0;
      await _eng.open(
        s,
        key: t.key,
        play: playing,
        start: at > 0.5 ? Duration(milliseconds: (at * 1000).round()) : null,
        rg: rg,
        gainDb: streamGainDb(s, rg),
      );
      if (_loadedKey == t.key) {
        _engineKey = t.key;
        _engineStream = s;
        // The duration event can arrive before open finishes.
        _setEngineDuration(_eng.duration);
        _playbackSoon(force: true);
        // Record only which source, not which song; restoring the queue at launch (without playing) doesn't count
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
      // Unexpected errors like the engine failing to open: drop this song too. Otherwise _loadedKey would stay on it,
      // and later pressing play would only play an empty engine, so this song could never play again; the error would also become uncaught.
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

  // Dragging the progress bar only moves the displayed position; the real seek happens on release, and old positions from mpv are ignored until it completes.
  bool _scrubbing = false;
  int _seeking = 0;

  /// While dragging: only update the displayed position.
  void scrub(double frac) {
    final total = playbackDuration;
    if (total <= 0) return;
    _scrubbing = true;
    position = frac.clamp(0.0, 1.0) * total;
  }

  /// Seeks to [frac] (0–1). Called on release when dragging the progress bar.
  void seek(double frac) => seekTo(frac.clamp(0.0, 1.0) * playbackDuration);

  void seekTo(double seconds) {
    _scrubbing = false;
    final total = playbackDuration;
    if (total <= 0) return;
    position = seconds.clamp(0.0, total);
    _playbackSoon(force: true);
    if (_engineOnTrack) {
      _seekEngine(Duration(milliseconds: (position * 1000).round()));
    }
  }

  void _seekEngine(Duration to) {
    _seeking++;
    _eng.seek(to).whenComplete(() => _seeking--);
  }

  /// Seeks forward / back [s] seconds.
  void seekBy(double s) => seekTo(position + s);

  /// Next track. With [play] false it only moves to it without playing (for the sleep timer).
  void next({bool play = true}) => _next(play: play);

  void _next({required bool play, bool completed = false}) {
    if (queue.isEmpty) return;
    // A station reached its last song: wait for the next batch, then continue
    if (index + 1 >= queue.length &&
        station != null &&
        repeatMode == PlaybackRepeatMode.off) {
      _stationStalled = true;
      _topUpStation();
      return;
    }
    // Pressing next while paused also starts playing right away
    _cameBackTo = null;
    if (index + 1 < queue.length) {
      index++;
      playing = play;
    } else if (repeatMode != PlaybackRepeatMode.off) {
      index = 0;
      playing = play;
    } else {
      playing = false;
      // After EOF the engine already restarts at zero on play.
      if (!completed && _engineOnTrack) {
        _scrubbing = false;
        _seekEngine(Duration.zero);
        _playbackSoon(force: true);
      }
    }
    position = 0;
    notifyListeners();
    _sync();
  }

  void _repeatCurrent() {
    position = 0;
    playing = true;
    _scrubbing = false;
    notifyListeners();
    if (_engineOnTrack) _seekEngine(Duration.zero);
    _sync();
  }

  void prev() {
    if (queue.isEmpty) return;
    if (position > 3 || index == 0) {
      seek(0);
    } else {
      index--;
      position = 0;
      _cameBackTo = track.key;
    }
    notifyListeners();
    _sync();
  }

  /// The song [prev] last stepped back to; anything else that lands on a
  /// different song makes [skippedBack] false without needing a reset.
  String? _cameBackTo;

  /// Whether the current song was reached by going back ([prev]), so song
  /// change animations can run in reverse.
  bool get skippedBack => _cameBackTo == track.key;

  /// Plays a song: jumps to it if it's in the queue, otherwise inserts it after the current one.
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

  /// Replaces the queue with a real album and plays from song [start].
  /// For [shuffled] see [playList].
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

  /// Replaces the queue with a set of songs and plays from song [start].
  /// For [from] see [queueFrom]; for [name] see [queueName].
  /// [shuffled]: true shuffles (turns shuffle on and starts from a random song, ignoring [start]);
  /// false plays in order (turns shuffle off); null follows the current shuffle mode.
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
      // Shuffle everything: pick a random song to play first and shuffle the rest after it; turning shuffle off restores the original order
      _unshuffled = List.of(queue);
      final first = queue.removeAt(math.Random().nextInt(queue.length));
      queue = [first, ...queue..shuffle()];
      index = 0;
    } else if (shuffle) {
      _shuffleRest();
    }
    position = 0;
    playing = true;
    _restartLoadedTrack();
    notifyListeners();
    _sync();
  }

  void playQueueAt(int i) {
    if (queue.isEmpty) return;
    final previous = index;
    index = i.clamp(0, queue.length - 1);
    position = 0;
    playing = true;
    if (index != previous) _restartLoadedTrack();
    notifyListeners();
    _sync();
  }

  void _restartLoadedTrack() {
    if (!_engineOnTrack) return;
    _scrubbing = false;
    _scrobbler.reset();
    _seekEngine(Duration.zero);
    _playbackSoon(force: true);
  }

  void addNext(Track t) {
    final entry = _newQueueEntry(t);
    queue.isEmpty ? queue.add(entry) : queue.insert(index + 1, entry);
    notifyListeners();
    if (playing) _schedulePreloadNext();
  }

  void addToQueue(Track t) {
    queue.add(_newQueueEntry(t));
    notifyListeners();
    if (playing) _schedulePreloadNext();
  }

  Track _newQueueEntry(Track t) {
    if (!queue.contains(t)) return t;
    return t.copy();
  }

  void _removeQueueEntryAt(int i) {
    final removed = queue.removeAt(i);
    // Songs removed while shuffled must also be removed from the original order, or they'd come back when shuffle is turned off
    _unshuffled?.remove(removed);
  }

  void removeQueueAt(int i) {
    if (i < 0 || i >= queue.length) return;
    if (queue.length == 1) {
      clearQueue();
      return;
    }
    final removingCurrent = i == index;
    _removeQueueEntryAt(i);
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
    _playbackSoon();
    // Otherwise the next launch would restore the queue from before it was cleared
    _playerSave?.cancel();
    _playerSaved = '';
    try {
      File(_playerPath()).deleteSync();
    } on FileSystemException {
      // Wasn't there to begin with
    }
    notifyListeners();
  }

  /// Shuffle: shuffles the songs after the current one; turning it off restores the original order, keeping the current song.
  void toggleShuffle() {
    shuffle = !shuffle;
    if (shuffle) {
      _unshuffled = List.of(queue);
      _shuffleRest();
    } else if (_unshuffled != null) {
      final cur = track;
      // Songs added to the queue while shuffled are appended to the original order
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

  // ───── Stations ─────
  // Station queues are recognised by [queueFrom] = `station:<source>/<station id>`; near the end, the next batch is requested from the source.

  /// The station playing (source, station id); null when not a station.
  (String, String)? get station {
    if (!queueFrom.startsWith('station:')) return null;
    final v = queueFrom.substring(8);
    final i = v.indexOf('/');
    return i > 0 ? (v.substring(0, i), v.substring(i + 1)) : null;
  }

  bool _stationBusy = false;

  /// Reached the last song and waiting for the next batch.
  bool _stationStalled = false;

  /// A batch of station songs, minus those that can't be played.
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
    // The heart on the card must be right: check whether it's liked once fetched
    checkLiked(out);
    return out;
  }

  /// Plays a station; [name] is shown in "Now Playing · from …". [first] is a batch already
  /// fetched (the ones previewed on the home page); if absent it's fetched now, continuing from the current song.
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

  // ───── For the song context menu ─────

  final Map<String, Future<List<m.Playlist>>> _editable = {};

  /// Playlists the user created in this source that songs can be added to (excluding fixed playlists like "Liked Songs").
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

  /// Playlist content changed: refetch next time the playlist page opens, and refetch only the playlists of
  /// the loaded library so the cards show the new track count and cover. Tracks, albums and artists stay cached.
  void _playlistChanged(String source, String id) {
    dropData(DataReq.playlist(source, id));
    _editable.remove(source);
    _refreshLibraryPlaylists(source);
  }

  /// Refetches the playlists of [source]'s loaded library and swaps them in. A library that isn't loaded yet
  /// fetches them anyway when it opens. On failure what is shown stays as it is.
  Future<void> _refreshLibraryPlaylists(String source) async {
    final s = sources[source];
    final lib = _libraries[source];
    if (s == null || lib == null || !s.can(Op.playlists)) return;
    try {
      final List<m.Playlist> list;
      if (s is PluginSource) {
        // Same op and stored copy as [_loadPluginLibrary], so the next launch shows the new cards too.
        final raw = await s.raw(Op.playlists);
        final items = raw is List ? raw : const <Object?>[];
        list = List.unmodifiable([
          for (final x in items)
            if (x is Map) m.Playlist.fromJson(x.cast<String, Object?>()),
        ]);
        cache.put(
          '${cacheSpace(s.id)}/library/playlists',
          Policies.mine,
          items,
        );
      } else {
        list = await s.playlists();
      }
      if (_libraries[source] != lib) return;
      lib.playlists = list;
      lib.errors.remove('playlists');
      notifyListeners();
    } catch (_) {
      // Keep the cards already shown.
    }
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

  /// Removes this song from playlist [playlist]. Returns true on success.
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

  /// Plays songs similar to this one.
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

  /// Runs a menu item added by a plugin, then shows a message, copies, opens a page or plays songs per the plugin's result.
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

  /// Whether the source can be told "dislike" for this song.
  bool canDislike(Track t) {
    final r = t.ref;
    return r != null && (sources[r.source]?.can(Op.dislike) ?? false);
  }

  /// Dislike: tells the source and removes it from the queue; skips to the next song if it's playing.
  Future<void> dislike(Track t) async {
    final ref = t.ref;
    final s = ref == null ? null : sources[ref.source];
    if (ref == null || s == null || !s.can(Op.dislike)) return;
    final st = station;
    final i = queue.indexWhere((q) => q.key == t.key);
    if (i >= 0 && i == index) {
      next();
      if (index == i + 1) {
        _removeQueueEntryAt(i);
        index--;
      }
    } else if (i >= 0) {
      _removeQueueEntryAt(i);
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

  // ───── Comments ─────
  final Map<String, CommentFeed> _comments = {};

  /// Whether the current song's source has comments.
  bool get canComments {
    final r = track.ref;
    return r != null && (sources[r.source]?.can(Op.comments) ?? false);
  }

  /// Comments on [t] sorted by [sort]; switching back gives the same instance, continuing where paging left off.
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

  // ───── Similar songs ─────
  // Stored in the cache (not refetched within a day); conversion to UI Tracks is remembered once per source data list.
  final _similarTracks = Expando<List<Track>>();
  final Set<String> _similarLoading = {}, _similarFailed = {};

  /// Whether the current song's source can give similar songs (local music can't).
  bool get canSimilar {
    final r = track.ref;
    return r != null && (sources[r.source]?.can(Op.similar) ?? false);
  }

  /// Songs similar to [t]; starts fetching if not yet fetched, returning null until done.
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

  void setRepeatMode(PlaybackRepeatMode mode) {
    if (repeatMode == mode) return;
    repeatMode = mode;
    notifyListeners();
    _savePlayerSoon();
    if (playing) _schedulePreloadNext();
    _reconcileNext();
  }

  void toggleRepeat() {
    setRepeatMode(switch (repeatMode) {
      PlaybackRepeatMode.off => PlaybackRepeatMode.all,
      PlaybackRepeatMode.all => PlaybackRepeatMode.one,
      PlaybackRepeatMode.one => PlaybackRepeatMode.off,
    });
  }

  /// Likes / unlikes a song. Songs from plugins sync to the source (e.g. the platform's "Liked Songs" playlist);
  /// the UI changes first and reverts if the source errors.
  void toggleLike([Track? t]) {
    final tr = t ?? track;
    final k = tr.key;
    // The previous one hasn't returned yet: another tap would fight with the failure rollback, so ignore it for now
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

  /// Songs (keys) whose like / unlike is being sent to the source.
  final _liking = <String>{};

  /// A streaming source's library is its liked songs and saved albums: after a successful like / save, update the loaded
  /// library directly instead of reloading it all. "Whole collection" sources like self-hosted servers are unaffected.
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
          artistImage: al.artistImage,
          added: DateTime.now(),
          spine: 42 + (al.id.hashCode % 23).abs().toDouble(),
        ),
      ...rest,
    ]);
    lib.artists = _libraryArtists(s.id, lib, const []);
    notifyListeners();
  }

  /// Songs (Track.key) already asked about at the source for liked status.
  final Set<String> _likeKnown = {};

  /// Asks the source whether a batch of songs is liked and updates [liked]. Songs already asked aren't asked again; failures are ignored.
  Future<void> checkLiked(Iterable<Track> ts) async {
    final bySource = <String, Map<String, String>>{}; // source → song id → key
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

  /// Changes volume by [d] (0–1); unmutes first if muted.
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

  // ───── Lyrics ─────
  List<LyricLine> _lyrics = const [];
  String? _lyricsKey;

  /// Lyrics for the current song, loaded from the source (async, empty before loading).
  List<LyricLine> get lyricLines =>
      _lyricsKey == track.key ? _lyrics : const [];

  bool get hasLyrics => lyricLines.isNotEmpty;

  /// Lyrics for the current song are still being fetched from the source (the source supports lyrics and isn't done yet).
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

  /// The line being sung, or -1 before the first line starts (or when there are no lyrics).
  /// Reads [position], so use it inside a [pos] listener.
  int get lyricIndex {
    final ls = lyricLines;
    if (ls.isEmpty) return -1;
    final ms = (position * 1000).round();
    var lo = 0, hi = ls.length - 1, ans = -1;
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

  /// Tapping a lyric seeks to that line.
  void seekLyric(int i) {
    final ls = lyricLines;
    if (i < 0 || i >= ls.length) return;
    seekTo(ls[i].start / 1000);
  }

  Future<void> _loadLyrics(Track t) async {
    final ref = t.ref;
    if (ref == null || _lyricsKey == t.key) return;
    if (_applyCachedLyrics(t)) {
      notifyListeners();
      return;
    }
    final src = sources[ref.source];
    bool current() =>
        track.key == t.key &&
        (ref.source != 'local' || identical(sources[ref.source], src));
    try {
      final l = src == null || !src.can(Op.lyrics)
          ? const m.Lyrics()
          : await getData(DataReq.lyrics(ref.source, ref.id));
      if (!current()) return;
      _lyrics = _parseLyrics(l);
      _lyricsKey = t.key;
      notifyListeners();
    } catch (_) {
      // Lyrics are optional; treat a load failure as none
      if (current()) {
        _lyrics = const [];
        _lyricsKey = t.key;
        notifyListeners();
      }
    }
  }

  double get effectiveVolume => muted ? 0 : volume;

  // ───── Settings ─────
  int _swatch = _swatchIndexOf(_prefs()['swatch']);
  String lang = _prefs()['lang'] as String? ?? 'system';

  /// On: the mini player always shows the current lyric. Off: only while hovering its progress bar.
  bool _miniLyric = _prefs()['miniLyric'] == true;
  bool get miniLyric => _miniLyric;
  set miniLyric(bool v) {
    _miniLyric = v;
    _savePrefs({'miniLyric': v});
  }

  /// Closing the window hides it and keeps the app (and playback) running.
  /// The native side learns about it through _syncWindowPrefs in shell.dart.
  bool _keepRunning = _prefs()['keepRunning'] == true;
  bool get keepRunning => _keepRunning;
  set keepRunning(bool v) {
    _keepRunning = v;
    _savePrefs({'keepRunning': v});
  }

  /// 灵动岛（只有 macOS）：屏幕顶部刘海处的迷你播放器，默认开。
  bool island = _prefs()['dynamicIsland'] as bool? ?? true;

  void setIsland(bool v) {
    if (island == v) return;
    island = v;
    _savePrefs({'dynamicIsland': v});
    notifyListeners();
  }

  int get swatch => _swatch;
  Locale? get locale => AppLanguage.byCode(lang).locale;

  static bool _validSwatch(int index) =>
      index >= 0 && index < swatchKeys.length;

  /// Prefs store the swatch by key (e.g. 'mint'); anything unknown falls back to 0.
  static int _swatchIndexOf(Object? key) {
    final i = key is String ? swatchKeys.indexOf(key) : -1;
    return i < 0 ? 0 : i;
  }

  void setSwatch(int index) {
    if (!_validSwatch(index) || _swatch == index) return;
    _swatch = index;
    _savePrefs({'swatch': swatchKeys[index]});
    notifyListeners();
  }

  void setLang(String code) {
    final normalized = AppLanguage.byCode(code).code;
    if (lang == normalized) return;
    lang = normalized;
    _savePrefs({'lang': lang});
    notifyListeners();
  }

  /// Bytes each of the three disk caches uses now: (data, images, audio).
  Future<(int, int, int)> cacheSizes() async => (
    await cache.size(),
    await ImageDiskCache.instance.size(),
    await audioCache.size(),
  );

  /// Clears the data, image and audio caches; pages on screen refetch on their own once their cache is gone.
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

  /// Only the dark theme is offered (Settings no longer has a light/dark switch).
  bool get isDark => true;

  void applyTheme() {
    P = isDark ? Palette.darkPalette : Palette.lightPalette;
    accent = (isDark ? swatchesDark : swatchesLight)[swatch];
  }

  void update(void Function() f) {
    f();
    notifyListeners();
  }

  // ───── A bit of page state kept across pages ─────
  String shelfId = '';
  int shelfSort = 1;

  /// Saved albums (ids as used by [albumOf]).
  final Set<String> savedAlbums = {};

  /// Saves / unsaves an album; plugin albums sync to the source and revert if the source errors.
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
    _pluginGen++; // plugins being auto-restarted aren't put back
    mcp.stop(notify: false);
    _trimTimer?.cancel();
    _refreshTimer?.cancel();
    _pluginUpdateTimer?.cancel();
    _preloadTimer?.cancel();
    _sleepTick?.cancel();
    if (_eqSave?.isActive ?? false) {
      _eqSave!.cancel();
      _savePrefs({'eq': eq.toJson()});
    }
    _cacheSub?.cancel();
    // Quitting within half a second of dragging the volume: write the pending volume
    if (_volumeSave?.isActive ?? false) {
      _volumeSave!.cancel();
      _savePrefs({'volume': volume, 'muted': muted});
    }
    _playerSave?.cancel();
    _savePlayer();
    _engineKey = null;
    _engine?.dispose();
    audioCache.dispose();
    cache.dispose();
    sources.closeAll();
    pos.dispose();
    super.dispose();
  }
}

/// Provided through InheritedNotifier; any change rebuilds dependent widgets.
class AppScope extends InheritedNotifier<AppState> {
  const AppScope({super.key, required AppState state, required super.child})
    : super(notifier: state);

  static AppState of(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<AppScope>()!.notifier!;

  /// Reads only, without subscribing.
  static AppState read(BuildContext context) =>
      context.getInheritedWidgetOfExactType<AppScope>()!.notifier!;
}

extension AppX on BuildContext {
  AppState get app => AppScope.of(this);
  AppState get appRead => AppScope.read(this);
}

/// A source's library, filled in gradually while loading.
class SourceLibrary {
  /// When loading from the source last started, used by [AppState.refreshLibrary] to limit frequency.
  DateTime loadedAt = DateTime.now();
  bool refreshing = false;

  List<Track> tracks = const [];
  List<Album> albums = const [];
  List<m.Playlist> playlists = const [];
  List<LibraryArtist> artists = const [];

  /// Parts being loaded: tracks, albums, playlists, artists.
  final Set<String> loading = {};
  final Map<String, Object> errors = {};
}

/// One entry in the library's "Artists".
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

  /// cover is the artist's own avatar (not pieced together from track or album covers).
  final bool hasAvatar;

  /// The page it opens; not tappable when empty.
  final String route;

  /// Number of songs (or albums) by this artist in the library, which decides the bubble size.
  final int weight;
}

/// What the app should show while a plugin signs in.
class SignInPrompt {
  const SignInPrompt({
    required this.source,
    required this.name,
    required this.qr,
    required this.text,
  });
  final String source, name, qr, text;
}

/// Something opened from search results: a song, album, artist or playlist.
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

  /// The song itself; tapping plays it directly.
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
