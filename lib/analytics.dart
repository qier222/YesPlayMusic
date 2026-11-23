// Anonymous usage stats (Google Analytics 4 Measurement Protocol).
//
// Events are queued and sent together every 30 seconds. Sent at launch and once a day after:
// - app_active: app version, OS, system language, auto-update setting (counts active users)
// - preferences and installed plugins from [snapshot]
// While in use, AppState also reports page_open (which page, no ids), play (which source),
// and plugin install / enable / disable / uninstall. No songs, accounts, search terms or file paths.
// Can be turned off in Settings → About. Only sent from release builds with the IDs below set;
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

// GA4 data stream measurement ID (G-XXXXXXXXXX) and Measurement Protocol API secret
const _measurementId = 'G-QY9X326Z43';
const _apiSecret = 'VzrXdPVbQMOyAPoiqrIZCw';

/// Event name and parameters.
typedef AnalyticsEvent = (String, Map<String, Object>);

class Analytics extends ChangeNotifier {
  Analytics._();
  static final instance = Analytics._();

  /// Sends anonymous stats (can be turned off in Settings).
  bool enabled = true;

  String _clientId = '';
  Timer? _timer, _flushTimer;
  List<AnalyticsEvent> Function()? _snapshot;
  final _queue = <Map<String, Object>>[];

  // Each launch counts as one session
  final _sessionId = DateTime.now().millisecondsSinceEpoch ~/ 1000;

  static String get _file => p.join(AppState.supportDir(), 'analytics.json');

  bool get _active =>
      enabled &&
      kReleaseMode &&
      _measurementId.isNotEmpty &&
      _apiSecret.isNotEmpty;

  /// [snapshot] extra events sent once a day (settings, plugin list).
  Future<void> start({List<AnalyticsEvent> Function()? snapshot}) async {
    _snapshot = snapshot;
    try {
      final j = jsonDecode(await File(_file).readAsString());
      if (j is Map) {
        if (j['enabled'] is bool) enabled = j['enabled'] as bool;
        _clientId = '${j['clientId'] ?? ''}';
      }
    } catch (_) {}
    if (_clientId.isEmpty) {
      // Same format as GA on the web: random number.first run time
      _clientId = '${Random.secure().nextInt(1 << 31)}.$_sessionId';
      await _save();
    }
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
    event('app_active', {
      'app_version': appVersion,
      'os': Platform.operatingSystem,
      'system_locale': Platform.localeName,
      'auto_check_update': '${Updater.instance.autoCheck}',
    });
    for (final (name, params)
        in _snapshot?.call() ?? const <AnalyticsEvent>[]) {
      event(name, params);
    }
  }

  /// Records an event; parameter values must be strings or numbers, strings over 100 chars are truncated.
  void event(String name, [Map<String, Object> params = const {}]) {
    if (!_active) return;
    _queue.add({
      'name': name,
      'params': {
        for (final e in params.entries)
          e.key: switch (e.value) {
            final String s when s.length > 100 => s.substring(0, 100),
            final v => v,
          },
        // Both parameters are required for the report to count an active user
        'session_id': '$_sessionId',
        'engagement_time_msec': 100,
      },
    });
    _flushTimer ??= Timer(const Duration(seconds: 30), _flush);
  }

  Future<void> setEnabled(bool on) async {
    enabled = on;
    notifyListeners();
    if (!on) _queue.clear();
    await _save();
    _schedule();
  }

  Future<void> _save() async {
    try {
      final f = File(_file);
      await f.parent.create(recursive: true);
      await f.writeAsString(
        jsonEncode({'enabled': enabled, 'clientId': _clientId}),
      );
    } catch (_) {}
  }

  Future<void> _flush() async {
    _flushTimer = null;
    if (!_active || _clientId.isEmpty) return _queue.clear();
    // At most 25 events per request
    while (_queue.isNotEmpty) {
      final batch = _queue.take(25).toList();
      _queue.removeRange(0, batch.length);
      await _post(batch);
    }
  }

  // HttpClient uses the system proxy set up in main.dart
  Future<void> _post(List<Map<String, Object>> events) async {
    final http = HttpClient()..connectionTimeout = const Duration(seconds: 15);
    try {
      final req = await http.postUrl(
        Uri.https('www.google-analytics.com', '/mp/collect', {
          'measurement_id': _measurementId,
          'api_secret': _apiSecret,
        }),
      );
      req.headers.contentType = ContentType.json;
      req.write(jsonEncode({'client_id': _clientId, 'events': events}));
      final res = await req.close().timeout(const Duration(seconds: 30));
      await res.drain<void>();
    } catch (e) {
      debugPrint('analytics: $e');
    } finally {
      http.close(force: true);
    }
  }
}
