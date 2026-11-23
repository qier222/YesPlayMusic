// 匿名使用统计（Google Analytics 4 Measurement Protocol）。
//
// 事件先排队，攒 30 秒一起发。启动后和之后每天发一次：
// - app_active：应用版本、操作系统、系统语言、自动检查更新开关（数活跃用户）
// - [snapshot] 给的设置偏好和装了哪些插件
// 用的时候 AppState 还会报 page_open（打开了哪个页面，不带 id）、play（在哪个源播放）、
// 插件的安装 / 启用 / 停用 / 卸载。不含歌曲、账号、搜索词、文件路径。
// 设置 → 关于 里可以关。只有 release 构建、并且填了下面的 ID 才会发，调试和
// 跑测试时不发。

import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math' show Random;

import 'package:flutter/foundation.dart';
import 'package:path/path.dart' as p;

import 'state.dart';
import 'updater.dart';
import 'version.dart';

// GA4 数据流的衡量 ID（G-XXXXXXXXXX）和 Measurement Protocol API 密钥
const _measurementId = 'G-QY9X326Z43';
const _apiSecret = 'VzrXdPVbQMOyAPoiqrIZCw';

/// 事件名和参数。
typedef AnalyticsEvent = (String, Map<String, Object>);

class Analytics extends ChangeNotifier {
  Analytics._();
  static final instance = Analytics._();

  /// 发送匿名统计（设置里可以关）。
  bool enabled = true;

  String _clientId = '';
  Timer? _timer, _flushTimer;
  List<AnalyticsEvent> Function()? _snapshot;
  final _queue = <Map<String, Object>>[];

  // 每次启动算一个会话
  final _sessionId = DateTime.now().millisecondsSinceEpoch ~/ 1000;

  static String get _file => p.join(AppState.supportDir(), 'analytics.json');

  bool get _active =>
      enabled &&
      kReleaseMode &&
      _measurementId.isNotEmpty &&
      _apiSecret.isNotEmpty;

  /// [snapshot] 每天发一次的额外事件（设置、插件列表）。
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
      // 和网页版 GA 一样的格式：随机数.首次运行时间
      _clientId = '${Random.secure().nextInt(1 << 31)}.$_sessionId';
      await _save();
    }
    _schedule();
  }

  void _schedule() {
    _timer?.cancel();
    if (!_active) return;
    // 等插件加载完再发，插件列表才是全的
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

  /// 记一个事件；参数值只能是字符串或数字，字符串超过 100 字会被截断。
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
        // 报告里要算作活跃用户，这两个参数必须有
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
    // 一次请求最多 25 个事件
    while (_queue.isNotEmpty) {
      final batch = _queue.take(25).toList();
      _queue.removeRange(0, batch.length);
      await _post(batch);
    }
  }

  // HttpClient 走 main.dart 里设好的系统代理
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
