// 插件的网页登录（host.webSignIn）：macOS 上由原生窗口完成，见
// macos/Runner/MainFlutterWindow.swift 里的 WebSignIn。

import 'dart:io';

import 'package:flutter/services.dart';

const _channel = MethodChannel('yesplaymusic/websignin');

/// 打开登录窗口，等到要的 Cookie 都有了返回 `{cookie}`。用户关掉窗口时抛错。
Future<Map<String, Object?>> webSignIn(Map<String, Object?> args) async {
  if (!Platform.isMacOS) {
    throw StateError('webSignIn is only available on macOS for now');
  }
  try {
    final cookie = await _channel.invokeMethod<String>('open', args);
    return {'cookie': cookie ?? ''};
  } on PlatformException catch (e) {
    throw StateError(e.message ?? e.code);
  }
}
