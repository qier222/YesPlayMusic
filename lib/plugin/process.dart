// host.spawn: plugins start local programs (runs in the plugin isolate).
//
// Only programs listed in permissions.process in plugin.json can be started, and the user must first allow
// this plugin to run programs in settings. List entries:
// - a path (contains /): relative to the plugin directory or absolute, matches the path only;
// - a name: looked up in PATH, matches the name only;
// - * wildcards within one directory level; a lone "*" (or process: true) means any program.
//
// On macOS, apps opened from Finder don't get the shell's PATH, so names are also looked up in Homebrew
// directories. Programs inherit the system proxy (HTTPS_PROXY etc.) and are terminated when the plugin stops.

import 'dart:async';
import 'dart:collection';
import 'dart:convert';
import 'dart:io';

import 'package:path/path.dart' as p;

import '../net/proxy.dart';

/// Whether [command] is within [allowed]. Relative paths are relative to [pluginDir].
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

/// Anything with a path separator counts as a path. Backslashes count too: on Windows `yt-dlp\..\..\cmd` must not be treated as a name
/// matching a wildcard like `yt-dlp*`.
bool _isPath(String s) => s.contains('/') || s.contains(r'\');

/// Normalised to `/` separators; wildcards stay within one directory level.
String _unify(String s) => s.replaceAll(r'\', '/');

RegExp _glob(String pattern) =>
    RegExp('^${pattern.split('*').map(RegExp.escape).join('[^/]*')}\$');

/// Finds the program: paths are used directly (relative to the plugin directory), names are looked up in PATH and Homebrew directories.
String? findProgram(String command, String pluginDir) {
  if (_isPath(command)) {
    final path = p.normalize(p.join(pluginDir, command));
    return _isExe(path) ? path : null;
  }
  // On Windows names may omit the extension; .exe, .cmd etc. are added from PATHEXT
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

/// PATH plus Homebrew and common user-level install directories (mise, pipx, deno, bun, volta,
/// asdf), deduplicated, order preserved.
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

/// Environment for the child process: completed PATH, with the system proxy.
final _sep = Platform.isWindows ? ';' : ':';

Map<String, String> childEnvironment(HttpProxy? proxy) {
  final env = {
    ...Platform.environment,
    // Windows environment variable names are case-insensitive; keep PATH as is
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

/// A program started by a plugin. Stdout is read line by line; the last 64 KB of stderr is kept.
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

  /// The next line; null at end of output. Throws if the program failed to start.
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
