// host.ipc: lets a plugin connect to a local channel opened by another app on
// this computer (runs in the plugin isolate).
//
// On macOS and Linux it's a Unix socket looked up in the temp directories
// ($XDG_RUNTIME_DIR, $TMPDIR, $TMP, $TEMP, /tmp); on Windows it's the named
// pipe \\.\pipe\<name>, e.g. Discord's discord-ipc-0. Only names listed in
// plugin.json's permissions.ipc may be used; * matches within one directory
// level, e.g. "discord-ipc-*", "snap.discord/discord-ipc-*".
//
// Reads and writes run one at a time in call order: on a synchronous Windows
// pipe a write can't go through while a read is pending.

import 'dart:async';
import 'dart:collection';
import 'dart:ffi';
import 'dart:io';
import 'dart:isolate';
import 'dart:typed_data';

import 'package:ffi/ffi.dart';
import 'package:path/path.dart' as p;

/// A name is segments of letters, digits and `. _ -` separated by `/`, with no
/// `..`. Windows pipe names have no directories, so no `/` there.
bool ipcNameValid(String name) {
  if (!RegExp(r'^[A-Za-z0-9._-]+(/[A-Za-z0-9._-]+)*$').hasMatch(name)) {
    return false;
  }
  if (name.split('/').any((s) => s == '.' || s == '..')) return false;
  return !(Platform.isWindows && name.contains('/'));
}

/// Whether [name] is within [allowed] (permissions.ipc).
bool ipcAllowed(String name, List<String> allowed) {
  if (!ipcNameValid(name)) return false;
  for (final e in allowed) {
    final re = RegExp('^${e.split('*').map(RegExp.escape).join('[^/]*')}\$');
    if (re.hasMatch(name)) return true;
  }
  return false;
}

/// Directories searched for sockets on Unix, in order.
List<String> ipcDirs([Map<String, String>? env]) {
  final e = env ?? Platform.environment;
  final out = <String>[];
  for (final k in ['XDG_RUNTIME_DIR', 'TMPDIR', 'TMP', 'TEMP']) {
    final v = e[k];
    if (v != null && v.isNotEmpty && !out.contains(v)) out.add(v);
  }
  if (!out.contains('/tmp')) out.add('/tmp');
  return out;
}

abstract class IpcConnection {
  /// Connects to [name]; throws [SocketException] / [FileSystemException] when
  /// it's missing or refuses.
  static Future<IpcConnection> connect(String name) async {
    if (!ipcNameValid(name)) {
      throw FileSystemException('invalid ipc name', name);
    }
    if (Platform.isWindows) return _PipeConnection.open(name);
    Object? last;
    for (final d in ipcDirs()) {
      final path = p.join(d, name);
      if (FileSystemEntity.typeSync(path) !=
          FileSystemEntityType.unixDomainSock) {
        continue;
      }
      try {
        final s = await Socket.connect(
          InternetAddress(path, type: InternetAddressType.unix),
          0,
          timeout: const Duration(seconds: 3),
        );
        return _SocketConnection(s);
      } catch (e) {
        last = e;
      }
    }
    throw last ?? FileSystemException('not found', name);
  }

  /// Completes once the bytes are handed to the system.
  Future<void> write(Uint8List bytes);

  /// The next chunk received; null once the other side has closed.
  Future<Uint8List?> read();

  void close();
}

/// Queues reads and writes: each starts after the previous one finishes.
mixin _Queue {
  Future<void> _tail = Future.value();
  Future<T> _then<T>(Future<T> Function() f) {
    final r = _tail.then((_) => f());
    _tail = r.then((_) {}, onError: (_) {});
    return r;
  }
}

class _SocketConnection with _Queue implements IpcConnection {
  _SocketConnection(this._s) {
    _s.listen(
      (d) => _waiting.isNotEmpty
          ? _waiting.removeFirst().complete(d)
          : _got.add(d),
      onDone: _end,
      onError: (_) => _end(),
      cancelOnError: true,
    );
  }

  final Socket _s;
  final _got = Queue<Uint8List>();
  final _waiting = Queue<Completer<Uint8List?>>();
  bool _done = false;

  void _end() {
    _done = true;
    while (_waiting.isNotEmpty) {
      _waiting.removeFirst().complete(null);
    }
  }

  @override
  Future<void> write(Uint8List bytes) => _then(() async {
    if (_done) throw const SocketException('ipc closed');
    _s.add(bytes);
    await _s.flush();
  });

  @override
  Future<Uint8List?> read() => _then(() {
    if (_got.isNotEmpty) return Future.value(_got.removeFirst());
    if (_done) return Future.value(null);
    final c = Completer<Uint8List?>();
    _waiting.add(c);
    return c.future;
  });

  @override
  void close() {
    _s.destroy();
    _end();
  }
}

// ── Windows named pipes (kernel32) ──

typedef _CreateFileC = IntPtr Function(
  Pointer<Utf16>,
  Uint32,
  Uint32,
  Pointer<Void>,
  Uint32,
  Uint32,
  IntPtr,
);
typedef _CreateFileD = int Function(
  Pointer<Utf16>,
  int,
  int,
  Pointer<Void>,
  int,
  int,
  int,
);
typedef _RwC = Int32 Function(
  IntPtr,
  Pointer<Uint8>,
  Uint32,
  Pointer<Uint32>,
  Pointer<Void>,
);
typedef _RwD = int Function(
  int,
  Pointer<Uint8>,
  int,
  Pointer<Uint32>,
  Pointer<Void>,
);
typedef _HandleC = Int32 Function(IntPtr);
typedef _HandleD = int Function(int);
typedef _CancelC = Int32 Function(IntPtr, Pointer<Void>);
typedef _CancelD = int Function(int, Pointer<Void>);

class _K32 {
  _K32() : _lib = DynamicLibrary.open('kernel32.dll');
  final DynamicLibrary _lib;
  late final createFile = _lib.lookupFunction<_CreateFileC, _CreateFileD>(
    'CreateFileW',
  );
  late final readFile = _lib.lookupFunction<_RwC, _RwD>('ReadFile');
  late final writeFile = _lib.lookupFunction<_RwC, _RwD>('WriteFile');
  late final closeHandle = _lib.lookupFunction<_HandleC, _HandleD>(
    'CloseHandle',
  );
  late final cancelIo = _lib.lookupFunction<_CancelC, _CancelD>('CancelIoEx');
}

const _genericRead = 0x80000000, _genericWrite = 0x40000000;
const _openExisting = 3, _invalidHandle = -1;

/// Runs in another isolate: ReadFile blocks until data arrives.
Uint8List? _pipeRead(int h) {
  final k = _K32();
  const n = 64 * 1024;
  final buf = calloc<Uint8>(n), got = calloc<Uint32>();
  try {
    if (k.readFile(h, buf, n, got, nullptr) == 0 || got.value == 0) return null;
    return Uint8List.fromList(buf.asTypedList(got.value));
  } finally {
    calloc.free(buf);
    calloc.free(got);
  }
}

bool _pipeWrite((int, Uint8List) a) {
  final (h, bytes) = a;
  final k = _K32();
  final buf = calloc<Uint8>(bytes.length), put = calloc<Uint32>();
  try {
    buf.asTypedList(bytes.length).setAll(0, bytes);
    return k.writeFile(h, buf, bytes.length, put, nullptr) != 0 &&
        put.value == bytes.length;
  } finally {
    calloc.free(buf);
    calloc.free(put);
  }
}

class _PipeConnection with _Queue implements IpcConnection {
  _PipeConnection(this._h);
  int? _h;

  static Future<IpcConnection> open(String name) async {
    final path = '\\\\.\\pipe\\$name'.toNativeUtf16();
    try {
      final h = _K32().createFile(
        path,
        _genericRead | _genericWrite,
        0,
        nullptr,
        _openExisting,
        0,
        0,
      );
      if (h == _invalidHandle || h == 0) {
        throw FileSystemException('cannot open pipe', name);
      }
      return _PipeConnection(h);
    } finally {
      calloc.free(path);
    }
  }

  @override
  Future<void> write(Uint8List bytes) => _then(() async {
    final h = _h;
    if (h == null || !await Isolate.run(() => _pipeWrite((h, bytes)))) {
      throw const FileSystemException('ipc write failed');
    }
  });

  @override
  Future<Uint8List?> read() => _then(() async {
    final h = _h;
    if (h == null) return null;
    final d = await Isolate.run(() => _pipeRead(h));
    if (d == null) close();
    return d;
  });

  @override
  void close() {
    final h = _h;
    if (h == null) return;
    _h = null;
    final k = _K32();
    k.cancelIo(h, nullptr);
    k.closeHandle(h);
  }
}
