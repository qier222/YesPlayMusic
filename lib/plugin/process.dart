// host.spawn：插件启动本机程序（在插件 isolate 里运行）。
//
// 只能启动 plugin.json 里 permissions.process 列出的程序，而且用户要先在设置里
// 允许这个插件运行程序。列表里的项：
// - 路径（含 /）：相对插件目录或绝对路径，只匹配路径；
// - 名字：在 PATH 里找，只匹配名字；
// - * 在一层目录内通配；单独的 "*"（或 process: true）表示任意程序。
//
// macOS 上从 Finder 打开的应用拿不到 shell 的 PATH，所以名字也会在 Homebrew 的
// 目录里找。程序继承系统代理（HTTPS_PROXY 等），插件停止时一并结束。

import 'dart:async';
import 'dart:collection';
import 'dart:convert';
import 'dart:io';

import 'package:path/path.dart' as p;

import '../net/proxy.dart';

/// [command] 是否在 [allowed] 之内。相对路径相对 [pluginDir]。
bool processAllowed(String command, List<String> allowed, String pluginDir) {
  final isPath = _isPath(command);
  final cmd = isPath
      ? _unify(p.normalize(p.join(pluginDir, command)))
      : command;
  for (final e in allowed) {
    if (e == '*') return true;
    if (_isPath(e) != isPath) continue;
    final pat = isPath ? _unify(p.normalize(p.join(pluginDir, e))) : e;
    if (_glob(pat).hasMatch(cmd)) return true;
  }
  return false;
}

/// 含路径分隔符的算路径。反斜杠也算：Windows 上 `yt-dlp\..\..\cmd` 不能被当成名字，
/// 去匹配 `yt-dlp*` 这样的通配。
bool _isPath(String s) => s.contains('/') || s.contains(r'\');

/// 统一成 `/` 分隔，通配只在一层目录内。
String _unify(String s) => s.replaceAll(r'\', '/');

RegExp _glob(String pattern) =>
    RegExp('^${pattern.split('*').map(RegExp.escape).join('[^/]*')}\$');

/// 找程序：路径直接用（相对插件目录），名字在 PATH 和 Homebrew 目录里找。
String? findProgram(String command, String pluginDir) {
  if (_isPath(command)) {
    final path = p.normalize(p.join(pluginDir, command));
    return _isExe(path) ? path : null;
  }
  // Windows 上名字可以不带扩展名，按 PATHEXT 补上 .exe、.cmd 这些
  final exts = Platform.isWindows && p.extension(command).isEmpty
      ? (Platform.environment['PATHEXT'] ?? '.EXE;.CMD;.BAT')
            .split(';')
            .where((e) => e.isNotEmpty)
      : const [''];
  for (final d in searchPath()) {
    for (final e in exts) {
      final path = p.join(d, '$command$e');
      if (_isExe(path)) return path;
    }
  }
  return null;
}

bool _isExe(String path) {
  final s = FileStat.statSync(path);
  return s.type == FileSystemEntityType.file &&
      (Platform.isWindows || s.mode & 0x49 != 0);
}

/// PATH 加上 Homebrew 和常见的用户级安装目录（mise、pipx、deno、bun、volta、
/// asdf），去重，保持顺序。
List<String> searchPath() {
  final path = (Platform.environment['PATH'] ?? '')
      .split(_sep)
      .where((d) => d.isNotEmpty);
  if (Platform.isWindows) return path.toSet().toList();
  final home = Platform.environment['HOME'] ?? '';
  return <String>{
    ...path,
    '/opt/homebrew/bin',
    '/usr/local/bin',
    '/usr/bin',
    '/bin',
    if (home.isNotEmpty) ...[
      '$home/.local/bin',
      '$home/.local/share/mise/shims',
      '$home/.deno/bin',
      '$home/.bun/bin',
      '$home/.volta/bin',
      '$home/.asdf/shims',
    ],
  }.toList();
}

/// 子进程的环境：补全 PATH，带上系统代理。
final _sep = Platform.isWindows ? ';' : ':';

Map<String, String> childEnvironment(HttpProxy? proxy) {
  final env = {
    ...Platform.environment,
    // Windows 的环境变量名不分大小写，PATH 保持原样
    if (!Platform.isWindows) 'PATH': searchPath().join(_sep),
  };
  if (proxy != null) {
    for (final k in ['HTTPS_PROXY', 'HTTP_PROXY', 'ALL_PROXY']) {
      if (!env.containsKey(k) && !env.containsKey(k.toLowerCase())) {
        env[k] = proxy.url;
        env[k.toLowerCase()] = proxy.url;
      }
    }
    if (!env.containsKey('NO_PROXY') && !env.containsKey('no_proxy')) {
      final no = [
        'localhost',
        '127.0.0.1',
        '::1',
        for (final e in proxy.exceptions)
          if (!e.contains('/')) e.startsWith('*.') ? e.substring(1) : e,
      ].join(',');
      env['NO_PROXY'] = env['no_proxy'] = no;
    }
  }
  return env;
}

/// 插件启动的一个程序。标准输出按行读，标准错误留最后 64 KB。
class PluginProcess {
  PluginProcess.start(
    String path,
    List<String> args, {
    Map<String, String>? environment,
  }) {
    _started = Process.start(
      path,
      args,
      environment: environment,
      includeParentEnvironment: environment == null,
    );
    _started.then((proc) {
      _proc = proc;
      if (_killed) proc.kill();
      proc.stdout
          .transform(utf8.decoder)
          .transform(const LineSplitter())
          .listen(_line, onDone: _eof, onError: (_) => _eof());
      proc.stderr.transform(utf8.decoder).listen((s) {
        _err.write(s);
        if (_err.length > _maxErr) {
          final t = _err.toString();
          _err
            ..clear()
            ..write(t.substring(t.length - _maxErr));
        }
      }, onError: (_) {});
      proc.exitCode.then((_) => _eof());
    }, onError: (Object e) => _eof());
  }

  static const _maxErr = 64 << 10, _maxLines = 10000;

  late final Future<Process> _started;
  Process? _proc;
  var _killed = false, _done = false;
  final _lines = Queue<String>();
  final _readers = Queue<Completer<String?>>();
  final _err = StringBuffer();
  Future<void> _stdin = Future.value();

  int get pid => _proc?.pid ?? 0;
  String get errorOutput => _err.toString();

  void _line(String l) {
    if (_readers.isNotEmpty) {
      _readers.removeFirst().complete(l);
    } else if (_lines.length < _maxLines) {
      _lines.add(l);
    }
  }

  void _eof() {
    if (_done) return;
    _done = true;
    while (_readers.isNotEmpty) {
      _readers.removeFirst().complete(null);
    }
  }

  /// 下一行；输出结束返回 null。程序没能启动时抛错。
  Future<String?> readLine() async {
    await _started;
    if (_lines.isNotEmpty) return _lines.removeFirst();
    if (_done) return null;
    final c = Completer<String?>();
    _readers.add(c);
    return c.future;
  }

  Future<int> wait() async => (await _started).exitCode;

  void write(String text) => _stdin = _stdin
      .then((_) async {
        final proc = await _started;
        proc.stdin.write(text);
        await proc.stdin.flush();
      })
      .catchError((_) {});

  void closeStdin() => _stdin = _stdin
      .then((_) async {
        await (await _started).stdin.close();
      })
      .catchError((_) {});

  void kill() {
    _killed = true;
    _proc?.kill();
  }
}
