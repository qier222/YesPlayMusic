import 'dart:async';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

import 'data.dart';
import 'playback_artwork.dart';
import 'state.dart';

/// Publishes Now Playing and receives media commands via MPRemoteCommandCenter
/// on macOS and System Media Transport Controls on Windows.
class MediaSession {
  MediaSession(
    this.app, {
    @visibleForTesting MethodChannel? channel,
    @visibleForTesting bool? isWindows,
    @visibleForTesting bool? isMacOS,
  }) : _channel = channel ?? _defaultChannel,
       _isWindows = isWindows ?? Platform.isWindows,
       _isMacOS = isMacOS ?? Platform.isMacOS;
  final AppState app;

  static bool get supportsMediaKeys => Platform.isMacOS || Platform.isWindows;

  static const _defaultChannel = MethodChannel('yesplaymusic/media');
  final MethodChannel _channel;
  final bool _isWindows;
  final bool _isMacOS;
  bool get _supported => _isMacOS || _isWindows;
  Timer? _drift;

  // State last sent to the system; it extrapolates progress from the playback rate, so only resend on changes or when progress drifts.
  String? _key;
  String? _cover;
  int _artworkRevision = 0;
  bool? _playing;
  bool? _island;
  bool? _shuffle;
  bool? _repeat;
  bool? _liked;
  double? _duration;
  double _sentPos = 0;
  DateTime _sentAt = DateTime(0);

  void attach() {
    if (!_supported) return;
    _channel.setMethodCallHandler(_onCommand);
    app.addListener(_sync);
    // Seeking and skipping don't always notify, so check progress every second
    _drift = Timer.periodic(const Duration(seconds: 1), (_) => _sync());
    _sync();
  }

  void detach() {
    if (!_supported) return;
    _drift?.cancel();
    app.removeListener(_sync);
    _channel.setMethodCallHandler(null);
    if (_isWindows) {
      _resetSent();
      _send('clear');
    }
  }

  void _resetSent() {
    _key = null;
    _cover = null;
    _playing = null;
    _shuffle = null;
    _repeat = null;
    _liked = null;
    _duration = null;
    _artworkRevision++;
  }

  void _sync() {
    final t = app.track;
    if (_isWindows && identical(t, Track.none)) {
      if (_key != null) {
        _resetSent();
        _send('clear');
      }
      return;
    }
    final pos = app.position;
    final duration = app.playbackDuration;
    final expected = _playing == true
        ? _sentPos + DateTime.now().difference(_sentAt).inMilliseconds / 1000
        : _sentPos;
    final trackChanged = t.key != _key;
    final artworkChanged = trackChanged || (_isWindows && t.cover != _cover);
    final liked = app.isLiked;
    if (!artworkChanged &&
        app.playing == _playing &&
        app.island == _island &&
        app.shuffle == _shuffle &&
        app.repeat == _repeat &&
        (!_isWindows || liked == _liked) &&
        duration == _duration &&
        (pos - expected).abs() < 1.5) {
      return;
    }
    _key = t.key;
    _cover = t.cover;
    _playing = app.playing;
    _island = app.island;
    _shuffle = app.shuffle;
    _repeat = app.repeat;
    _liked = liked;
    _duration = duration;
    _sentPos = pos;
    _sentAt = DateTime.now();
    _send('update', {
      'title': t.title,
      'artist': t.artist,
      'album': t.album,
      'duration': duration,
      'position': pos,
      'playing': app.playing,
      'shuffle': app.shuffle,
      'repeat': app.repeat,
      // Dynamic Island toggle (native code in DynamicIsland.swift)
      'island': app.island,
      if (_isWindows) 'liked': liked,
      if (_isWindows) 'artworkChanged': artworkChanged,
      if (_isMacOS && trackChanged) 'art': _art(t.cover),
    });
    if (_isWindows && artworkChanged) {
      final revision = ++_artworkRevision;
      if (t.cover.isNotEmpty) unawaited(_loadArtwork(t.cover, revision));
    }
  }

  static String _art(String cover) =>
      cover.startsWith('http') || cover.startsWith('/') ? cover : '';

  Future<void> _loadArtwork(String cover, int revision) async {
    try {
      final bytes = await loadPlaybackArtwork(cover);
      if (revision == _artworkRevision) await _send('artwork', bytes);
    } catch (error) {
      if (revision == _artworkRevision) {
        debugPrint('Media artwork failed: ${error.runtimeType}');
      }
    }
  }

  Future<void> _send(String method, [Object? arguments]) async {
    try {
      await _channel.invokeMethod<void>(method, arguments);
    } catch (error) {
      if (_isWindows) debugPrint('SMTC $method failed: $error');
    }
  }

  Future<void> _onCommand(MethodCall call) async {
    switch (call.method) {
      case 'play':
        if (!app.playing) app.togglePlay();
      case 'pause':
        if (app.playing) app.togglePlay();
      case 'stop':
        app.pause();
        app.seekTo(0);
      case 'toggle':
        app.togglePlay();
      case 'next':
        app.next();
      case 'previous':
        app.prev();
      case 'seek':
        final s = (call.arguments as num?)?.toDouble() ?? 0;
        app.seekTo(s);
      case 'shuffle':
        final target = call.arguments;
        if (target is bool) {
          if (app.shuffle != target) app.toggleShuffle();
        } else {
          app.toggleShuffle();
        }
      case 'repeat':
        final target = call.arguments;
        if (target is bool) {
          if (app.repeat != target) app.toggleRepeat();
        } else {
          app.toggleRepeat();
        }
      case 'like':
        if (!identical(app.track, Track.none)) app.toggleLike();
      case 'openNowPlaying':
        app.openNowPlaying();
    }
    _sync();
  }
}
