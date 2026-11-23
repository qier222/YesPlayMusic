// 输入法消息不能在一帧中间处理。
//
// macOS 开着辅助功能时，Flutter 每帧末尾把语义树发给系统（FlutterView.updateSemantics），
// 系统在这次调用里会顺带把输入法的更新（flutter/textinput 的 updateEditingValue）
// 同步送回 Dart。这时输入框改值、要求重建，触发 "Build scheduled during frame"，
// 那一帧中断，之后界面不再刷新，看起来就是卡死。
//
// 这里把一帧中间到达的输入法消息排到这一帧结束后，按到达顺序处理。

import 'dart:async';

import 'package:flutter/scheduler.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

class AppBinding extends WidgetsFlutterBinding {
  /// 在 main 的第一行调用，代替 WidgetsFlutterBinding.ensureInitialized。
  static void init() => AppBinding();

  @override
  BinaryMessenger createBinaryMessenger() =>
      TextInputDeferral(super.createBinaryMessenger());
}

/// 只改 flutter/textinput 这一个频道的收消息方式，其他原样转给 [inner]。
class TextInputDeferral implements BinaryMessenger {
  TextInputDeferral(this.inner);
  final BinaryMessenger inner;

  // 还没处理完的消息；有排队的，后到的也得排在后面，保证顺序。
  Future<void> _queue = Future.value();
  int _pending = 0;

  static bool get _midFrame {
    final phase = SchedulerBinding.instance.schedulerPhase;
    return phase == SchedulerPhase.persistentCallbacks ||
        phase == SchedulerPhase.midFrameMicrotasks ||
        phase == SchedulerPhase.transientCallbacks;
  }

  @override
  void setMessageHandler(String channel, MessageHandler? handler) {
    if (channel != SystemChannels.textInput.name || handler == null) {
      return inner.setMessageHandler(channel, handler);
    }
    inner.setMessageHandler(channel, (data) {
      if (_pending == 0 && !_midFrame) return handler(data);
      _pending++;
      final done = Completer<ByteData?>();
      _queue = _queue.then((_) async {
        if (_midFrame) {
          final end = Completer<void>();
          SchedulerBinding.instance.addPostFrameCallback((_) => end.complete());
          await end.future;
        }
        try {
          done.complete(await handler(data));
        } catch (e, s) {
          done.completeError(e, s);
        } finally {
          _pending--;
        }
      });
      return done.future;
    });
  }

  @override
  Future<void> handlePlatformMessage(
    String channel,
    ByteData? data,
    PlatformMessageResponseCallback? callback,
  ) =>
      // ignore: deprecated_member_use
      inner.handlePlatformMessage(channel, data, callback);

  @override
  Future<ByteData?>? send(String channel, ByteData? message) =>
      inner.send(channel, message);
}
