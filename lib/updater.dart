// 检查更新。
//
// 正式发布的 macOS / Windows 版本（构建时带 --dart-define=YPM_SPARKLE=true）用
// Sparkle / WinSparkle：后台定期检查，在系统对话框里下载、校验签名、安装重启。
// 其他情况（Linux、自己编译的版本）查 GitHub 上的最新 Release，有新版本就在
// 设置 → 关于 里提示，点了打开下载页。

import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:auto_updater/auto_updater.dart';
import 'package:flutter/foundation.dart';
import 'package:path/path.dart' as p;

import 'l10n/l10n.dart';
import 'net/proxy.dart';
import 'state.dart';
import 'system.dart';
import 'version.dart';

const _repo = 'qier222/YesPlayMusic';
const _sparkle = bool.fromEnvironment('YPM_SPARKLE');

class Updater extends ChangeNotifier {
  Updater._();
  static final instance = Updater._();

  static const repoPage = 'https://github.com/$_repo';
  static const releasesPage = 'https://github.com/$_repo/releases';

  /// 用 Sparkle / WinSparkle 自动更新。
  bool get native => _sparkle && (Platform.isMacOS || Platform.isWindows);

  /// 自动检查更新（设置里可以关）。
  bool autoCheck = true;

  /// 查到的更新版本和下载页；没有更新为 null。
  String? latest;
  String? latestPage;
  bool checking = false;

  /// 上一次手动检查的结果，给设置页显示。
  String _statusKind = '';
  String _statusVer = '';

  String statusText(AppLocalizations l) => switch (_statusKind) {
    'checking' => l.aboutChecking,
    'new' => l.updaterNewVersion(_statusVer),
    'upToDate' => l.updaterUpToDate,
    'failed' => l.updaterCheckFailed,
    _ => '',
  };

  Timer? _timer;

  static String get _file => p.join(AppState.supportDir(), 'updater.json');

  Future<void> start() async {
    try {
      final j = jsonDecode(await File(_file).readAsString());
      if (j is Map && j['autoCheck'] is bool) {
        autoCheck = j['autoCheck'] as bool;
      }
    } catch (_) {}
    if (native) {
      final os = Platform.isMacOS ? 'macos' : 'windows';
      await autoUpdater.setFeedURL(
        'https://github.com/$_repo/releases/latest/download/appcast-$os.xml',
      );
      await autoUpdater.setScheduledCheckInterval(autoCheck ? 86400 : 0);
      if (autoCheck) await autoUpdater.checkForUpdates(inBackground: true);
      return;
    }
    _schedule();
  }

  void _schedule() {
    _timer?.cancel();
    if (!autoCheck) return;
    // 启动一会儿后查一次，之后每天一次
    _timer = Timer(const Duration(seconds: 30), () {
      check();
      _timer = Timer.periodic(const Duration(days: 1), (_) => check());
    });
  }

  Future<void> setAutoCheck(bool on) async {
    autoCheck = on;
    notifyListeners();
    try {
      await File(_file).writeAsString(jsonEncode({'autoCheck': on}));
    } catch (_) {}
    if (native) {
      await autoUpdater.setScheduledCheckInterval(on ? 86400 : 0);
    } else {
      _schedule();
    }
  }

  /// 检查更新。[manual] 是用户点了「检查更新」：Sparkle 会弹出结果对话框。
  Future<void> check({bool manual = false}) async {
    if (native) {
      await autoUpdater.checkForUpdates(inBackground: !manual);
      return;
    }
    if (checking) return;
    checking = true;
    if (manual) _statusKind = 'checking';
    notifyListeners();
    try {
      final r = await _latestRelease();
      if (r != null && compareVersions(r.$1, appVersion) > 0) {
        latest = r.$1;
        latestPage = r.$2;
        _statusKind = 'new';
        _statusVer = r.$1;
      } else {
        latest = latestPage = null;
        _statusKind = 'upToDate';
      }
    } catch (e) {
      _statusKind = 'failed';
      debugPrint('updater: $e');
    } finally {
      checking = false;
      notifyListeners();
    }
  }

  /// 打开新版本（或所有版本）的下载页。
  void openDownload() => openExternal(latestPage ?? releasesPage);

  /// GitHub 上最新的正式版：(版本号, 页面)。
  static Future<(String, String)?> _latestRelease() async {
    final proxy = systemProxy();
    final http = HttpClient()
      ..connectionTimeout = const Duration(seconds: 15)
      ..userAgent = 'YesPlayMusic/$appVersion';
    if (proxy != null) http.findProxy = proxy.findProxy;
    try {
      final req = await http.getUrl(
        Uri.parse('https://api.github.com/repos/$_repo/releases/latest'),
      );
      req.headers.set('Accept', 'application/vnd.github+json');
      final res = await req.close().timeout(const Duration(seconds: 30));
      if (res.statusCode == 404) return null; // 还没有发布过
      if (res.statusCode != 200) throw HttpException('HTTP ${res.statusCode}');
      final j = jsonDecode(
        await res
            .transform(utf8.decoder)
            .join()
            .timeout(const Duration(seconds: 30)),
      ) as Map;
      final tag = '${j['tag_name'] ?? ''}';
      if (tag.isEmpty) return null;
      return (
        tag.replaceFirst(RegExp(r'^v'), ''),
        '${j['html_url'] ?? releasesPage}',
      );
    } finally {
      http.close(force: true);
    }
  }
}
