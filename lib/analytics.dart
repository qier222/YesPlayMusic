// Anonymous usage stats (Google Analytics 4 /g/collect endpoint).
//
// Events are queued and sent together every 30 seconds (and flushed on app exit).
// Sent at launch and once a day after:
// - app_active: app version, OS, OS major version, CPU arch, display scale, window size bucket,
//   system language, auto-update setting (counts active users)
// - preferences and installed plugins from [snapshot]
// While in use, AppState and McpServer also report page_open (which page, no ids), play (which source),
// plugin install / enable / disable / uninstall, and MCP session / tool usage. No songs, accounts,
// search terms or file paths.
// Can be turned off in Settings → About. Only sent from release builds with the ID below set;
// never sent from debug builds or tests.

import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math' show Random;

import 'package:flutter/foundation.dart';
import 'package:path/path.dart' as p;

import 'state.dart';
import 'updater.dart';
import 'version.dart';

// GA4 data stream measurement ID (G-XXXXXXXXXX)
const _measurementId = 'G-QY9X326Z43';

/// Event name and parameters.
typedef AnalyticsEvent = (String, Map<String, Object>);

class Analytics extends ChangeNotifier {
  Analytics._();
  static final instance = Analytics._();

  /// Idle duration after which a new GA4 session starts.
  static const sessionTimeout = Duration(minutes: 30);

  /// Sends anonymous stats (can be turned off in Settings).
  bool enabled = true;

  String _clientId = '';
  bool _firstVisit = false;
  int _sessionCount = 0;
  int _hitCount = 0;
  Timer? _timer, _flushTimer;
  List<AnalyticsEvent> Function()? _snapshot;
  final _queue = <AnalyticsEvent>[];

  // Rotated when the app stays open across days or is idle past [sessionTimeout]
  int _sessionId = DateTime.now().millisecondsSinceEpoch ~/ 1000;
  DateTime _lastActivity = DateTime.now();

  static String get _file => p.join(AppState.supportDir(), 'analytics.json');

  bool get _active => enabled && kReleaseMode && _measurementId.isNotEmpty;

  /// [snapshot] extra events sent once a day (settings, plugin list).
  Future<void> start({List<AnalyticsEvent> Function()? snapshot}) async {
    _snapshot = snapshot;
    try {
      final j = jsonDecode(await File(_file).readAsString());
      if (j is Map) {
        if (j['enabled'] is bool) enabled = j['enabled'] as bool;
        _clientId = '${j['clientId'] ?? ''}';
        if (j['sessionCount'] is int) _sessionCount = j['sessionCount'] as int;
      }
    } catch (_) {}
    final now = DateTime.now();
    _sessionId = now.millisecondsSinceEpoch ~/ 1000;
    _lastActivity = now;
    if (_clientId.isEmpty) {
      // Same format as GA on the web: random number.first run time
      _clientId = '${Random.secure().nextInt(1 << 31)}.$_sessionId';
      _firstVisit = true;
    }
    _sessionCount++;
    await _save();
    _schedule();
  }

  void _schedule() {
    _timer?.cancel();
    if (!_active) return;
    // Wait for plugins to load so the plugin list is complete
    _timer = Timer(const Duration(seconds: 30), () {
      _daily();
      _timer = Timer.periodic(const Duration(days: 1), (_) => _daily());
    });
  }

  void _daily() {
    final display = _displayMetrics();
    event('app_active', {
      'app_version': appVersion,
      'os': Platform.operatingSystem,
      'os_version': normalizeOsVersion(
        Platform.operatingSystem,
        Platform.operatingSystemVersion,
      ),
      'arch': parseArch(Platform.version),
      'system_locale': Platform.localeName,
      'auto_check_update': '${Updater.instance.autoCheck}',
      if (display.scale != null) 'display_scale': display.scale!,
      if (display.windowBucket != null) 'window_size': display.windowBucket!,
    });
    for (final (name, params)
        in _snapshot?.call() ?? const <AnalyticsEvent>[]) {
      event(name, params);
    }
  }

  /// Records an event; parameter values must be strings or numbers, strings over 100 chars are truncated.
  void event(String name, [Map<String, Object> params = const {}]) {
    if (!_active) return;
    _rotateSessionIfNeeded();
    _queue.add((name, params));
    _flushTimer ??= Timer(const Duration(seconds: 30), _flush);
  }

  /// Sends any queued events immediately (e.g. before app exit).
  Future<void> flush({Duration? timeout}) async {
    _flushTimer?.cancel();
    _flushTimer = null;
    if (_queue.isEmpty) return;
    final work = _flush();
    if (timeout == null) {
      await work;
      return;
    }
    try {
      await work.timeout(timeout);
    } catch (_) {}
  }

  Future<void> setEnabled(bool on) async {
    enabled = on;
    notifyListeners();
    if (!on) _queue.clear();
    await _save();
    _schedule();
  }

  void _rotateSessionIfNeeded() {
    final now = DateTime.now();
    if (shouldRotateSession(_lastActivity, now)) {
      _sessionId = now.millisecondsSinceEpoch ~/ 1000;
      _sessionCount++;
      _hitCount = 0;
      _save().ignore();
    }
    _lastActivity = now;
  }

  Future<void> _save() async {
    try {
      final f = File(_file);
      await f.parent.create(recursive: true);
      await f.writeAsString(
        jsonEncode({
          'enabled': enabled,
          'clientId': _clientId,
          'sessionCount': _sessionCount,
        }),
      );
    } catch (_) {}
  }

  Future<void> _flush() async {
    _flushTimer = null;
    if (!_active || _clientId.isEmpty) return _queue.clear();
    // Keep batches well under /g/collect's ~16 KB payload limit
    while (_queue.isNotEmpty) {
      final batch = _queue.take(20).toList();
      _queue.removeRange(0, batch.length);
      await _post(batch);
    }
  }

  /// Whether a new GA4 session should start (idle past [sessionTimeout] or crossed local midnight).
  @visibleForTesting
  static bool shouldRotateSession(DateTime lastActivity, DateTime now) {
    if (now.isBefore(lastActivity)) return false;
    if (now.difference(lastActivity) >= sessionTimeout) return true;
    return now.year != lastActivity.year ||
        now.month != lastActivity.month ||
        now.day != lastActivity.day;
  }

  /// Extracts CPU architecture from [Platform.version] (e.g. `... on "macos_arm64"` → `arm64`).
  @visibleForTesting
  static String parseArch(String platformVersion) {
    final m = RegExp(r'on "[^"_]+_([^"]+)"').firstMatch(platformVersion);
    return m?.group(1)?.toLowerCase() ?? 'unknown';
  }

  /// Normalizes [Platform.operatingSystemVersion] into a coarse OS major version (e.g. `macos 15`, `windows 11`, `linux 6.8`).
  @visibleForTesting
  static String normalizeOsVersion(String os, String rawVersion) {
    final lowerOs = os.toLowerCase();
    switch (lowerOs) {
      case 'macos':
        final m = RegExp(r'Version\s+(\d+)').firstMatch(rawVersion);
        return m != null ? 'macos ${m.group(1)}' : 'macos';
      case 'windows':
        final build = RegExp(r'Build\s+(\d+)').firstMatch(rawVersion);
        if (build != null) {
          final n = int.tryParse(build.group(1)!) ?? 0;
          if (n >= 22000) return 'windows 11';
          if (n >= 10240) return 'windows 10';
        }
        final ver = RegExp(r'\b(\d+\.\d+)\b').firstMatch(rawVersion);
        if (ver != null) {
          return ver.group(1) == '10.0'
              ? 'windows 10'
              : 'windows ${ver.group(1)}';
        }
        return 'windows';
      case 'linux':
        final m = RegExp(r'Linux\s+(\d+\.\d+)').firstMatch(rawVersion);
        return m != null ? 'linux ${m.group(1)}' : 'linux';
      default:
        return lowerOs.isEmpty ? 'unknown' : lowerOs;
    }
  }

  /// Formats device pixel ratio into a concise label (e.g. `2.0` → `2x`, `1.25` → `1.25x`).
  @visibleForTesting
  static String formatDisplayScale(double dpr) {
    if (dpr <= 0) return '1x';
    final rounded = (dpr * 100).round() / 100;
    final text = rounded == rounded.roundToDouble()
        ? '${rounded.round()}'
        : rounded.toString().replaceFirst(RegExp(r'0+$'), '');
    return '${text}x';
  }

  /// Buckets logical window width for layout analytics.
  @visibleForTesting
  static String windowSizeBucket(double logicalWidth) {
    if (logicalWidth < 1000) return 'compact';
    if (logicalWidth < 1400) return 'medium';
    return 'wide';
  }

  /// Buckets local library track count without sending exact numbers.
  static String librarySizeBucket(int trackCount) {
    if (trackCount <= 0) return '0';
    if (trackCount <= 100) return '1-100';
    if (trackCount <= 1000) return '101-1000';
    return '1000+';
  }

  static ({String? sr, String? scale, String? windowBucket}) _displayMetrics() {
    try {
      final view = PlatformDispatcher.instance.views.firstOrNull;
      if (view == null) return (sr: null, scale: null, windowBucket: null);
      final dpr = view.devicePixelRatio;
      final display = view.display;
      final displayDpr = display.devicePixelRatio > 0
          ? display.devicePixelRatio
          : dpr;
      String? sr;
      if (displayDpr > 0 && display.size.width > 0 && display.size.height > 0) {
        final w = (display.size.width / displayDpr).round();
        final h = (display.size.height / displayDpr).round();
        if (w > 0 && h > 0) sr = '${w}x$h';
      }
      String? windowBucket;
      if (dpr > 0 && view.physicalSize.width > 0) {
        windowBucket = windowSizeBucket(view.physicalSize.width / dpr);
      }
      return (
        sr: sr,
        scale: dpr > 0 ? formatDisplayScale(dpr) : null,
        windowBucket: windowBucket,
      );
    } catch (_) {
      return (sr: null, scale: null, windowBucket: null);
    }
  }

  /// Normalizes OS locale strings like `zh_CN.UTF-8` or `en_US` into GA4's `ul` format (`zh-cn`, `en-us`).
  @visibleForTesting
  static String normalizeLocale(String locale) {
    final base = locale.split('.').first.split('@').first.trim();
    return base.replaceAll('_', '-').toLowerCase();
  }

  /// Builds the shared `/g/collect` URL for a batch of events.
  @visibleForTesting
  static Uri buildCollectUri({
    required String measurementId,
    required String clientId,
    required int sessionId,
    required int sessionCount,
    required int hitCount,
    required bool firstVisit,
    required String locale,
    String? screenResolution,
  }) {
    final ul = normalizeLocale(locale);
    return Uri.https('www.google-analytics.com', '/g/collect', {
      'v': '2',
      'tid': measurementId,
      'cid': clientId,
      'sid': '$sessionId',
      'sct': '$sessionCount',
      'seg': '1',
      '_s': '$hitCount',
      if (hitCount == 1) '_ss': '1',
      if (firstVisit && hitCount == 1) '_fv': '1',
      if (ul.isNotEmpty) 'ul': ul,
      if (screenResolution != null && screenResolution.isNotEmpty)
        'sr': screenResolution,
      'dl': 'https://app.yesplaymusic/',
      'dt': 'YesPlayMusic',
    });
  }

  /// Encodes events as newline-separated form lines for `/g/collect` POST body.
  @visibleForTesting
  static String encodeEvents(List<AnalyticsEvent> events) {
    return events
        .map((ev) {
          final (name, params) = ev;
          final query = <String, String>{
            'en': name,
            '_et': '100',
            for (final e in params.entries)
              if (e.value is num)
                'epn.${e.key}': '${e.value}'
              else
                'ep.${e.key}': switch ('${e.value}') {
                  final s when s.length > 100 => s.substring(0, 100),
                  final s => s,
                },
          };
          return Uri(queryParameters: query).query;
        })
        .join('\n');
  }

  /// Browser-like User-Agent matching the host OS so GA4 accepts the hit and populates OS dimensions.
  static String _userAgent() => switch (Platform.operatingSystem) {
    'macos' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'windows' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    _ => 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  };

  // HttpClient uses the system proxy set up in main.dart
  Future<void> _post(List<AnalyticsEvent> events) async {
    final http = HttpClient()
      ..connectionTimeout = const Duration(seconds: 15)
      ..userAgent = _userAgent();
    try {
      final hit = ++_hitCount;
      final isFirstVisitHit = _firstVisit && hit == 1;
      if (isFirstVisitHit) _firstVisit = false;
      final req = await http.postUrl(
        buildCollectUri(
          measurementId: _measurementId,
          clientId: _clientId,
          sessionId: _sessionId,
          sessionCount: _sessionCount,
          hitCount: hit,
          firstVisit: isFirstVisitHit,
          locale: Platform.localeName,
          screenResolution: _displayMetrics().sr,
        ),
      );
      req.headers.contentType = ContentType('text', 'plain', charset: 'utf-8');
      req.write(encodeEvents(events));
      final res = await req.close().timeout(const Duration(seconds: 30));
      await res.drain<void>();
    } catch (e) {
      debugPrint('analytics: $e');
    } finally {
      http.close(force: true);
    }
  }
}
