// Update checks.
//
// Official macOS / Windows releases (built with --dart-define=YPM_SPARKLE=true) use
// Sparkle / WinSparkle: periodic background checks, with download, signature verification, install and relaunch in system dialogs.
// Otherwise (Linux, self-built versions) check the latest Release on GitHub, and when there's a new version
// show it in Settings → About; clicking opens the download page.

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

  /// Auto-update with Sparkle / WinSparkle.
  bool get native => _sparkle && (Platform.isMacOS || Platform.isWindows);

  /// Automatically check for updates (can be turned off in Settings).
  bool autoCheck = true;

  /// The newer version found and its download page; null when there's no update.
  String? latest;
  String? latestPage;
  bool checking = false;

  /// Result of the last manual check, shown on the settings page.
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
    // Check once shortly after launch, then once a day
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

  /// Checks for updates. [manual] means the user clicked "Check for updates": Sparkle shows a result dialog.
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

  /// Opens the download page for the new version (or all versions).
  void openDownload() => openExternal(latestPage ?? releasesPage);

  /// The latest stable release on GitHub: (version, page).
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
      if (res.statusCode == 404) return null; // never released yet
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
