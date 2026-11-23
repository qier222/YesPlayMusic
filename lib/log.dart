// Local log: debugPrint, Flutter framework errors and unhandled async errors all go to
// <data dir>/logs/app.log, so users can send this file when reporting issues.
//
// Written locally only, never uploaded. At each launch, over 1 MB rotates to app.1.log (only one old copy kept),
// and at most 5 MB is written per run so a repeating error can't fill the disk.
// Values of Cookie, Authorization, token and password become *** before writing, so sharing the log never leaks sign-in data.

import 'dart:convert';
import 'dart:io';
import 'dart:ui';

import 'package:flutter/foundation.dart';
import 'package:path/path.dart' as p;

import 'system.dart';

class AppLog {
  AppLog._();

  static const rotateBytes = 1 << 20;
  static const sessionBytes = 5 << 20;

  static RandomAccessFile? _file;
  static String? _path;
  static int _written = 0;
  static bool _capped = false;
  static DebugPrintCallback? _origPrint;
  static FlutterExceptionHandler? _origFlutterError;
  static ErrorCallback? _origPlatformError;

  /// Current log file; null when not initialized (or it couldn't be opened).
  static String? get path => _path;

  /// Folder holding the logs; null when not initialized.
  static String? get dir => _path == null ? null : p.dirname(_path!);

  /// Opens the log folder in the system file manager. Returns false when there are no logs.
  static bool openFolder() {
    final d = dir;
    if (d == null) return false;
    openExternal(d);
    return true;
  }

  static final _secretLine = RegExp(
    r'\b((?:set-)?cookie|(?:proxy-)?authorization)(\s*[:=]\s*)[^\n]*',
    caseSensitive: false,
  );
  static final _secretParam = RegExp(
    r'\b(\w*(?:token|password|passwd|secret))=[^&\s"\x27]+',
    caseSensitive: false,
  );
  static final _secretJson = RegExp(
    r'("\w*(?:token|password|passwd|secret)"\s*:\s*)"[^"]*"',
    caseSensitive: false,
  );

  /// Replaces credential values with ***: whole Cookie / Authorization header lines,
  /// token= and password= in URLs or forms, and "token": "..." in JSON.
  static String redact(String s) => s
      .replaceAllMapped(_secretLine, (m) => '${m[1]}${m[2]}***')
      .replaceAllMapped(_secretParam, (m) => '${m[1]}=***')
      .replaceAllMapped(_secretJson, (m) => '${m[1]}"***"');

  /// Opens [dir]/app.log. If it can't be opened, only prints without writing a file.
  static void init(String dir) {
    close();
    try {
      Directory(dir).createSync(recursive: true);
      final f = File(p.join(dir, 'app.log'));
      if (f.existsSync() && f.lengthSync() > rotateBytes) {
        f.renameSync(p.join(dir, 'app.1.log'));
      }
      _file = f.openSync(mode: FileMode.append);
      _path = f.path;
    } on FileSystemException catch (e) {
      debugPrint('log: $e');
    }
  }

  /// Takes over debugPrint, FlutterError.onError and PlatformDispatcher.onError.
  static void captureErrors() {
    if (_origPrint == null) {
      _origPrint = debugPrint;
      _origFlutterError = FlutterError.onError;
      _origPlatformError = PlatformDispatcher.instance.onError;
    }
    final orig = _origPrint!;
    debugPrint = (String? message, {int? wrapWidth}) {
      orig(message, wrapWidth: wrapWidth);
      if (message != null) write('I', message);
    };
    FlutterError.onError = (details) {
      write('E', '${details.exceptionAsString()}\n${details.stack ?? ''}');
      FlutterError.presentError(details);
    };
    PlatformDispatcher.instance.onError = (error, stack) {
      orig('Uncaught exception: $error\n$stack');
      write('E', '$error\n$stack');
      // Already logged; don't let the engine treat it as fatal
      return true;
    };
  }

  /// Writes one line. [level] is I / W / E.
  static void write(String level, String message) {
    final f = _file;
    if (f == null || _capped) return;
    final line =
        '${DateTime.now().toIso8601String()} $level ${redact(message)}\n';
    // Write synchronously so the last lines before a crash reach the disk
    try {
      final bytes = utf8.encode(line);
      if (_written + bytes.length > sessionBytes) {
        _capped = true;
        f.writeStringSync(
          '${DateTime.now().toIso8601String()} W Log limit reached for this run, nothing more will be recorded\n',
        );
        return;
      }
      f.writeFromSync(bytes);
      _written += bytes.length;
    } on FileSystemException {
      // Disk full or similar: stop writing
      _capped = true;
    }
  }

  /// Closes the file and restores the callbacks from before takeover (for tests).
  static void close() {
    try {
      _file?.closeSync();
    } on FileSystemException {
      // Ignore
    }
    _file = null;
    _path = null;
    _written = 0;
    _capped = false;
    if (_origPrint case final o?) {
      debugPrint = o;
      FlutterError.onError = _origFlutterError;
      PlatformDispatcher.instance.onError = _origPlatformError;
      _origPrint = null;
    }
  }
}
