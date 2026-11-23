// 把插件变成一个音乐源：每个插件跑在自己的 isolate 里（QuickJS 运行时只在
// 那个 isolate 里用），主 isolate 这边的 PluginSource 把 Source 的方法翻译成
// 插件调用，把结果 JSON 转成模型。
//
// 插件目录：<应用支持目录>/plugins/<id>/plugin.json
// 插件数据：<应用支持目录>/plugin-data/<id>/（storage.json、settings.json）

import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:isolate';

import 'package:path/path.dart' as p;

import '../l10n/l10n.dart';
import '../music/models.dart';
import '../net/proxy.dart';
import '../music/source.dart';
import '../version.dart';
import 'locale.dart';
import 'manifest.dart';
import 'qjs.dart' show HostError;
import 'runtime.dart';

/// 插件 isolate 的启动参数。
class _Boot {
  _Boot(
    this.port,
    this.dir,
    this.dataDir,
    this.manifest,
    this.settings,
    this.proxy,
    this.allowPrograms,
    this.language,
  );
  final SendPort port;
  final String dir, dataDir, manifest, language;
  final Map<String, String> settings;
  final Map<String, Object?>? proxy;
  final bool allowPrograms;
}

Future<void> _worker(_Boot b) async {
  final inbox = ReceivePort();
  b.port.send(inbox.sendPort);
  // 要主 isolate 做的事（弹登录窗口等）：发 ask，等 answer。
  final asks = <int, Completer<Object?>>{};
  var nextAsk = 0;
  Future<Object?> ask(String op, Map<String, Object?> args) {
    final id = ++nextAsk;
    final c = asks[id] = Completer<Object?>();
    b.port.send(['ask', id, op, args]);
    return c.future;
  }

  // 这个 isolate 里的报错文案也跟应用语言走
  L = l10nForTag(b.language);
  final rt = PluginRuntime(
    language: b.language,
    manifest: PluginManifest.parse(b.manifest),
    dir: b.dir,
    dataDir: b.dataDir,
    settings: b.settings,
    proxy: HttpProxy.fromJson(b.proxy),
    allowPrograms: b.allowPrograms,
    onAsk: ask,
    onLog: (level, msg) => b.port.send(['log', level, msg]),
  )..onBroken = (why) => b.port.send(['broken', why]);
  try {
    b.port.send(['ready', await rt.load()]);
  } catch (e) {
    b.port.send(['failed', e is PluginError ? e.message : '$e']);
    rt.dispose();
    inbox.close();
    return;
  }
  await for (final m in inbox) {
    final msg = m as List;
    switch (msg[0]) {
      case 'call':
        final id = msg[1] as int;
        rt
            .call(msg[2] as String, (msg[3] as Map?)?.cast())
            .then(
              (v) => b.port.send(['result', id, true, v]),
              onError: (Object e) => b.port.send([
                'result',
                id,
                false,
                e is PluginError ? [e.code, e.message] : ['', '$e'],
              ]),
            );
      case 'setting':
        rt.setSetting(msg[1] as String, msg[2] as String);
      case 'language':
        rt.language = msg[1] as String;
        L = l10nForTag(rt.language);
      case 'answer':
        final c = asks.remove(msg[1]);
        if (c == null) break;
        if (msg[2] == true) {
          c.complete(msg[3]);
        } else {
          c.completeError(HostError(msg[3] as String));
        }
      case 'close':
        rt.dispose();
        inbox.close();
        b.port.send(['closed']);
    }
  }
}

/// 插件要应用做的事，由应用设置。webSignIn 返回 `{cookie}`；做不到时抛错，
/// 消息会交给插件。
typedef PluginAsk = Future<Object?> Function(
  PluginSource plugin,
  String op,
  Map<String, Object?> args,
);

class PluginSource extends Source {
  PluginSource._(
    this.manifest,
    this.dir,
    this.dataDir,
    this._settings,
    this.allowPrograms,
  );

  /// 应用处理插件请求的地方（在主 isolate）。没设置时请求都失败。
  static PluginAsk? onAsk;

  /// 应用界面语言（BCP-47），新启动的插件用它；改了用 [setLanguage] 通知已启动的。
  static String language = 'zh-CN';

  /// 告诉插件界面语言变了（host.language() 和 host.t() 跟着变）。
  void setLanguage(String tag) {
    if (_closed != null || _dead) return;
    _to.send(['language', tag]);
  }

  /// 用插件目录里的 locales/<语言>.json 翻译静态文案（如 plugin.json 字段）。
  String tr(String text) => pluginTranslate(dir, language, text);

  /// 用户允许了这个插件运行本机程序。
  final bool allowPrograms;

  final PluginManifest manifest;
  final String dir, dataDir;
  final Map<String, String> _settings;

  /// 插件 console 输出。
  void Function(String level, String message)? onLog;

  /// 插件运行中途停掉的原因（死循环、内存用尽、进程退出）；正常运行时为 null。
  String? stopped;

  /// 插件运行中途停掉时调用（不包括 [close]）。
  void Function(PluginSource source)? onStopped;

  void _stop(String why) {
    if (stopped != null || _closed != null) return;
    stopped = why;
    onStopped?.call(this);
  }

  late final SendPort _to;
  late final ReceivePort _from;
  late final Isolate _isolate;
  final _pending = <int, Completer<Object?>>{};
  var _next = 0;
  var _exports = const <String>{};
  Completer<void>? _closed;
  var _dead = false;

  void _failPending() {
    final cs = _pending.values.toList();
    _pending.clear();
    for (final c in cs) {
      c.completeError(
        SourceError(SourceErrorKind.failed, L.pluginErrStopped(info.name)),
      );
    }
  }

  @override
  SourceInfo get info => manifest.info;

  /// 应用认识的插件导出（别的导出忽略）。
  static Set<String> get knownOps => _known;

  static const _known = {
    Op.signIn, Op.signOut, Op.account, Op.profile, Op.home, Op.browse, //
    Op.search,
    Op.hotSearches,
    Op.suggest, Op.library, Op.recent, Op.played, Op.liked, Op.isLiked, Op.like,
    Op.album, Op.artist, Op.saveAlbum, Op.followArtist, Op.savedAlbums,
    Op.playlists, Op.playlist, Op.savePlaylist, Op.createPlaylist,
    Op.renamePlaylist, Op.deletePlaylist, Op.addToPlaylist,
    Op.removeFromPlaylist, Op.movePlaylistTrack, Op.lyrics, Op.stream,
    Op.similar, Op.station, Op.dislike, Op.trackMenu, Op.menuAction,
    Op.comments, Op.postComment, Op.likeComment,
  };

  @override
  Set<String> get ops => _exports;

  @override
  bool can(String op) {
    if (!super.can(op)) return false;
    for (final s in info.settings) {
      if (s.type == 'boolean' && s.op == op && setting(s.key) != 'true') {
        return false;
      }
    }
    return true;
  }

  /// 读 [dir]/plugin.json，在新 isolate 里启动插件。失败抛 [SourceError]
  /// （kind 为 setup），reason 可以直接给用户看。
  static Future<PluginSource> start(
    String dir, {
    required String dataRoot,
    void Function(String level, String message)? onLog,
    bool allowPrograms = false,
  }) async {
    final PluginManifest m;
    final String text;
    try {
      text = await File(p.join(dir, 'plugin.json')).readAsString();
      m = PluginManifest.parse(text);
    } on FormatException catch (e) {
      throw SourceError(
        SourceErrorKind.setup,
        '${p.basename(dir)}：${e.message}',
      );
    } on FileSystemException {
      throw SourceError(
        SourceErrorKind.setup,
        L.pluginErrNoManifestDir(p.basename(dir)),
      );
    }
    if (m.minAppVersion.isNotEmpty &&
        compareVersions(appVersion, m.minAppVersion) < 0) {
      throw SourceError(
        SourceErrorKind.setup,
        L.pluginErrMinVersionSimple(m.info.name, m.minAppVersion),
      );
    }
    final dataDir = p.join(dataRoot, m.id);
    final initial = {
      for (final x in m.info.settings)
        if (x.key.isNotEmpty && x.defaultValue.isNotEmpty)
          x.key: x.defaultValue,
      ..._readSettings(dataDir),
    };
    final s = PluginSource._(
      m,
      dir,
      dataDir,
      initial,
      allowPrograms && m.process.isNotEmpty,
    )..onLog = onLog;
    await s._spawn(text);
    return s;
  }

  static Map<String, String> _readSettings(String dataDir) {
    try {
      final j = jsonDecode(
        File(p.join(dataDir, 'settings.json')).readAsStringSync(),
      );
      if (j is Map) {
        return {for (final e in j.entries) '${e.key}': '${e.value}'};
      }
    } catch (_) {}
    return {};
  }

  Future<void> _spawn(String manifestText) async {
    _from = ReceivePort();
    final ready = Completer<void>();
    final port = Completer<SendPort>();
    _from.listen((m) {
      if (m is SendPort) return port.complete(m);
      if (m == null) {
        // isolate 退出了（正常关闭或崩溃）：没完成的调用都失败。
        _dead = true;
        _failPending();
        if (!ready.isCompleted) {
          ready.completeError(
            SourceError(
              SourceErrorKind.setup,
              L.pluginErrProcessExited(info.name),
            ),
          );
        }
        if (_closed?.isCompleted == false) _closed!.complete();
        if (ready.isCompleted) _stop(L.pluginErrProcessExited(info.name));
        return;
      }
      final msg = m as List;
      switch (msg[0]) {
        case 'ready':
          _exports = {
            for (final x in msg[1] as List)
              if (_known.contains(x)) x as String,
          };
          ready.complete();
        case 'failed':
          ready.completeError(
            SourceError(SourceErrorKind.setup, '${info.name}：${msg[1]}'),
          );
        case 'log':
          onLog?.call(msg[1] as String, msg[2] as String);
        case 'broken':
          _stop(msg[1] as String);
        case 'result':
          final c = _pending.remove(msg[1]);
          if (c == null) break;
          if (msg[2] == true) {
            c.complete(msg[3]);
          } else {
            final e = msg[3] as List;
            c.completeError(_error(e[0] as String, e[1] as String));
          }
        case 'ask':
          _answer(msg[1] as int, msg[2] as String, (msg[3] as Map).cast());
        case 'closed':
          _closed?.complete();
      }
    });
    _isolate = await Isolate.spawn(
      _worker,
      _Boot(
        _from.sendPort,
        dir,
        dataDir,
        manifestText,
        {..._settings},
        systemProxy()?.toJson(),
        allowPrograms,
        language,
      ),
      debugName: 'plugin:${manifest.id}',
      onExit: _from.sendPort,
    );
    _to = await port.future;
    try {
      await ready.future;
    } catch (_) {
      _isolate.kill();
      _from.close();
      rethrow;
    }
  }

  Future<void> _answer(int id, String op, Map<String, Object?> args) async {
    List<Object?> reply;
    try {
      final f = onAsk;
      if (f == null) throw StateError('$op is not available');
      reply = ['answer', id, true, await f(this, op, args)];
    } catch (e) {
      reply = ['answer', id, false, e is StateError ? e.message : '$e'];
    }
    if (!_dead && _closed == null) _to.send(reply);
  }

  static SourceError _error(String code, String message) =>
      SourceError(switch (code) {
        'signIn' => SourceErrorKind.signIn,
        'setup' => SourceErrorKind.setup,
        'unavailable' => SourceErrorKind.unavailable,
        'unsupported' => SourceErrorKind.unsupported,
        _ => SourceErrorKind.failed,
      }, message);

  /// 调插件；结果里所有歌曲标上本源的 id。
  Future<Object?> invoke(String op, [Map<String, Object?>? params]) async {
    if (_closed != null || _dead) {
      throw SourceError(SourceErrorKind.failed, L.pluginErrStopped(info.name));
    }
    final id = ++_next;
    final c = _pending[id] = Completer<Object?>();
    _to.send(['call', id, op, params]);
    return _tag(await c.future);
  }

  Object? _tag(Object? v, [String? key]) {
    if (v is List) {
      for (final x in v) {
        if (key == 'tracks' && x is Map) x['source'] = id;
        _tag(x);
      }
    } else if (v is Map) {
      for (final e in v.entries) {
        _tag(e.value, e.key as String?);
      }
    }
    return v;
  }

  /// 插件返回的原始对象（歌曲已经标上本源 id）。首页、发现页存盘用：
  /// 下次启动先用存下的 JSON 画页面。
  /// [trackList]：返回的直接是歌曲列表（比如 similar），每首标上本源 id。
  Future<Object?> raw(
    String op, [
    Map<String, Object?>? params,
    bool trackList = false,
  ]) async {
    final v = await invoke(op, params);
    if (trackList && v is List) {
      for (final t in v) {
        if (t is Map) t['source'] = id;
      }
    }
    return v;
  }

  Future<Json> _obj(String op, [Map<String, Object?>? params]) async {
    final v = await invoke(op, params);
    if (v is Map) return v.cast();
    throw SourceError(
      SourceErrorKind.failed,
      L.pluginErrNotObject(info.name, op),
    );
  }

  Future<List<Json>> _list(String op, [Map<String, Object?>? params]) async {
    final v = await invoke(op, params);
    if (v is List) {
      return [
        for (final x in v)
          if (x is Map) x.cast(),
      ];
    }
    if (v == null) return const [];
    throw SourceError(
      SourceErrorKind.failed,
      L.pluginErrNotArray(info.name, op),
    );
  }

  Future<List<Track>> _tracks(String op, [Map<String, Object?>? p]) async => [
    for (final t
        in (await _list(op, p)
          ..forEach((t) => t['source'] = id)))
      Track.fromJson(t),
  ];

  // ── 设置 ──

  @override
  String setting(String key) => _settings[key] ?? '';

  @override
  Future<void> setSetting(String key, String value) async {
    _settings[key] = value;
    _to.send(['setting', key, value]);
    await Directory(dataDir).create(recursive: true);
    await File(p.join(dataDir, 'settings.json'))
        .writeAsString(jsonEncode(_settings));
  }

  // ── 账号 ──

  Future<Account?> _account(String op) async {
    final v = await invoke(op);
    return v is Map ? Account.fromJson(v.cast()) : null;
  }

  @override
  Future<Account?> signIn() => _account(Op.signIn);
  @override
  Future<void> signOut() => invoke(Op.signOut);
  @override
  Future<Account?> account() => _account(Op.account);
  @override
  Future<Profile> profile() async => Profile.fromJson(await _obj(Op.profile));

  // ── 发现 ──

  @override
  Future<Browse> home() async => Browse.fromJson(await _obj(Op.home));
  @override
  Future<Browse> browse(String page) async =>
      Browse.fromJson(await _obj(Op.browse, {'page': page}));
  @override
  Future<SearchResult> search(
    String query,
    SearchKind kind, {
    int offset = 0,
  }) async => SearchResult.fromJson(
    await _obj(Op.search, {
      'query': query,
      'kind': kind.name,
      'offset': offset,
    }),
  );
  @override
  Future<List<HotSearch>> hotSearches() async =>
      HotSearch.listFrom(await invoke(Op.hotSearches, const {}));
  @override
  Future<SearchResult> library(SearchKind kind, {int offset = 0}) async =>
      SearchResult.fromJson(
        await _obj(Op.library, {'kind': kind.name, 'offset': offset}),
      );

  @override
  Future<List<String>> suggest(String query) async {
    final v = await invoke(Op.suggest, {'query': query});
    return [
      if (v is List)
        for (final x in v)
          if (x != null) '$x',
    ];
  }

  // ── 资料库 ──

  @override
  Future<List<Track>> recent() => _tracks(Op.recent);

  @override
  Future<List<Track>> similar(String id) => _tracks(Op.similar, {'id': id});
  @override
  Future<TrackPage> station(String id, {String seed = ''}) async =>
      TrackPage.fromJson(await _obj(Op.station, {'id': id, 'seed': seed}));
  @override
  Future<void> dislike(String id, {String station = ''}) =>
      invoke(Op.dislike, {'id': id, 'station': station});

  @override
  Future<CommentPage> comments(
    String id, {
    String sort = 'hot',
    int offset = 0,
  }) async => CommentPage.fromJson(
    await _obj(Op.comments, {'id': id, 'sort': sort, 'offset': offset}),
  );

  @override
  Future<Comment?> postComment(
    String id,
    String text, {
    String replyTo = '',
  }) async {
    final v = await invoke(Op.postComment, {
      'id': id,
      'text': text,
      'replyTo': replyTo,
    });
    return v is Map ? Comment.fromJson(v.cast()) : null;
  }

  @override
  Future<void> likeComment(String id, String commentId, bool on) =>
      invoke(Op.likeComment, {'id': id, 'commentId': commentId, 'on': on});
  @override
  Future<TrackMenu> trackMenu(Track track, {String playlist = ''}) async =>
      TrackMenu.fromJson(
        await invoke(Op.trackMenu, {
          'track': track.toJson(),
          'playlist': playlist,
        }),
      );
  @override
  Future<MenuResult> menuAction(
    String id,
    Track track, {
    String playlist = '',
  }) async => MenuResult.fromJson(
    await invoke(Op.menuAction, {
      'id': id,
      'track': track.toJson(),
      'playlist': playlist,
    }),
  );
  @override
  Future<void> played(Track track) async {
    if (!can(Op.played)) return;
    try {
      await invoke(Op.played, {'id': track.id});
    } on SourceError catch (_) {}
  }

  @override
  Future<TrackPage> liked({int offset = 0}) async =>
      TrackPage.fromJson(await _obj(Op.liked, {'offset': offset}));
  @override
  Future<Map<String, bool>> isLiked(List<String> ids) async {
    final v = await invoke(Op.isLiked, {'ids': ids});
    if (v is Map) {
      return {for (final e in v.entries) '${e.key}': e.value == true};
    }
    // 也接受与 ids 一一对应的布尔数组。
    if (v is List) {
      return {
        for (var i = 0; i < ids.length && i < v.length; i++)
          ids[i]: v[i] == true,
      };
    }
    return {};
  }

  @override
  Future<void> like(String id, bool on) =>
      invoke(Op.like, {'id': id, 'on': on});
  @override
  Future<AlbumPage> album(String id) async =>
      AlbumPage.fromJson(await _obj(Op.album, {'id': id}));
  @override
  Future<ArtistPage> artist(String id) async =>
      ArtistPage.fromJson(await _obj(Op.artist, {'id': id}));
  @override
  Future<void> saveAlbum(String id, bool on) =>
      invoke(Op.saveAlbum, {'id': id, 'on': on});
  @override
  Future<void> followArtist(String id, bool on) =>
      invoke(Op.followArtist, {'id': id, 'on': on});
  @override
  Future<List<Album>> savedAlbums({int offset = 0}) async {
    // 也接受 {albums, more}，和 library 的返回一样
    final v = await invoke(Op.savedAlbums, {'offset': offset});
    if (v is Map) return SearchResult.fromJson(v.cast()).albums;
    if (v == null || v is List) {
      return [
        for (final a in v as List? ?? const [])
          if (a is Map) Album.fromJson(a.cast()),
      ];
    }
    throw SourceError(
      SourceErrorKind.failed,
      L.pluginErrNotArray(info.name, Op.savedAlbums),
    );
  }

  // ── 歌单 ──

  @override
  Future<List<Playlist>> playlists() async => [
    for (final x in await _list(Op.playlists)) Playlist.fromJson(x),
  ];
  @override
  Future<Playlist> playlist(String id) async =>
      Playlist.fromJson(await _obj(Op.playlist, {'id': id}));
  @override
  Future<void> savePlaylist(String id, bool on) =>
      invoke(Op.savePlaylist, {'id': id, 'on': on});
  @override
  Future<Playlist> createPlaylist(String name) async =>
      Playlist.fromJson(await _obj(Op.createPlaylist, {'name': name}));
  @override
  Future<void> renamePlaylist(String id, String name) =>
      invoke(Op.renamePlaylist, {'id': id, 'name': name});
  @override
  Future<void> deletePlaylist(String id) =>
      invoke(Op.deletePlaylist, {'id': id});
  @override
  Future<void> addToPlaylist(String id, List<String> trackIds) =>
      invoke(Op.addToPlaylist, {'id': id, 'trackIds': trackIds});
  @override
  Future<void> removeFromPlaylist(String id, List<String> trackIds) =>
      invoke(Op.removeFromPlaylist, {'id': id, 'trackIds': trackIds});
  @override
  Future<void> movePlaylistTrack(String id, int from, int to) =>
      invoke(Op.movePlaylistTrack, {'id': id, 'from': from, 'to': to});

  // ── 播放 ──

  @override
  Future<Lyrics> lyrics(String id) async =>
      Lyrics.fromJson(await _obj(Op.lyrics, {'id': id}));

  @override
  Future<AudioStream> stream(String id, {String quality = 'high'}) async {
    final s = AudioStream.fromJson(
      await _obj(Op.stream, {'id': id, 'quality': quality}),
    );
    final u = Uri.tryParse(s.url);
    final ok = switch (u?.scheme) {
      'http' || 'https' => true,
      // 插件自带或自己下载的音频可以，本机其他文件不行。
      'file' => _ownsFile(u!.toFilePath()),
      _ => false,
    };
    if (!ok) {
      throw SourceError(
        SourceErrorKind.failed,
        L.pluginErrInvalidStreamUrl(info.name),
      );
    }
    return s;
  }

  bool _ownsFile(String path) {
    try {
      final real = File(path).resolveSymbolicLinksSync();
      return [dir, dataDir].any((d) {
        final r = Directory(d);
        return r.existsSync() && p.isWithin(r.resolveSymbolicLinksSync(), real);
      });
    } on FileSystemException {
      return false;
    }
  }

  @override
  Future<void> close() async {
    if (_closed != null) return _closed!.future;
    _closed = Completer<void>();
    if (!_dead) {
      _to.send(['close']);
      await _closed!.future.timeout(
        const Duration(seconds: 2),
        onTimeout: () {},
      );
      _isolate.kill(priority: Isolate.immediate);
    }
    _from.close();
    _failPending();
  }
}

/// 启动 [root] 下每个子目录里的插件。加载失败的放进 [failed]（目录 → 原因）。
Future<List<PluginSource>> startPlugins(
  String root, {
  required String dataRoot,
  Map<String, String>? failed,
  void Function(String plugin, String level, String message)? onLog,
  Set<String> allowPrograms = const {},
  Set<String> disabled = const {},
  Map<String, PluginManifest>? skipped,
}) async {
  final d = Directory(root);
  if (!d.existsSync()) return [];
  final dirs = [
    for (final e in d.listSync())
      if (e is Directory && !p.basename(e.path).startsWith('.')) e.path,
  ]..sort();
  final out = <PluginSource>[];
  final ids = <String>{};
  for (final dir in dirs) {
    // 用户停用的插件不启动，只读 plugin.json 给设置页显示
    if (disabled.contains(_idIn(dir))) {
      try {
        final m = PluginManifest.parse(
          File(p.join(dir, 'plugin.json')).readAsStringSync(),
        );
        if (ids.add(m.id)) {
          skipped?[dir] = m;
          continue;
        }
      } catch (_) {}
    }
    try {
      final s = await PluginSource.start(
        dir,
        dataRoot: dataRoot,
        onLog: (l, m) => onLog?.call(p.basename(dir), l, m),
        allowPrograms: allowPrograms.contains(_idIn(dir)),
      );
      if (!ids.add(s.id)) {
        await s.close();
        throw SourceError(SourceErrorKind.setup, L.pluginErrDuplicateId(s.id));
      }
      out.add(s);
    } on SourceError catch (e) {
      failed?[dir] = e.reason;
    } catch (e) {
      // 意外的错误（读不了目录、isolate 起不来等）只算这一个插件失败，
      // 不能让其他插件也跟着起不来
      failed?[dir] = '$e';
    }
  }
  return out;
}

/// 目录里插件的 id（读不出来时用目录名），用来查用户给它的权限。
String _idIn(String dir) {
  try {
    final j = jsonDecode(File(p.join(dir, 'plugin.json')).readAsStringSync());
    if (j is Map && j['id'] is String) return j['id'] as String;
  } catch (_) {}
  return p.basename(dir);
}
