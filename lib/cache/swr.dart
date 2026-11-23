// SWR cache: serve what's cached (even stale), refetch in the background when stale, swap in the new data.
//
// Stores the raw JSON from plugins: plugins return JSON and every model has fromJson, so no model
// needs a toJson. Decoded models are kept in memory; the same data is decoded only once.
//
// One file per key on disk: <dir>/<namespace>/<hash of key>.json, containing
// {v, key, at, data}. The namespace is the part of the key before the first / ("source@account"),
// so switching accounts switches directories and the old account's cache stays. Writes go to a temp file then rename;
// when the total size exceeds the cap the least recently used are deleted (reads touch the file time).

import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:crypto/crypto.dart';
import 'package:flutter/foundation.dart';
import 'package:path/path.dart' as p;

/// Freshness for one kind of data.
class CachePolicy {
  const CachePolicy({
    required this.fresh,
    required this.maxAge,
    this.persist = true,
  });

  /// Used as-is within this long after fetching, no refetch.
  final Duration fresh;

  /// Older than this counts as missing (not shown, wait for new data).
  final Duration maxAge;

  /// Whether to store on disk.
  final bool persist;
}

/// One entry in the cache.
class CacheEntry {
  CacheEntry(this.data, this.at);

  /// Raw JSON returned by the plugin.
  final Object? data;

  /// When it was fetched.
  final DateTime at;

  Object? _value;
  Object? _decoder;

  /// Decodes into a model with [decode]; each decode runs only once.
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

  /// Cache format version: bump when the on-disk format changes; old files become invalid.
  final int version;
  final DateTime Function() _now;

  final Map<String, CacheEntry> _mem = {};
  final Map<String, Future<Object?>> _inflight = {};

  /// A key changed (fetched, modified or deleted).
  final _changes = StreamController<String>.broadcast(sync: true);
  Stream<String> get changes => _changes.stream;

  /// Keys whose background refetch failed: when to retry next and how many times in a row it failed.
  final Map<String, (DateTime, int)> _backoff = {};

  // ── Read ──

  /// What's there now (reads disk synchronously if not in memory); anything older than maxAge doesn't count.
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

  /// Like [peek], but also reads large files on disk (async, doesn't block the UI).
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

  /// [key] is not fresh (missing, or past fresh).
  bool isStale(String key, CachePolicy policy) {
    final e = peek(key, policy);
    return e == null || _now().difference(e.at) >= policy.fresh;
  }

  // ── Fetch ──

  /// Fetches new data: if the same key is already being fetched, waits for that one. Stores the result (and writes to disk if needed).
  Future<Object?> fetch(
    String key,
    CachePolicy policy,
    Future<Object?> Function() load,
  ) {
    final going = _inflight[key];
    if (going != null) return going;
    late final Future<Object?> f;
    // Still the request registered for this key: if it was invalidated / cleared meanwhile, discard the result
    bool current() => identical(_inflight[key], f);
    f = () async {
      await null; // register first, then start
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

  /// Refetches in the background when stale (doesn't throw: the old data still works). Returns whether a request was sent.
  /// Keys that just failed wait before retrying, with growing intervals up to 5 minutes.
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

  // ── Write ──

  void _put(String key, Object? data, CachePolicy policy) {
    _mem[key] = CacheEntry(data, _now());
    if (policy.persist) _writeDisk(key, _mem[key]!);
    _changes.add(key);
  }

  /// Stores data directly (data assembled by the caller, e.g. a whole list after fetching all pages).
  void put(String key, CachePolicy policy, Object? data) {
    _inflight.remove(key);
    _backoff.remove(key);
    _put(key, data, policy);
  }

  /// Changes cached content directly (optimistic update). [update] gets the old raw JSON and returns the new one;
  /// does nothing when the entry is missing. The time stays: it will still be refetched when due. Returns the previous value,
  /// to put back with [restore] on error.
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

  /// Puts back the content from before [mutate].
  void restore(String key, CachePolicy policy, Object? raw) =>
      mutate(key, policy, (_) => raw);

  /// Deletes all keys starting with [prefix] (memory and disk), and drops fetches in progress too.
  void invalidate(String prefix) {
    _inflight.removeWhere((k, _) => k.startsWith(prefix));
    _backoff.removeWhere((k, _) => k.startsWith(prefix));
    final gone = _mem.keys.where((k) => k.startsWith(prefix)).toList();
    for (final k in gone) {
      _mem.remove(k);
      _deleteDisk(k);
    }
    // On-disk entries never read into memory: delete the directory when removing a whole namespace; otherwise check each key
    _deletePrefixOnDisk(prefix);
    for (final k in gone) {
      _changes.add(k);
    }
  }

  /// Clears everything.
  Future<void> clear() async {
    _inflight.clear();
    _backoff.clear();
    final keys = _mem.keys.toList();
    _mem.clear();
    // Wait for queued disk writes to finish before deleting, or they'd bring the old data back.
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

  // ── Disk ──

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

  /// Files of 1 MB or more aren't read synchronously (would drop a frame); pages fetch them themselves.
  static const _syncLimit = 1 << 20;

  CacheEntry? _readDisk(String key) {
    final f = File(_path(key));
    try {
      if (!f.existsSync() || f.lengthSync() > _syncLimit) return null;
      final j = jsonDecode(f.readAsStringSync());
      if (j is! Map || j['v'] != version || j['key'] != key) return null;
      // Touch the file time on read: cleanup uses it to find the least recently used
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

  /// Writes in progress: a later write to the same file waits for the earlier one, so old data never overwrites new.
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

  /// Deletion queues behind writes in progress for this file, or the write would bring the old data back.
  void _deleteDisk(String key) {
    final path = _path(key);
    final prev = _writing[path] ?? Future.value();
    prev.then((_) => File(path).delete()).then((_) {}, onError: (_) {});
  }

  /// Waits for all queued disk writes to finish (errors count as finished).
  Future<void> _settleWrites() async {
    final pending = _writing.values.toList();
    if (pending.isEmpty) return;
    await Future.wait(pending.map((w) => w.catchError((Object _) {})));
  }

  /// [prefix] is "source@" (all accounts), "source@account/" (a whole namespace) or a finer
  /// prefix. The first two delete the directory; the last has to open files to check the key.
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

  /// Bytes in use (scans the directory).
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

  /// Over the cap, deletes the least recently used down to 90% of the cap.
  Future<void> trim() async {
    if (_trimming) return;
    _trimming = true;
    try {
      final total = _bytes ?? await size();
      if (total <= maxBytes) return;
      // The tally only grows (deleting files doesn't subtract), so when over the cap recheck against actual usage,
      // or caches still under the cap would be deleted too.
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
          // Being written, try next time
        }
      }
      _bytes = n;
    } catch (e) {
      debugPrint('swr trim: $e');
    } finally {
      _trimming = false;
    }
  }

  /// For tests: waits for all disk writes to finish.
  @visibleForTesting
  Future<void> flush() async {
    while (_writing.isNotEmpty) {
      await Future.wait(_writing.values.toList());
    }
  }

  /// For tests: clears memory only, simulating a restart.
  @visibleForTesting
  void dropMemory() => _mem.clear();

  void dispose() {
    _trimTimer?.cancel();
    _changes.close();
  }
}
