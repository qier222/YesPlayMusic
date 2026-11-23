// 播放引擎：把 Source 给出的 AudioStream 交给 libmpv（media_kit）播放。
//
// 本地文件是 file://，插件给的是 http(s)，可能带请求头（Referer、Cookie…），
// 对引擎来说没有区别。

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
    // 网络音频走系统代理（本地文件不受影响）。
    final proxy = systemProxy();
    if (proxy != null && _p.platform is mk.NativePlayer) {
      (_p.platform as mk.NativePlayer).setProperty('http-proxy', proxy.url);
    }
  }

  /// 进程里调用一次，加载 libmpv。
  static void init() {
    mk.MediaKit.ensureInitialized();
    if (kDebugMode) _detachStalePlayers();
  }

  /// 热重启保护。mpv 的唤醒回调指向创建它的 isolate；热重启时旧 isolate
  /// 被销毁，mpv 核心线程再发事件（播放中每秒好几次）就跳进野指针崩溃
  /// （SIGSEGV/SIGBUS，栈在 mpv send_event / mp_client_send_property_changes）。
  ///
  /// 1. 挂一个 NativeFinalizer：isolate 销毁时 Dart VM 先跑 finalizer、再回收
  ///    回调跳板，C 里（native/mpv_guard.c）同步把所有 mpv 实例的回调清掉，
  ///    不留空窗。
  /// 2. 新 isolate 起来再清一遍，兜住没走到 finalizer 的情况。
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
      // 只是开发期的保护，找不到就算了
    }
  }

  static final _mpvGuard = NativeFinalizer(
    Native.addressOf<NativeFunction<Void Function(Pointer<Void>)>>(
      _mpvDetachAll,
    ),
  );

  /// 永远不释放，它的 finalizer 只会在 isolate 销毁时触发。
  static final _mpvGuardToken = _MpvGuardToken();

  final mk.Player _p = mk.Player(
    configuration: const mk.PlayerConfiguration(title: 'YesPlayMusic'),
  );
  late final List<StreamSubscription<Object?>> _subs;

  void Function(Duration)? onPosition, onDuration;
  void Function(bool)? onPlaying;
  void Function()? onCompleted;
  void Function(String)? onError;

  /// 打开并（默认）开始播放。[start] 用于恢复上次的进度。
  Future<void> open(AudioStream s, {bool play = true, Duration? start}) async {
    final uri = Uri.parse(s.url);
    // mpv 对 file:// 里的中文、空格等转义处理不一，直接给本地路径最稳。
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

  /// 0~1，滑块位置。
  Future<void> setVolume(double v) => _p.setVolume(mpvVolume(v));

  /// 滑块位置 → mpv 的 volume（0~100）。
  ///
  /// 按分贝均匀的指数曲线（https://dr-lex.be/info-stuff/volumecontrols.html）：
  /// 幅度 = 10^(−[_rangeDb]·(1−p)/20)，滑块每走 10% 响度变化一样多；
  /// 最底下 10% 线性收到 0，拉到底是真正的静音。
  /// 范围没用文章推荐的 60 dB：系统音量本身已经压低了一截，60 dB 时下半段
  /// 全在 −30 dB 以下，听着都差不多小，用不上。
  /// mpv 自己会把 volume/100 再三次方（player/audio.c 的 audio_get_gain），
  /// 所以这里先开立方根抵消掉。
  static double mpvVolume(double p) {
    p = p.clamp(0.0, 1.0);
    double amp(double x) => math.pow(10, -_rangeDb * (1 - x) / 20).toDouble();
    final a = p < 0.1 ? p * 10 * amp(0.1) : amp(p);
    return 100 * math.pow(a.clamp(0.0, 1.0), 1 / 3).toDouble();
  }

  /// 滑块从底到顶的响度范围（dB）。
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
