// Playback engine: hands the AudioStream from a Source to libmpv (media_kit).
//
// Local files are file://, plugins give http(s), possibly with headers (Referer, Cookie…);
// to the engine it makes no difference.

import 'dart:async';
import 'dart:ffi';
import 'dart:io';
import 'dart:math' as math;

import 'package:flutter/foundation.dart' show kDebugMode;
import 'package:media_kit/media_kit.dart' as mk;

import '../net/proxy.dart';
import 'models.dart';

class AudioEngine {
  AudioEngine() {
    _subs = [
      _p.stream.position.listen((d) => onPosition?.call(d)),
      _p.stream.duration.listen((d) => onDuration?.call(d)),
      _p.stream.playing.listen((v) => onPlaying?.call(v)),
      _p.stream.completed.listen((done) {
        if (done) onCompleted?.call();
      }),
      _p.stream.error.listen((e) => onError?.call(e)),
    ];
    // Network audio uses the system proxy (local files are unaffected).
    final proxy = systemProxy();
    if (proxy != null && _p.platform is mk.NativePlayer) {
      (_p.platform as mk.NativePlayer).setProperty('http-proxy', proxy.url);
    }
  }

  /// Called once per process to load libmpv.
  static void init() {
    mk.MediaKit.ensureInitialized();
    if (kDebugMode) _detachStalePlayers();
  }

  /// Hot restart guard. mpv's wakeup callback points into the isolate that created it; on hot restart the old isolate
  /// is destroyed, and the next event from mpv's core thread (several per second while playing) jumps into a dangling pointer and crashes
  /// (SIGSEGV/SIGBUS, with the stack in mpv send_event / mp_client_send_property_changes).
  ///
  /// 1. Attach a NativeFinalizer: when the isolate is destroyed the Dart VM runs finalizers before freeing
  ///    callback trampolines, and the C code (native/mpv_guard.c) synchronously clears the callbacks of every mpv instance,
  ///    leaving no gap.
  /// 2. Clear again when the new isolate starts, covering cases where the finalizer didn't run.
  static void _detachStalePlayers() {
    try {
      final file = File(
        '${Directory.systemTemp.path}/'
        'com.alexmercerind.media_kit.NativeReferenceHolder.$pid',
      );
      if (!file.existsSync()) return;
      final address = int.tryParse(file.readAsStringSync().trim());
      if (address == null || address == 0) return;
      final buffer = Pointer<Void>.fromAddress(address);
      _mpvDetachAll(buffer);
      _mpvGuard.attach(_mpvGuardToken, buffer);
    } catch (_) {
      // Only a development-time guard; if it can't be found, never mind
    }
  }

  static final _mpvGuard = NativeFinalizer(
    Native.addressOf<NativeFunction<Void Function(Pointer<Void>)>>(
      _mpvDetachAll,
    ),
  );

  /// Never released; its finalizer only fires when the isolate is destroyed.
  static final _mpvGuardToken = _MpvGuardToken();

  final mk.Player _p = mk.Player(
    configuration: const mk.PlayerConfiguration(title: 'YesPlayMusic'),
  );
  late final List<StreamSubscription<Object?>> _subs;

  void Function(Duration)? onPosition, onDuration;
  void Function(bool)? onPlaying;
  void Function()? onCompleted;
  void Function(String)? onError;

  /// Opens and (by default) starts playing. [start] restores the previous position.
  Future<void> open(AudioStream s, {bool play = true, Duration? start}) async {
    final uri = Uri.parse(s.url);
    // mpv handles escaping of CJK, spaces etc. in file:// inconsistently; passing the local path directly is safest.
    final target = uri.scheme == 'file' ? uri.toFilePath() : s.url;
    await _p.open(
      mk.Media(
        target,
        httpHeaders: s.headers.isEmpty ? null : s.headers,
        start: start,
      ),
      play: play,
    );
  }

  Future<void> play() => _p.play();
  Future<void> pause() => _p.pause();
  Future<void> seek(Duration d) => _p.seek(d);

  /// 0–1, slider position.
  Future<void> setVolume(double v) => _p.setVolume(mpvVolume(v));

  /// Slider position → mpv volume (0–100).
  ///
  /// An exponential curve even in decibels (https://dr-lex.be/info-stuff/volumecontrols.html):
  /// amplitude = 10^(−[_rangeDb]·(1−p)/20), so every 10% of the slider changes loudness by the same amount;
  /// the bottom 10% goes linearly to 0, so all the way down is true silence.
  /// The range isn't the 60 dB the article recommends: system volume already lowers things a lot, and at 60 dB the lower half
  /// is all below −30 dB, sounding equally quiet and useless.
  /// mpv itself cubes volume/100 (audio_get_gain in player/audio.c),
  /// so take the cube root here to cancel it out.
  static double mpvVolume(double p) {
    p = p.clamp(0.0, 1.0);
    double amp(double x) => math.pow(10, -_rangeDb * (1 - x) / 20).toDouble();
    final a = p < 0.1 ? p * 10 * amp(0.1) : amp(p);
    return 100 * math.pow(a.clamp(0.0, 1.0), 1 / 3).toDouble();
  }

  /// Loudness range (dB) from the bottom to the top of the slider.
  static const _rangeDb = 40.0;

  Future<void> stop() => _p.stop();

  Future<void> dispose() async {
    for (final s in _subs) {
      await s.cancel();
    }
    await _p.dispose();
  }
}

final class _MpvGuardToken implements Finalizable {}

@Native<Void Function(Pointer<Void>)>(
  symbol: 'ypm_mpv_detach_all',
  assetId: 'package:yesplaymusic/qjs',
)
external void _mpvDetachAll(Pointer<Void> buffer);
