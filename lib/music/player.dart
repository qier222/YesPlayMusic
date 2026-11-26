// Playback engine: hands the AudioStream from a Source to libmpv (media_kit).
//
// Local files are file://, plugins give http(s), possibly with headers (Referer, Cookie…);
// to the engine it makes no difference.
//
// Gapless: mpv's playlist holds at most two entries, [current, next]. [queueNext]
// appends the next one shortly before the end and mpv moves on by itself
// (gapless-audio defaults to weak: seamless when the formats match), then tells
// the app through [onAdvanced]. Only local files (library, audio cache) are
// appended, so headers and expiring URLs don't matter.

import 'dart:async';
import 'dart:ffi';
import 'dart:io';
import 'dart:math' as math;

import 'package:flutter/foundation.dart' show kDebugMode, visibleForTesting;
import 'package:media_kit/media_kit.dart' as mk;

import '../net/proxy.dart';
import 'eq.dart';
import 'models.dart';

/// The playback engine the app uses; tests swap in a fake without libmpv.
abstract interface class PlaybackEngine {
  abstract void Function(Duration)? onPosition, onDuration;
  abstract void Function(bool)? onPlaying;
  abstract void Function()? onCompleted;
  abstract void Function(String)? onError;
  abstract void Function(String key)? onAdvanced;
  String? get queuedKey;
  Duration get duration;
  Future<Duration> readDuration();
  Future<void> open(
    AudioStream s, {
    required String key,
    bool play = true,
    Duration? start,
    String rg = 'no',
    double gainDb = 0,
  });
  Future<void> queueNext(
    AudioStream s, {
    required String key,
    String rg = 'no',
    double gainDb = 0,
  });
  Future<void> dropQueued();
  Future<void> setReplayGain(String rg, double gainDb);
  Future<void> setEq(EqSettings s);
  Future<void> play();
  Future<void> pause();
  Future<void> seek(Duration d);
  Future<void> setVolume(double v);
  Future<void> setFade(double f);
  Future<void> stop();
  Future<void> dispose();
}

class AudioEngine implements PlaybackEngine {
  AudioEngine() {
    _subs = [
      _p.stream.position.listen((d) => onPosition?.call(d)),
      _p.stream.duration.listen((d) => onDuration?.call(d)),
      _p.stream.playing.listen((v) => onPlaying?.call(v)),
      // mpv reports eof-reached at the end of every file, even with another queued;
      // when the next one is queued mpv continues by itself, so it isn't the end
      _p.stream.completed.listen((done) {
        if (!done || _queuedKey != null) return;
        // media_kit restarts at playlist index 0 after EOF.
        _prunePlayedTracks().ignore();
        onCompleted?.call();
      }),
      _p.stream.error.listen((e) => onError?.call(e)),
      _p.stream.playlist.listen(_onPlaylist),
    ];
    final n = _native;
    if (n != null) {
      // Network audio uses the system proxy (local files are unaffected).
      final proxy = systemProxy();
      if (proxy != null) n.setProperty('http-proxy', proxy.url);
      n.setProperty('prefetch-playlist', 'yes');
      // Lyrics are loaded by the app; stop mpv auto-loading sidecar .lrc files as subtitles.
      n.setProperty('sub-auto', 'no');
      n.onLoadHooks.add(_onLoad);
    }
  }

  mk.NativePlayer? get _native =>
      _p.platform is mk.NativePlayer ? _p.platform as mk.NativePlayer : null;

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

  @override
  void Function(Duration)? onPosition, onDuration;
  @override
  void Function(bool)? onPlaying;

  /// The whole mpv list finished (nothing queued next).
  @override
  void Function()? onCompleted;
  @override
  void Function(String)? onError;

  /// mpv moved on to the track queued by [queueNext]; the argument is its key.
  @override
  void Function(String key)? onAdvanced;

  /// Keys of the playing and queued tracks (as given to open / queueNext).
  String? _currentKey, _queuedKey;
  @override
  String? get queuedKey => _queuedKey;
  @override
  Duration get duration => _p.state.duration;

  @override
  Future<Duration> readDuration() async {
    final n = _native;
    if (n == null) return Duration.zero;
    final value = await n.getProperty('duration', waitForInitialization: false);
    final seconds = double.tryParse(value);
    if (seconds == null || !seconds.isFinite || seconds <= 0) {
      return Duration.zero;
    }
    return Duration(microseconds: (seconds * 1000000).round());
  }

  /// Opens and (by default) starts playing, replacing mpv's whole list. [start]
  /// restores the previous position. [rg] and [gainDb] are this track's ReplayGain,
  /// see replay_gain.dart.
  @override
  Future<void> open(
    AudioStream s, {
    required String key,
    bool play = true,
    Duration? start,
    String rg = 'no',
    double gainDb = 0,
  }) async {
    _currentKey = key;
    _queuedKey = null;
    await _p.open(
      _media(s, key: key, start: start, rg: rg, gainDb: gainDb),
      play: play,
    );
  }

  /// Queues the next track in mpv to follow the current one without a gap. Replaces any track already queued.
  @override
  Future<void> queueNext(
    AudioStream s, {
    required String key,
    String rg = 'no',
    double gainDb = 0,
  }) async {
    await dropQueued();
    await _prunePlayedTracks();
    _queuedKey = key;
    await _p.add(_media(s, key: key, rg: rg, gainDb: gainDb));
  }

  Future<void> _prunePlayedTracks() async {
    for (var i = _p.state.playlist.index - 1; i >= 0; i--) {
      await _p.remove(i);
    }
  }

  /// Removes the queued track (the queue changed, the sleep timer stops after this one…).
  @override
  Future<void> dropQueued() async {
    if (_queuedKey == null) return;
    _queuedKey = null;
    final pl = _p.state.playlist;
    for (var i = pl.medias.length - 1; i > pl.index; i--) {
      await _p.remove(i);
    }
  }

  mk.Media _media(
    AudioStream s, {
    required String key,
    Duration? start,
    required String rg,
    required double gainDb,
  }) {
    final uri = Uri.parse(s.url);
    // mpv handles escaping of CJK, spaces etc. in file:// inconsistently; passing the local path directly is safest.
    final target = uri.scheme == 'file' ? uri.toFilePath() : s.url;
    return mk.Media(
      target,
      httpHeaders: s.headers.isEmpty ? null : s.headers,
      start: start,
      extras: {'key': key, 'rg': rg, 'gain': gainDb},
    );
  }

  /// Reads an mpv property, so tests can check a setting took effect.
  @visibleForTesting
  Future<String> mpvProperty(String name) =>
      _native?.getProperty(name) ?? Future.value('');

  void _onPlaylist(mk.Playlist pl) {
    // The index is 0 after opening or dropping the finished track; it's 1 only when mpv moved on by itself
    if (pl.index <= 0 || pl.index >= pl.medias.length) return;
    final key = pl.medias[pl.index].extras?['key'];
    if (key is! String || key == _currentKey) return;
    _currentKey = key;
    if (_queuedKey == key) _queuedKey = null;
    onAdvanced?.call(key);
  }

  /// Before each file loads (mpv's on_load hook, which mpv waits for): apply this
  /// track's ReplayGain through file-local-options, which reset when it ends.
  Future<void> _onLoad() async {
    final n = _native;
    if (n == null) return;
    try {
      final pos = int.tryParse(await n.getProperty('playlist-pos')) ?? -1;
      final ms = _p.state.playlist.medias;
      if (pos < 0 || pos >= ms.length) return;
      final x = ms[pos].extras;
      await n.setProperty(
        'file-local-options/replaygain',
        '${x?['rg'] ?? 'no'}',
      );
      final gain = (x?['gain'] as num?)?.toDouble() ?? 0;
      await n.setProperty(
        'file-local-options/replaygain-fallback',
        gain.toStringAsFixed(2),
      );
    } catch (_) {
      // If it can't be found, play with the global settings
    }
  }

  /// Changes the ReplayGain of the playing track (when the setting changes); later tracks use what they were opened with.
  @override
  Future<void> setReplayGain(String rg, double gainDb) async {
    final n = _native;
    if (n == null) return;
    await n.setProperty('replaygain', rg);
    await n.setProperty('file-local-options/replaygain', rg);
    await n.setProperty(
      'file-local-options/replaygain-fallback',
      gainDb.toStringAsFixed(2),
    );
  }

  // ───── Equalizer ─────
  EqSettings _eq = const EqSettings();

  @override
  Future<void> setEq(EqSettings s) async {
    final prev = _eq;
    _eq = s;
    _preampDb = eqPreamp(s);
    await _applyVolume();
    final n = _native;
    if (n == null) return;
    if (prev.active && s.active) {
      // Only the gains changed: send a command per band instead of rebuilding the chain (which pops)
      final a = prev.gains, b = s.gains;
      for (var i = 0; i < eqBands.length; i++) {
        if (a[i] == b[i]) continue;
        await n.command([
          'af-command',
          eqLabel(i),
          'g',
          b[i].toStringAsFixed(1),
        ]);
      }
    } else if (prev.active != s.active || s.active) {
      await n.setProperty('af', eqFilter(s));
    }
  }

  // ───── Volume ─────
  // Output volume = slider × equalizer preamp × fade, all folded into mpv's volume.
  double _volume = 0, _preampDb = 0, _fade = 1;

  @override
  Future<void> play() => _p.play();
  @override
  Future<void> pause() => _p.pause();
  @override
  Future<void> seek(Duration d) => _p.seek(d);

  /// 0–1, slider position.
  @override
  Future<void> setVolume(double v) {
    _volume = v;
    return _applyVolume();
  }

  /// Fade factor (0–1, amplitude) for the sleep timer; doesn't change the saved volume.
  @override
  Future<void> setFade(double f) {
    _fade = f.clamp(0.0, 1.0);
    return _applyVolume();
  }

  Future<void> _applyVolume() =>
      _p.setVolume(mpvVolume(_volume, gainDb: _preampDb, fade: _fade));

  /// Slider position → mpv volume (0–100).
  ///
  /// An exponential curve even in decibels (https://dr-lex.be/info-stuff/volumecontrols.html):
  /// amplitude = 10^(−[_rangeDb]·(1−p)/20), so every 10% of the slider changes loudness by the same amount;
  /// the bottom 10% goes linearly to 0, so all the way down is true silence.
  /// The range isn't the 60 dB the article recommends: system volume already lowers things a lot, and at 60 dB the lower half
  /// is all below −30 dB, sounding equally quiet and useless.
  /// mpv itself cubes volume/100 (audio_get_gain in player/audio.c),
  /// so take the cube root here to cancel it out.
  /// [gainDb] (≤ 0) and [fade] multiply the amplitude.
  static double mpvVolume(double p, {double gainDb = 0, double fade = 1}) {
    p = p.clamp(0.0, 1.0);
    double amp(double x) => math.pow(10, -_rangeDb * (1 - x) / 20).toDouble();
    var a = p < 0.1 ? p * 10 * amp(0.1) : amp(p);
    a *= math.pow(10, math.min(gainDb, 0) / 20) * fade.clamp(0.0, 1.0);
    return 100 * math.pow(a.clamp(0.0, 1.0), 1 / 3).toDouble();
  }

  /// Loudness range (dB) from the bottom to the top of the slider.
  static const _rangeDb = 40.0;

  @override
  Future<void> stop() {
    _currentKey = null;
    _queuedKey = null;
    return _p.stop();
  }

  @override
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
