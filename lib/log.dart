// 本地日志：debugPrint、Flutter 框架错误和没人接的异步异常都写进
// <数据目录>/logs/app.log，用户反馈问题时可以把这个文件发过来。
//
// 只写本机，不上传。每次启动时超过 1 MB 就换成 app.1.log（只留一份旧的），
// 一次运行最多写 5 MB，防止某个错误刷屏把磁盘写满。
// Cookie、Authorization、token、password 的值写盘前换成 ***，日志发出去也不漏登录信息。

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

  /// 当前日志文件；没初始化（或打不开）时为 null。
  static String? get path => _path;

  /// 日志所在的文件夹；没初始化时为 null。
  static String? get dir => _path == null ? null : p.dirname(_path!);

  /// 用系统文件管理器打开日志文件夹。没有日志时返回 false。
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

  /// 把登录凭据的值换成 ***：Cookie / Authorization 请求头整行，
  /// URL 或表单里的 token=、password=，JSON 里的 "token": "..."。
  static String redact(String s) => s
      .replaceAllMapped(_secretLine, (m) => '${m[1]}${m[2]}***')
      .replaceAllMapped(_secretParam, (m) => '${m[1]}=***')
      .replaceAllMapped(_secretJson, (m) => '${m[1]}"***"');

  /// 打开 [dir]/app.log。打不开就只打印、不写文件。
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

  /// 接管 debugPrint、FlutterError.onError 和 PlatformDispatcher.onError。
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
      orig('未捕获的异常：$error\n$stack');
      write('E', '$error\n$stack');
      // 已经记下来了，不让引擎再当成致命错误
      return true;
    };
  }

  /// 写一行。[level] 是 I / W / E。
  static void write(String level, String message) {
    final f = _file;
    if (f == null || _capped) return;
    final line =
        '${DateTime.now().toIso8601String()} $level ${redact(message)}\n';
    // 同步写：崩溃前的最后几行也能落盘
    try {
      final bytes = utf8.encode(line);
      if (_written + bytes.length > sessionBytes) {
        _capped = true;
        f.writeStringSync(
          '${DateTime.now().toIso8601String()} W 本次日志已满，后面的不再记录\n',
        );
        return;
      }
      f.writeFromSync(bytes);
      _written += bytes.length;
    } on FileSystemException {
      // 磁盘满了之类：不再写
      _capped = true;
    }
  }

  /// 关掉文件，恢复接管前的回调（测试用）。
  static void close() {
    try {
      _file?.closeSync();
    } on FileSystemException {
      // 忽略
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
