// Text input messages must not be handled in the middle of a frame.
//
// With accessibility on, macOS gets the semantics tree at the end of each frame (FlutterView.updateSemantics),
// and during that call the system synchronously sends text input updates
// (updateEditingValue on flutter/textinput) back to Dart. The text field changes value and asks to rebuild,
// triggering "Build scheduled during frame"; that frame aborts and the UI never refreshes again, i.e. it looks frozen.
//
// Here, input messages arriving mid-frame are queued until the frame ends and handled in arrival order.

import 'dart:async';

import 'package:flutter/scheduler.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

class AppBinding extends WidgetsFlutterBinding {
  /// Call on the first line of main instead of WidgetsFlutterBinding.ensureInitialized.
  static void init() => AppBinding();

  @override
  BinaryMessenger createBinaryMessenger() =>
      TextInputDeferral(super.createBinaryMessenger());
}

/// Only changes how messages on the flutter/textinput channel are received; everything else goes to [inner] unchanged.
class TextInputDeferral implements BinaryMessenger {
  TextInputDeferral(this.inner);
  final BinaryMessenger inner;

  // Messages not yet handled; while any are queued, later ones must queue behind them to keep the order.
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
