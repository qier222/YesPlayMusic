import 'dart:async';
import 'dart:io';

import 'package:flutter/services.dart';

import 'state.dart';

/// The system "Now Playing": tells the system the current song (Control Center, lock screen) and receives
/// keyboard media keys and headphone buttons. macOS uses MPRemoteCommandCenter (native code in
/// MainFlutterWindow.swift); other platforms aren't wired up yet and calls fail silently.
class MediaSession {
  MediaSession(this.app);
  final AppState app;

  static const _channel = MethodChannel('yesplaymusic/media');
  Timer? _drift;

  // State last sent to the system; it extrapolates progress from the playback rate, so only resend on changes or when progress drifts.
  String? _key;
  bool? _playing;
  double _sentPos = 0;
  DateTime _sentAt = DateTime(0);

  void attach() {
    if (!Platform.isMacOS) return;
    _channel.setMethodCallHandler(_onCommand);
    app.addListener(_sync);
    // Seeking and skipping don't always notify, so check progress every second
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
          // Only fetch the cover again when the song changes
          if (!sameTrack) 'art': _art(t.cover),
        })
        .catchError((_) => null);
  }

  /// The system can only take network covers or local files.
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
