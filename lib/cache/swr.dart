// SWR 缓存：先给缓存里的内容（旧的也给），旧了就在后台取新的，取到再换上。
//
// 存的是插件返回的原始 JSON：插件给的就是 JSON，模型都有 fromJson，不用给
// 每个模型写 toJson。转好的模型记在内存里，同一份数据只转一次。
//
// 磁盘上一个 key 一个文件：<dir>/<命名空间>/<key 的哈希>.json，内容是
// {v, key, at, data}。命名空间是 key 第一个 / 之前的部分（「源@账号」），
// 换账号就是换目录，旧账号的缓存留着。写盘先写临时文件再改名；总大小超过
// 上限时删最久没用过的（读到时会更新文件时间）。

import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:crypto/crypto.dart';
import 'package:flutter/foundation.dart';
import 'package:path/path.dart' as p;

/// 一种数据的新鲜度。
class CachePolicy {
  const CachePolicy({
    required this.fresh,
    required this.maxAge,
    this.persist = true,
  });

  /// 取到后这么久之内直接用，不重取。
  final Duration fresh;

  /// 超过这么久的当作没有（不显示，等新的）。
  final Duration maxAge;

  /// 存不存盘。
  final bool persist;
}

/// 缓存里的一条。
class CacheEntry {
  CacheEntry(this.data, this.at);

  /// 插件返回的原始 JSON。
  final Object? data;

  /// 取到的时间。
  final DateTime at;

  Object? _value;
  Object? _decoder;

  /// 用 [decode] 转成模型；同一个 decode 只转一次。
  T value<T>(T Function(Object? raw) decode) {
    if (!identical(_decoder, decode)) {
      _value = decode(data);
      _decoder = decode;
    }
    return _value as T;
  }
}

class SwrStore {
  SwrStore({
    required this.dir,
    this.maxBytes = 200 << 20,
    this.version = 1,
    DateTime Function()? now,
  }) : _now = now ?? DateTime.now;

  final String dir;
  final int maxBytes;

  /// 缓存格式版本：改了存盘格式就加一，旧文件作废。
  final int version;
  final DateTime Function() _now;

  final Map<String, CacheEntry> _mem = {};
  final Map<String, Future<Object?>> _inflight = {};

  /// 某个 key 变了（取到新的、改了、删了）。
  final _changes = StreamController<String>.broadcast(sync: true);
  Stream<String> get changes => _changes.stream;

  /// 后台重取失败的 key：下次什么时候再试、已经连续失败几次。
  final Map<String, (DateTime, int)> _backoff = {};

  // ── 读 ──

  /// 现在有的（内存没有就同步读盘），超过 maxAge 的不算。
  CacheEntry? peek(String key, CachePolicy policy) {
    var e = _mem[key];
    if (e == null && policy.persist) {
      e = _readDisk(key);
      if (e != null) _mem[key] = e;
    }
    if (e == null) return null;
    if (_now().difference(e.at) > policy.maxAge) return null;
    return e;
  }

  /// 和 [peek] 一样，但磁盘上的大文件也读（异步，不卡界面）。
  Future<CacheEntry?> read(String key, CachePolicy policy) async {
    var e = peek(key, policy);
    if (e == null && policy.persist && !_mem.containsKey(key)) {
      e = await _readDiskAsync(key);
      if (e != null && !_mem.containsKey(key)) _mem[key] = e;
      e = _mem[key];
      if (e != null && _now().difference(e.at) > policy.maxAge) return null;
    }
    return e;
  }

  /// [key] 不在新鲜期内（没有，或者过了 fresh）。
  bool isStale(String key, CachePolicy policy) {
    final e = peek(key, policy);
    return e == null || _now().difference(e.at) >= policy.fresh;
  }

  // ── 取 ──

  /// 取新的：同一个 key 正在取就等那一个。取到存进缓存（要存盘就写盘）。
  Future<Object?> fetch(
    String key,
    CachePolicy policy,
    Future<Object?> Function() load,
  ) {
    final going = _inflight[key];
    if (going != null) return going;
    late final Future<Object?> f;
    // 还是这个 key 登记着的请求：中途被 invalidate / clear 掉的，结果不要
    bool current() => identical(_inflight[key], f);
    f = () async {
      await null; // 先登记再开始
      try {
        final data = await load();
        if (current()) {
          _backoff.remove(key);
          _put(key, data, policy);
        }
        return data;
      } catch (_) {
        if (current()) {
          final n = (_backoff[key]?.$2 ?? 0) + 1;
          final wait = Duration(seconds: 5 << (n - 1).clamp(0, 6));
          _backoff[key] = (
            _now().add(wait > _maxBackoff ? _maxBackoff : wait),
            n,
          );
        }
        rethrow;
      } finally {
        if (current()) _inflight.remove(key);
      }
    }();
    _inflight[key] = f;
    return f;
  }

  static const _maxBackoff = Duration(minutes: 5);

  /// 旧了就在后台重取（出错不抛：旧的照样能用）。返回有没有发请求。
  /// 刚失败过的 key 等一会儿再试，间隔越来越长，最长 5 分钟。
  bool revalidate(
    String key,
    CachePolicy policy,
    Future<Object?> Function() load,
  ) {
    if (_inflight.containsKey(key)) return true;
    if (!isStale(key, policy)) return false;
    final b = _backoff[key];
    if (b != null && _now().isBefore(b.$1)) return false;
    fetch(key, policy, load).ignore();
    return true;
  }

  // ── 写 ──

  void _put(String key, Object? data, CachePolicy policy) {
    _mem[key] = CacheEntry(data, _now());
    if (policy.persist) _writeDisk(key, _mem[key]!);
    _changes.add(key);
  }

  /// 直接存一份（自己拼好的数据，比如分页取完的整个列表）。
  void put(String key, CachePolicy policy, Object? data) {
    _inflight.remove(key);
    _backoff.remove(key);
    _put(key, data, policy);
  }

  /// 直接改缓存里的内容（乐观更新）。[update] 拿到旧的原始 JSON，返回新的；
  /// 没有这条时不改。时间不变：该重取还是会重取。返回改之前的，出错时
  /// 用 [restore] 放回去。
  Object? mutate(
    String key,
    CachePolicy policy,
    Object? Function(Object? raw) update,
  ) {
    final old = peek(key, policy);
    if (old == null) return null;
    final e = CacheEntry(update(old.data), old.at);
    _mem[key] = e;
    if (policy.persist) _writeDisk(key, e);
    _changes.add(key);
    return old.data;
  }

  /// 把 [mutate] 之前的内容放回去。
  void restore(String key, CachePolicy policy, Object? raw) =>
      mutate(key, policy, (_) => raw);

  /// 删掉 [prefix] 开头的所有 key（内存和磁盘），正在取的也不要了。
  void invalidate(String prefix) {
    _inflight.removeWhere((k, _) => k.startsWith(prefix));
    _backoff.removeWhere((k, _) => k.startsWith(prefix));
    final gone = _mem.keys.where((k) => k.startsWith(prefix)).toList();
    for (final k in gone) {
      _mem.remove(k);
      _deleteDisk(k);
    }
    // 磁盘上内存里没读过的：整个命名空间都删时删目录；否则逐个看 key
    _deletePrefixOnDisk(prefix);
    for (final k in gone) {
      _changes.add(k);
    }
  }

  /// 清空全部。
  Future<void> clear() async {
    _inflight.clear();
    _backoff.clear();
    final keys = _mem.keys.toList();
    _mem.clear();
    // 等已经排队的写盘完成再删，否则写完会把旧数据带回来。
    await _settleWrites();
    try {
      final d = Directory(dir);
      if (await d.exists()) await d.delete(recursive: true);
    } on FileSystemException catch (e) {
      debugPrint('swr clear: $e');
    }
    _bytes = 0;
    for (final k in keys) {
      _changes.add(k);
    }
  }

  // ── 磁盘 ──

  static String _ns(String key) {
    final i = key.indexOf('/');
    final ns = i < 0 ? '_' : key.substring(0, i);
    return ns.replaceAll(RegExp(r'[^\w@.\-]'), '_');
  }

  String _path(String key) => p.join(
    dir,
    _ns(key),
    '${sha1.convert(utf8.encode(key)).toString().substring(0, 24)}.json',
  );

  /// 1 MB 以上的文件不同步读（会卡一帧），留给页面自己取。
  static const _syncLimit = 1 << 20;

  CacheEntry? _readDisk(String key) {
    final f = File(_path(key));
    try {
      if (!f.existsSync() || f.lengthSync() > _syncLimit) return null;
      final j = jsonDecode(f.readAsStringSync());
      if (j is! Map || j['v'] != version || j['key'] != key) return null;
      // 读到了就更新文件时间：清理时按它判断最久没用过的
      f.setLastModified(_now()).ignore();
      return CacheEntry(
        j['data'],
        DateTime.fromMillisecondsSinceEpoch(j['at'] as int),
      );
    } catch (_) {
      return null;
    }
  }

  Future<CacheEntry?> _readDiskAsync(String key) async {
    final f = File(_path(key));
    try {
      if (!await f.exists()) return null;
      final j = jsonDecode(await f.readAsString());
      if (j is! Map || j['v'] != version || j['key'] != key) return null;
      f.setLastModified(_now()).ignore();
      return CacheEntry(
        j['data'],
        DateTime.fromMillisecondsSinceEpoch(j['at'] as int),
      );
    } catch (_) {
      return null;
    }
  }

  /// 正在写的：同一个文件后写的等先写的写完，免得旧的覆盖新的。
  final Map<String, Future<void>> _writing = {};
  int? _bytes;
  bool _trimming = false;

  void _writeDisk(String key, CacheEntry e) {
    final path = _path(key);
    final text = jsonEncode({
      'v': version,
      'key': key,
      'at': e.at.millisecondsSinceEpoch,
      'data': e.data,
    });
    final prev = _writing[path] ?? Future.value();
    final w = prev.then((_) async {
      try {
        final f = File(path);
        await f.parent.create(recursive: true);
        final old = await f.exists() ? await f.length() : 0;
        final tmp = File('$path.tmp');
        await tmp.writeAsString(text, flush: true);
        await tmp.rename(path);
        if (_bytes != null) _bytes = _bytes! - old + utf8.encode(text).length;
      } on FileSystemException catch (err) {
        debugPrint('swr write: $err');
      }
    });
    _writing[path] = w;
    w.whenComplete(() {
      if (identical(_writing[path], w)) _writing.remove(path);
      _trimSoon();
    });
  }

  /// 删除排在这个文件正在进行的写入之后，不然写完会把旧数据带回来。
  void _deleteDisk(String key) {
    final path = _path(key);
    final prev = _writing[path] ?? Future.value();
    prev.then((_) => File(path).delete()).then((_) {}, onError: (_) {});
  }

  /// 等现在排队的写盘都完成（出错也算完成）。
  Future<void> _settleWrites() async {
    final pending = _writing.values.toList();
    if (pending.isEmpty) return;
    await Future.wait(pending.map((w) => w.catchError((Object _) {})));
  }

  /// [prefix] 是「源@」（所有账号）、「源@账号/」（整个命名空间）或者更细的
  /// 前缀。前两种直接删目录，最后一种要打开文件看 key。
  void _deletePrefixOnDisk(String prefix) {
    () async {
      await _settleWrites();
      final root = Directory(dir);
      if (!await root.exists()) return;
      final slash = prefix.indexOf('/');
      if (slash < 0) {
        final head = _ns('$prefix/');
        await for (final d in root.list()) {
          if (d is Directory && p.basename(d.path).startsWith(head)) {
            await d.delete(recursive: true);
          }
        }
        return;
      }
      final d = Directory(p.join(dir, _ns(prefix)));
      if (!await d.exists()) return;
      if (slash == prefix.length - 1) {
        await d.delete(recursive: true);
        return;
      }
      await for (final f in d.list()) {
        if (f is! File || !f.path.endsWith('.json')) continue;
        try {
          final j = jsonDecode(await f.readAsString());
          if (j is Map && '${j['key']}'.startsWith(prefix)) await f.delete();
        } catch (_) {}
      }
    }().catchError((Object e) => debugPrint('swr invalidate: $e'));
  }

  /// 已经占用的字节数（扫一遍目录）。
  Future<int> size() async {
    var n = 0;
    final d = Directory(dir);
    if (!await d.exists()) return 0;
    await for (final f in d.list(recursive: true)) {
      if (f is File) n += await f.length();
    }
    return _bytes = n;
  }

  Timer? _trimTimer;
  void _trimSoon() {
    _trimTimer?.cancel();
    _trimTimer = Timer(const Duration(seconds: 2), () => trim().ignore());
  }

  /// 超过上限时删最久没用过的，删到上限的九成。
  Future<void> trim() async {
    if (_trimming) return;
    _trimming = true;
    try {
      final total = _bytes ?? await size();
      if (total <= maxBytes) return;
      // 记账只增不减（删文件时不扣），所以超了要按实际占用再判断一次，
      // 否则会多删还在上限内的缓存。
      final files = <(File, DateTime, int)>[];
      var n = 0;
      await for (final f in Directory(dir).list(recursive: true)) {
        if (f is File) {
          final st = await f.stat();
          files.add((f, st.modified, st.size));
          n += st.size;
        }
      }
      _bytes = n;
      if (n <= maxBytes) return;
      files.sort((a, b) => a.$2.compareTo(b.$2));
      for (final (f, _, sz) in files) {
        if (n <= maxBytes * 0.9) break;
        try {
          await f.delete();
          n -= sz;
        } on FileSystemException {
          // 正在写，下次再说
        }
      }
      _bytes = n;
    } catch (e) {
      debugPrint('swr trim: $e');
    } finally {
      _trimming = false;
    }
  }

  /// 测试用：等所有写盘完成。
  @visibleForTesting
  Future<void> flush() async {
    while (_writing.isNotEmpty) {
      await Future.wait(_writing.values.toList());
    }
  }

  /// 测试用：只清内存，模拟重启。
  @visibleForTesting
  void dropMemory() => _mem.clear();

  void dispose() {
    _trimTimer?.cancel();
    _changes.close();
  }
}
