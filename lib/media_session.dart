import 'dart:async';
import 'dart:io';

import 'package:flutter/services.dart';

import 'state.dart';

/// 系统的「正在播放」：把当前歌曲告诉系统（控制中心、锁屏），并接住键盘上的
/// 媒体键和耳机按键。macOS 走 MPRemoteCommandCenter（原生代码在
/// MainFlutterWindow.swift）；其他平台还没有接，调用会静默失败。
class MediaSession {
  MediaSession(this.app);
  final AppState app;

  static const _channel = MethodChannel('yesplaymusic/media');
  Timer? _drift;

  // 上次告诉系统的状态；系统按播放速度自己推算进度，只在变化或进度对不上时再发。
  String? _key;
  bool? _playing;
  double _sentPos = 0;
  DateTime _sentAt = DateTime(0);

  void attach() {
    if (!Platform.isMacOS) return;
    _channel.setMethodCallHandler(_onCommand);
    app.addListener(_sync);
    // 拖进度条、快进快退不一定会通知，每秒对一下进度
    _drift = Timer.periodic(const Duration(seconds: 1), (_) => _sync());
    _sync();
  }

  void detach() {
    if (!Platform.isMacOS) return;
    _drift?.cancel();
    app.removeListener(_sync);
    _channel.setMethodCallHandler(null);
  }

  void _sync() {
    final t = app.track;
    final pos = app.position;
    final expected = _playing == true
        ? _sentPos + DateTime.now().difference(_sentAt).inMilliseconds / 1000
        : _sentPos;
    if (t.key == _key &&
        app.playing == _playing &&
        (pos - expected).abs() < 1.5) {
      return;
    }
    final sameTrack = t.key == _key;
    _key = t.key;
    _playing = app.playing;
    _sentPos = pos;
    _sentAt = DateTime.now();
    _channel
        .invokeMethod('update', {
          'title': t.title,
          'artist': t.artist,
          'album': t.album,
          'duration': t.seconds.toDouble(),
          'position': pos,
          'playing': app.playing,
          // 换歌时才重新取封面
          if (!sameTrack) 'art': _art(t.cover),
        })
        .catchError((_) => null);
  }

  /// 系统只能取网络封面或本地文件。
  static String _art(String cover) =>
      cover.startsWith('http') || cover.startsWith('/') ? cover : '';

  Future<void> _onCommand(MethodCall call) async {
    switch (call.method) {
      case 'play':
        if (!app.playing) app.togglePlay();
      case 'pause':
        if (app.playing) app.togglePlay();
      case 'toggle':
        app.togglePlay();
      case 'next':
        app.next();
      case 'previous':
        app.prev();
      case 'seek':
        final s = (call.arguments as num?)?.toDouble() ?? 0;
        if (app.track.seconds > 0) app.seek(s / app.track.seconds);
    }
    _sync();
  }
}
