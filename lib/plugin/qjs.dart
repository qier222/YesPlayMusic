// Dart bindings for QuickJS (native asset compiled from native/qjs_shim.c).
//
// JsRuntime is synchronous and can only be used in the isolate that created it. JS has a single exit:
// the global function __host(op, json), which calls back into [JsRuntime.host] synchronously.

@DefaultAsset('package:yesplaymusic/qjs')
library;

import 'dart:convert';
import 'dart:ffi';

import 'package:ffi/ffi.dart';

final class _Qjs extends Opaque {}

typedef _HostFn = Void Function(Int64, Pointer<Utf8>, Pointer<Uint8>, Size);

@Native<
  Pointer<_Qjs> Function(Int64, Size, Size, Pointer<NativeFunction<_HostFn>>)
>(symbol: 'qjs_new')
external Pointer<_Qjs> _qjsNew(
  int id,
  int memoryLimit,
  int stackSize,
  Pointer<NativeFunction<_HostFn>> host,
);

@Native<Void Function(Pointer<_Qjs>)>(symbol: 'qjs_free')
external void _qjsFree(Pointer<_Qjs> q);

@Native<Void Function(Pointer<_Qjs>, Int64)>(symbol: 'qjs_set_budget')
external void _qjsSetBudget(Pointer<_Qjs> q, int ms);

@Native<Void Function(Pointer<_Qjs>, Pointer<Uint8>, Size, Int)>(
  symbol: 'qjs_reply',
)
external void _qjsReply(Pointer<_Qjs> q, Pointer<Uint8> s, int len, int error);

@Native<Int Function(Pointer<_Qjs>, Pointer<Uint8>, Size, Pointer<Utf8>)>(
  symbol: 'qjs_eval',
)
external int _qjsEval(
  Pointer<_Qjs> q,
  Pointer<Uint8> src,
  int len,
  Pointer<Utf8> name,
);

@Native<Int Function(Pointer<_Qjs>)>(symbol: 'qjs_pump')
external int _qjsPump(Pointer<_Qjs> q);

@Native<Pointer<Utf8> Function(Pointer<_Qjs>)>(symbol: 'qjs_error')
external Pointer<Utf8> _qjsError(Pointer<_Qjs> q);

@Native<Int64 Function(Pointer<_Qjs>)>(symbol: 'qjs_memory')
external int _qjsMemory(Pointer<_Qjs> q);

/// An error thrown in JS and not caught. [message] includes the name, message and stack.
class JsError implements Exception {
  JsError(this.message);
  final String message;

  /// Interrupted for exceeding the per-run time limit.
  bool get interrupted => message.startsWith('InternalError: interrupted');

  /// Exceeded the memory limit.
  bool get outOfMemory => message.contains('out of memory');

  @override
  String toString() => 'JsError: $message';
}

/// When [JsRuntime.host] throws this, JS throws an Error with [message].
class HostError implements Exception {
  HostError(this.message);
  final String message;
  @override
  String toString() => message;
}

/// A QuickJS runtime + context.
///
/// [host] receives JS calls to `__host(op, json)`; the returned string becomes the return value in JS
/// as-is (null is undefined). It's called synchronously during JS execution and must not call back
/// into [eval]/[pump].
class JsRuntime {
  JsRuntime({
    required this.host,
    int memoryLimit = 64 << 20,
    int stackSize = 512 << 10,
  }) {
    _cb = NativeCallable<_HostFn>.isolateLocal(_onHost);
    _q = _qjsNew(0, memoryLimit, stackSize, _cb.nativeFunction);
    if (_q == nullptr) {
      _cb.close();
      throw StateError('Failed to create QuickJS runtime');
    }
  }

  final String? Function(String op, String json) host;
  late final NativeCallable<_HostFn> _cb;
  late Pointer<_Qjs> _q;
  bool _inside = false;

  bool get disposed => _q == nullptr;

  void _onHost(int id, Pointer<Utf8> op, Pointer<Uint8> json, int len) {
    String? out;
    var error = false;
    try {
      final o = op.toDartString();
      final j = utf8.decode(json.asTypedList(len), allowMalformed: true);
      out = host(o, j);
    } on HostError catch (e) {
      out = e.message;
      error = true;
    } catch (e) {
      out = '$e';
      error = true;
    }
    if (out == null) {
      _qjsReply(_q, nullptr, 0, error ? 1 : 0);
      return;
    }
    final bytes = utf8.encode(out);
    using((a) {
      final p = a<Uint8>(bytes.length + 1);
      p.asTypedList(bytes.length).setAll(0, bytes);
      _qjsReply(_q, p, bytes.length, error ? 1 : 0);
    });
  }

  T _enter<T>(int budgetMs, T Function() f) {
    if (disposed) throw StateError('Runtime already disposed');
    if (_inside) throw StateError('Cannot re-enter JS from a host callback');
    _inside = true;
    _qjsSetBudget(_q, budgetMs);
    try {
      return f();
    } finally {
      _qjsSetBudget(_q, 0);
      _inside = false;
    }
  }

  String get _error => _qjsError(_q).toDartString();

  /// Runs [src] as a global script (doesn't run Promise jobs, see [pump]).
  /// Interrupted with [JsError] after [budgetMs] milliseconds.
  void eval(String src, {String name = '<eval>', int budgetMs = 0}) {
    _enter(budgetMs, () {
      final bytes = utf8.encode(src);
      using((a) {
        final p = a<Uint8>(bytes.length + 1);
        p.asTypedList(bytes.length).setAll(0, bytes);
        if (_qjsEval(_q, p, bytes.length, name.toNativeUtf8(allocator: a)) !=
            0) {
          throw JsError(_error);
        }
      });
    });
  }

  /// Runs all pending Promise jobs.
  void pump({int budgetMs = 0}) {
    _enter(budgetMs, () {
      if (_qjsPump(_q) != 0) throw JsError(_error);
    });
  }

  /// Memory currently in use (bytes).
  int get memory => _qjsMemory(_q);

  void dispose() {
    if (disposed) return;
    _qjsFree(_q);
    _q = nullptr;
    _cb.close();
  }
}
