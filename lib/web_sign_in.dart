// Plugin web sign-in (host.webSignIn): done by a native window on macOS, see
// WebSignIn in macos/Runner/MainFlutterWindow.swift.

import 'dart:io';

import 'package:flutter/services.dart';

const _channel = MethodChannel('yesplaymusic/websignin');

/// Opens the sign-in window and returns `{cookie}` once all the required cookies are present. Throws if the user closes the window.
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
