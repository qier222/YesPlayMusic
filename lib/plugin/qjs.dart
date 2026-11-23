// QuickJS 的 Dart 绑定（native/qjs_shim.c 编译成的原生资源）。
//
// JsRuntime 是同步的、只能在创建它的 isolate 里用。JS 只有一个出口：
// 全局函数 __host(op, json)，同步回到 [JsRuntime.host]。

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

/// JS 里抛出、没被接住的错误。[message] 含名字、消息和栈。
class JsError implements Exception {
  JsError(this.message);
  final String message;

  /// 超出单次运行时间被中断。
  bool get interrupted => message.startsWith('InternalError: interrupted');

  /// 超出内存上限。
  bool get outOfMemory => message.contains('out of memory');

  @override
  String toString() => 'JsError: $message';
}

/// [JsRuntime.host] 抛这个，JS 里就抛一个带 [message] 的 Error。
class HostError implements Exception {
  HostError(this.message);
  final String message;
  @override
  String toString() => message;
}

/// 一个 QuickJS 运行时 + 上下文。
///
/// [host] 收到 JS 调用的 `__host(op, json)`，返回的字符串原样成为 JS 里的
/// 返回值（null 为 undefined）。它在 JS 执行过程中被同步调用，不能反过来
/// 再调 [eval]/[pump]。
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
      throw StateError('QuickJS 运行时创建失败');
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
    if (disposed) throw StateError('运行时已释放');
    if (_inside) throw StateError('不能在 host 回调里重入 JS');
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

  /// 作为全局脚本执行 [src]（不跑 Promise 任务，见 [pump]）。
  /// 执行超过 [budgetMs] 毫秒会被中断，抛 [JsError]。
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

  /// 跑完所有待执行的 Promise 任务。
  void pump({int budgetMs = 0}) {
    _enter(budgetMs, () {
      if (_qjsPump(_q) != 0) throw JsError(_error);
    });
  }

  /// 当前占用的内存（字节）。
  int get memory => _qjsMemory(_q);

  void dispose() {
    if (disposed) return;
    _qjsFree(_q);
    _q = nullptr;
    _cb.close();
  }
}
