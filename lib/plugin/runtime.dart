// 一个插件的运行时：QuickJS + prelude + 宿主能力（fetch、定时器、存储…）。
//
// 只在一个 isolate 里用（见 plugin_source.dart 把它放进独立 isolate）。
// 所有 JS 都由 Dart 事件驱动：调用、fetch 完成、定时器触发时进入 JS，跑完
// Promise 任务就出来。每次进入 JS 有时限（[sliceMs]），超时中断后插件停用。

import 'dart:async';
import 'dart:convert';
import 'dart:ffi' show Abi;
import 'dart:io';
import 'dart:typed_data' show BytesBuilder, Uint8List;

import 'package:crypto/crypto.dart' as crypto;
import 'package:path/path.dart' as p;
import 'package:pointycastle/export.dart'
    show
        AESEngine,
        ECBBlockCipher,
        KeyParameter,
        PKCS7Padding,
        PaddedBlockCipherImpl,
        PaddedBlockCipherParameters;

import '../l10n/l10n.dart';
import '../net/proxy.dart';

import 'locale.dart';
import 'manifest.dart';
import 'process.dart';
import 'prelude.dart';
import 'qjs.dart';

/// 插件调用失败。[code] 是插件给的错误码（signIn、setup…），可能为空。
class PluginError implements Exception {
  PluginError(this.message, {this.code = '', this.stack = ''});
  final String code, message, stack;
  @override
  String toString() =>
      'PluginError(${code.isEmpty ? 'failed' : code}): $message';
}

typedef PluginLog = void Function(String level, String message);

class PluginRuntime {
  PluginRuntime({
    required this.manifest,
    required this.dir,
    required this.dataDir,
    Map<String, String> settings = const {},
    String language = 'zh-CN',
    this.onLog,
    this.callTimeout = const Duration(seconds: 30),
    this.sliceMs = 5000,
    this.maxBody = 32 << 20,
    int memoryLimit = 128 << 20,
    HttpClient? http,
    HttpProxy? proxy,
    this.allowPrograms = false,
    this.onAsk,
  }) : // 命名参数不能是私有的，用不了 this._language
       // ignore: prefer_initializing_formals
       _language = language,
       _settings = {...settings},
       _proxy = proxy,
       _http = http ?? HttpClient() {
    _http.connectionTimeout = const Duration(seconds: 15);
    if (proxy != null) _http.findProxy = proxy.findProxy;
    _js = JsRuntime(host: _host, memoryLimit: memoryLimit);
    _js.eval(prelude, name: '<prelude>', budgetMs: sliceMs);
  }

  final PluginManifest manifest;
  final String dir, dataDir;

  /// 应用界面语言（BCP-47），host.language() 返回它，host.t() 按它找 locales/。
  String get language => _language;
  set language(String v) {
    if (v == _language) return;
    _language = v;
    _locale = null;
  }

  String _language;
  final PluginLog? onLog;
  final Duration callTimeout;
  final int sliceMs, maxBody;
  final Map<String, String> _settings;
  final HttpClient _http;
  final HttpProxy? _proxy;

  /// 用户在设置里允许了这个插件运行本机程序（host.spawn）。
  final bool allowPrograms;

  /// 要应用来做的事（如 webSignIn 弹登录窗口），转给主 isolate。
  final Future<Object?> Function(String op, Map<String, Object?> args)? onAsk;

  final _procs = <int, PluginProcess>{};
  var _nextProc = 0;
  late final JsRuntime _js;

  /// 运行超时或内存耗尽后插件停用，原因在这里。
  String? broken;

  /// 插件因为死循环、内存用尽被停用时调用，参数是给用户看的原因。
  void Function(String why)? onBroken;

  var _nextCall = 0, _nextBody = 0;
  final _calls = <int, Completer<Object?>>{};
  final _timers = <int, Timer>{};
  final _requests = <int, HttpClientRequest>{};
  final _aborted = <int>{};
  final _bodies = <int, List<int>>{};
  Map<String, Object?>? _storage;
  Map<String, String>? _locale;

  /// 插件导出的函数名。
  List<String> exports = const [];

  // ── 驱动 ──

  /// 进入 JS 执行 [src]，再跑完 Promise 任务。超时/内存耗尽时停用插件。
  void _enter(String src) {
    if (broken != null || _js.disposed) return;
    try {
      _js.eval(src, budgetMs: sliceMs);
      _js.pump(budgetMs: sliceMs);
    } on JsError catch (e) {
      final why = e.interrupted
          ? L.pluginErrTimeoutDisabled(sliceMs ~/ 1000)
          : e.outOfMemory
          ? L.pluginErrOomDisabled
          : null;
      if (why == null) {
        onLog?.call('error', e.message);
        return;
      }
      broken = why;
      onLog?.call('error', '$why\n${e.message}');
      _failAll(PluginError(why));
      onBroken?.call(why);
    }
  }

  void _failAll(PluginError e) {
    final pending = _calls.values.toList();
    _calls.clear();
    for (final c in pending) {
      if (!c.isCompleted) c.completeError(e);
    }
  }

  /// 加载 main 模块，返回导出的函数名。
  Future<List<String>> load() async {
    final c = _calls[0] = Completer<Object?>();
    _enter('__ypm.load(${jsonEncode(manifest.main)})');
    final v = await c.future.timeout(
      callTimeout,
      onTimeout: () => throw PluginError(L.pluginErrLoadTimeout),
    );
    return exports = [for (final x in v as List) x as String];
  }

  /// 调用插件导出的 [op]，参数是一个对象。返回插件给的 JSON 值。
  Future<Object?> call(String op, [Map<String, Object?>? params]) {
    if (broken != null) return Future.error(PluginError(broken!));
    final id = ++_nextCall;
    final c = _calls[id] = Completer<Object?>();
    _enter('__ypm.call($id, ${jsonEncode(op)}, ${jsonEncode(params)})');
    // 登录要等用户在网页里操作；取播放地址可能要靠外部程序，慢一些。
    final limit = switch (op) {
      'signIn' => const Duration(minutes: 10),
      'stream' => callTimeout * 2,
      _ => callTimeout,
    };
    return c.future.timeout(
      limit,
      onTimeout: () {
        _calls.remove(id);
        throw PluginError(L.pluginErrOpTimeout(op, limit.inSeconds));
      },
    );
  }

  void setSetting(String key, String value) => _settings[key] = value;

  void dispose() {
    for (final t in _timers.values) {
      t.cancel();
    }
    _timers.clear();
    for (final r in _requests.values) {
      r.abort();
    }
    for (final pr in _procs.values) {
      pr.kill();
    }
    _procs.clear();
    _failAll(PluginError(L.pluginErrClosed));
    _http.close(force: true);
    _js.dispose();
  }

  void _resolve(int id, bool ok, Object? value) =>
      _enter('__ypm.resolve($id, $ok, ${jsonEncode(value)})');

  // ── 宿主能力 ──

  String? _host(String op, String json) {
    if (op == 'module') return _module(json);
    final a = jsonDecode(json);
    final args = a is Map<String, Object?> ? a : const <String, Object?>{};
    final out = switch (op) {
      'info' => {
        'platform': _platform,
        'arch': _arch,
        'dir': dir,
        'dataDir': dataDir,
      },
      'log' => _log(args),
      'settle' => _settle(args),
      'timer' => _timer(args),
      'clearTimer' => _clearTimer(args['id']),
      'fetch' => _fetchStart(args),
      'abort' => _abort(args['id'] as int),
      'body' => _body(args),
      'storage.get' => _store[args['key']],
      'storage.set' => _storeSet(args['key'] as String, args['value']),
      'storage.remove' => _storeSet(args['key'] as String, null),
      'language' => language,
      't' => _t(args['text'] as String),
      'setting' => _settings[args['key']] ?? '',
      'openURL' => _openURL(args['url'] as String),
      'md5' =>
        crypto.md5.convert(utf8.encode(args['text'] as String)).toString(),
      'aesEcbEncrypt' => _aesEcbEncrypt(
        args['key'] as String,
        args['text'] as String,
      ),
      'signInPrompt' => _signInPrompt(args),
      'webSignIn' => _webSignIn(args),
      'spawn' => _spawn(args),
      'proc.pid' => _proc(args).pid,
      'proc.write' => _procDo(args, (x) => x.write('${args['text']}')),
      'proc.closeStdin' => _procDo(args, (x) => x.closeStdin()),
      'proc.kill' => _procDo(args, (x) => x.kill()),
      'proc.stderr' => _proc(args).errorOutput,
      'proc.readLine' => _later(args, () => _proc(args).readLine()),
      'proc.wait' => _later(args, () => _proc(args).wait()),
      _ => throw HostError('unknown host op: $op'),
    };
    return out == null ? null : jsonEncode(out);
  }

  static String get _platform => switch (Platform.operatingSystem) {
    'macos' => 'darwin',
    final o => o,
  };

  static String get _arch {
    final a = Abi.current().toString();
    return a.endsWith('arm64')
        ? 'arm64'
        : a.endsWith('x64')
        ? 'amd64'
        : a.split('_').last;
  }

  Object? _clearTimer(Object? id) {
    _timers.remove(id)?.cancel();
    return null;
  }

  Object? _log(Map<String, Object?> a) {
    onLog?.call('${a['level']}', '${a['message']}');
    return null;
  }

  Object? _settle(Map<String, Object?> a) {
    final c = _calls.remove(a['id']);
    if (c == null || c.isCompleted) return null;
    if (a['ok'] == true) {
      c.complete(a['value']);
    } else {
      final e = a['error'] is Map ? a['error'] as Map : const {};
      c.completeError(
        PluginError(
          '${e['message'] ?? ''}',
          code: '${e['code'] ?? ''}',
          stack: '${e['stack'] ?? ''}',
        ),
      );
    }
    return null;
  }

  Object? _timer(Map<String, Object?> a) {
    final id = a['id'] as int;
    final d = Duration(milliseconds: (a['ms'] as num).toInt());
    if (_timers.length > 1000) throw HostError('too many timers');
    _timers[id] = a['repeat'] == true
        ? Timer.periodic(
            d < const Duration(milliseconds: 1)
                ? const Duration(milliseconds: 1)
                : d,
            (_) => _enter('__ypm.fire($id)'),
          )
        : Timer(d, () {
            _timers.remove(id);
            _enter('__ypm.fire($id)');
          });
    return null;
  }

  /// 模块加载：只能读插件目录里的文件（解析符号链接后也要在目录里）。
  String _module(String name) {
    final root = Directory(dir).resolveSymbolicLinksSync();
    final path = p.normalize(p.join(root, name));
    if (!p.isWithin(root, path)) throw HostError('outside the plugin: $name');
    final f = File(path);
    if (!f.existsSync()) throw HostError('no such file: $name');
    if (!p.isWithin(root, f.resolveSymbolicLinksSync())) {
      throw HostError('outside the plugin: $name');
    }
    return f.readAsStringSync();
  }

  // ── 存储：dataDir/storage.json ──

  File get _storeFile => File(p.join(dataDir, 'storage.json'));

  Map<String, Object?> get _store {
    if (_storage != null) return _storage!;
    try {
      final j = jsonDecode(_storeFile.readAsStringSync());
      if (j is Map<String, Object?>) return _storage = j;
    } catch (_) {}
    return _storage = {};
  }

  Object? _storeSet(String key, Object? value) {
    final s = _store;
    if (value == null) {
      if (s.remove(key) == null) return null;
    } else {
      s[key] = value;
    }
    final text = jsonEncode(s);
    if (text.length > 8 << 20) {
      s.remove(key);
      throw HostError('storage is full (8 MB)');
    }
    Directory(dataDir).createSync(recursive: true);
    final tmp = File('${_storeFile.path}.tmp')..writeAsStringSync(text);
    tmp.renameSync(_storeFile.path);
    return null;
  }

  // ── 本地化：locales/<language>.json（含回退） ──

  String _t(String text) {
    _locale ??= loadPluginLocale(dir, language);
    return _locale![text] ?? text;
  }

  Object? _openURL(String url) {
    final u = Uri.tryParse(url);
    if (u == null || (u.scheme != 'http' && u.scheme != 'https')) {
      throw HostError('not a web address: $url');
    }
    final (cmd, args) = Platform.isMacOS
        ? ('open', [url])
        : Platform.isWindows
        ? ('rundll32', ['url.dll,FileProtocolHandler', url])
        : ('xdg-open', [url]);
    // 打开失败（比如 Linux 上没有 xdg-open）不能变成 isolate 里的未捕获异常。
    Process.start(
      cmd,
      args,
      mode: ProcessStartMode.detached,
    ).then<void>((_) {}, onError: (Object e) => onLog?.call('warn', '$e'));
    return null;
  }

  // ── fetch ──

  /// permissions.network 里有没有这个主机。
  // ── 本机程序（host.spawn） ──

  Object? _spawn(Map<String, Object?> a) {
    final cmd = a['command'];
    final args = a['args'];
    if (cmd is! String || cmd.isEmpty) throw HostError('spawn: no command');
    if (!processAllowed(cmd, manifest.process, dir)) {
      throw HostError("spawn: $cmd is not in the plugin's process permission");
    }
    if (!allowPrograms) {
      throw HostError(
        'spawn: starting programs is not allowed: allow it for this plugin in Settings',
      );
    }
    final path = findProgram(cmd, dir);
    if (path == null) throw HostError('spawn: $cmd was not found');
    if (_procs.length >= 16) throw HostError('spawn: too many programs');
    final id = ++_nextProc;
    final pr = _procs[id] = PluginProcess.start(path, [
      if (args is List)
        for (final x in args) '$x',
    ], environment: childEnvironment(_proxy));
    // 程序结束、输出读完后就不用再留着了。
    pr
        .wait()
        .then((_) => Future.delayed(const Duration(minutes: 1)))
        .then((_) => _procs.remove(id), onError: (_) => _procs.remove(id));
    return {'proc': id, 'path': path};
  }

  PluginProcess _proc(Map<String, Object?> a) =>
      _procs[a['proc']] ?? (throw HostError('the program has ended'));

  Object? _procDo(Map<String, Object?> a, void Function(PluginProcess) f) {
    f(_proc(a));
    return null;
  }

  /// 异步的宿主调用：在 host 回调返回之后再开始，完成时 resolve JS 的 promise。
  Object? _later(Map<String, Object?> a, Future<Object?> Function() f) {
    final id = a['id'] as int;
    Future(f).then(
      (v) => _resolve(id, true, v),
      onError: (Object e) => _resolve(id, false, {
        'name': 'Error',
        'message': e is HostError
            ? e.message
            : e is ProcessException
            ? '${e.executable}: ${e.message}'
            : '$e',
        if (e is PluginError) 'code': e.code,
      }),
    );
    return null;
  }

  // ── 加密（host.crypto.aesEcbEncrypt） ──

  /// AES-ECB，PKCS#7 填充；key 和明文都按 UTF-8，返回小写 hex。
  static String _aesEcbEncrypt(String key, String text) {
    final k = Uint8List.fromList(utf8.encode(key));
    if (k.length != 16 && k.length != 24 && k.length != 32) {
      throw HostError('aesEcbEncrypt: key must be 16, 24 or 32 bytes');
    }
    final cipher = PaddedBlockCipherImpl(
      PKCS7Padding(),
      ECBBlockCipher(AESEngine()),
    )..init(true, PaddedBlockCipherParameters(KeyParameter(k), null));
    final out = cipher.process(Uint8List.fromList(utf8.encode(text)));
    final sb = StringBuffer();
    for (final b in out) {
      sb.write(b.toRadixString(16).padLeft(2, '0'));
    }
    return sb.toString();
  }

  // ── 登录提示（host.signInPrompt） ──

  /// 登录过程中要应用显示的东西：二维码和说明。不等应用回复。
  Object? _signInPrompt(Map<String, Object?> a) {
    onAsk?.call('signInPrompt', {
      'qr': '${a['qr'] ?? ''}',
      'text': '${a['text'] ?? ''}',
    }).ignore();
    return null;
  }

  // ── 网页登录（host.webSignIn） ──

  Object? _webSignIn(Map<String, Object?> a) {
    final url = Uri.tryParse('${a['url']}');
    if (url == null || (url.scheme != 'https' && url.scheme != 'http')) {
      throw HostError('webSignIn: url must be http(s)');
    }
    final raw = '${a['cookiesOf']}';
    final of = Uri.tryParse(raw.contains('://') ? raw : 'https://$raw');
    if (of == null || of.host.isEmpty || !allows(of)) {
      throw HostError(
        "webSignIn: cookiesOf must be a host in the plugin's network permission",
      );
    }
    final until = a['until'];
    if (until is! List || until.isEmpty) {
      throw HostError('webSignIn: until must name the cookies to wait for');
    }
    final ask = onAsk;
    if (ask == null) throw HostError('webSignIn is not available here');
    return _later(
      a,
      () => ask('webSignIn', {
        'url': url.toString(),
        'cookiesOf': of.replace(path: of.path.isEmpty ? '/' : null).toString(),
        'until': [for (final x in until) '$x'],
        'userAgent': a['userAgent'] is String ? a['userAgent'] : null,
        'title': manifest.info.name,
      }),
    );
  }

  bool allows(Uri u) =>
      // 允许运行程序后，也能访问本机（和自己启动的程序通信）。
      (allowPrograms &&
          manifest.process.isNotEmpty &&
          const {'localhost', '127.0.0.1', '::1'}.contains(u.host)) ||
      hostAllowed(
        u.host,
        manifest.network,
        settingHost: (k) => Uri.tryParse(_settings[k] ?? '')?.host,
      );

  Object? _fetchStart(Map<String, Object?> a) {
    final u = Uri.tryParse(a['url'] as String? ?? '');
    if (u == null || (u.scheme != 'http' && u.scheme != 'https')) {
      throw HostError('fetch: only http(s) URLs: ${a['url']}');
    }
    if (!allows(u)) {
      throw HostError(
        'fetch: ${u.host} is not in the plugin\'s network permission',
      );
    }
    // 不能在 host 回调里重入 JS，所以放到回调返回之后再开始。
    Future(() => _fetch(a['id'] as int, u, a));
    return null;
  }

  Object? _abort(int id) {
    _aborted.add(id);
    _requests.remove(id)?.abort();
    return null;
  }

  Object? _body(Map<String, Object?> a) {
    final b = _bodies.remove(a['rid']);
    if (b == null) throw HostError('body is gone');
    return a['as'] == 'base64'
        ? base64.encode(b)
        : utf8.decode(b, allowMalformed: true);
  }

  static const _credentialHeaders = {
    'authorization',
    'cookie',
    'proxy-authorization',
  };

  static bool _sameOrigin(Uri a, Uri b) =>
      a.scheme == b.scheme && a.host == b.host && a.port == b.port;

  Future<void> _fetch(int id, Uri uri, Map<String, Object?> a) async {
    var redirects = 0;
    try {
      var method = a['method'] as String? ?? 'GET';
      var headers = [
        for (final h in a['headers'] as List? ?? const [])
          ((h as List)[0] as String, h[1] as String),
      ];
      List<int>? body = a['bodyBase64'] is String
          ? base64.decode(a['bodyBase64'] as String)
          : a['body'] is String
          ? utf8.encode(a['body'] as String)
          : null;
      final redirect = a['redirect'] as String? ?? 'follow';
      while (true) {
        final req = await _http.openUrl(method, uri);
        if (_aborted.remove(id)) {
          req.abort();
          return;
        }
        _requests[id] = req;
        req.followRedirects = false;
        for (final (k, v) in headers) {
          req.headers.add(k, v, preserveHeaderCase: true);
        }
        if (body != null) {
          if (req.headers.contentType == null && a['body'] is String) {
            req.headers.set('content-type', 'text/plain;charset=UTF-8');
          }
          req.contentLength = body.length;
          req.add(body);
        }
        final res = await req.close().timeout(const Duration(seconds: 60));
        final loc = res.headers.value(HttpHeaders.locationHeader);
        if (res.isRedirect && loc != null && redirect != 'manual') {
          await res.drain<void>();
          if (redirect == 'error') throw HostError('fetch: redirected');
          if (++redirects > 10) throw HostError('fetch: too many redirects');
          final from = uri;
          uri = uri.resolve(loc);
          // 跳到别的域名：登录凭据不跟过去，免得 token、Cookie 泄露给第三方
          if (!_sameOrigin(from, uri)) {
            headers = [
              for (final h in headers)
                if (!_credentialHeaders.contains(h.$1.toLowerCase())) h,
            ];
          }
          // 跳转到的地址也要在权限里。
          if (!allows(uri)) {
            throw HostError(
              'fetch: redirected to ${uri.host}, which is not in the plugin\'s network permission',
            );
          }
          if (res.statusCode == 303 ||
              ((res.statusCode == 301 || res.statusCode == 302) &&
                  method == 'POST')) {
            method = 'GET';
            body = null;
          }
          continue;
        }
        final bytes = BytesBuilder(copy: false);
        await for (final chunk in res.timeout(const Duration(seconds: 60))) {
          bytes.add(chunk);
          if (bytes.length > maxBody) {
            throw HostError('fetch: response is over ${maxBody >> 20} MB');
          }
        }
        _requests.remove(id);
        if (_aborted.remove(id)) return;
        final rid = ++_nextBody;
        _bodies[rid] = bytes.takeBytes();
        // 没读的响应体不会一直占着。
        while (_bodies.length > 32) {
          _bodies.remove(_bodies.keys.first);
        }
        final hs = <List<String>>[];
        res.headers.forEach((k, vs) {
          for (final v in vs) {
            hs.add([k, v]);
          }
        });
        _resolve(id, true, {
          'status': res.statusCode,
          'statusText': res.reasonPhrase,
          'url': uri.toString(),
          'redirected': redirects > 0,
          'headers': hs,
          'rid': rid,
        });
        return;
      }
    } catch (e) {
      _requests.remove(id);
      if (_aborted.remove(id)) return;
      _resolve(id, false, {
        'name': 'TypeError',
        'message': e is HostError ? e.message : 'fetch failed: $e',
      });
    }
  }
}
