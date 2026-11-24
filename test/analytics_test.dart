import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/analytics.dart';
import 'package:yesplaymusic/state.dart';

void main() {
  test('统计里的页面只有种类，不带 id 和参数', () {
    expect(AppState.pageKind('/album/@demo/12345'), '/album');
    expect(AppState.pageKind('/artist/42'), '/artist');
    expect(AppState.pageKind('/library/albums'), '/library/albums');
    expect(AppState.pageKind('/search?q=周杰伦'), '/search');
    expect(AppState.pageKind('/home'), '/home');
    expect(AppState.pageKind('/'), '/');
  });

  test('normalizeLocale converts OS locale to GA4 ul format', () {
    expect(Analytics.normalizeLocale('zh_CN'), 'zh-cn');
    expect(Analytics.normalizeLocale('en_US.UTF-8'), 'en-us');
    expect(Analytics.normalizeLocale('zh_Hans_CN'), 'zh-hans-cn');
    expect(Analytics.normalizeLocale('de_DE@euro'), 'de-de');
    expect(Analytics.normalizeLocale(''), '');
  });

  test(
    'buildCollectUri sets /g/collect query parameters and session flags',
    () {
      final first = Analytics.buildCollectUri(
        measurementId: 'G-TEST123456',
        clientId: '123.456',
        sessionId: 1700000000,
        sessionCount: 1,
        hitCount: 1,
        firstVisit: true,
        locale: 'zh_CN',
        screenResolution: '1728x1117',
      );
      expect(first.host, 'www.google-analytics.com');
      expect(first.path, '/g/collect');
      expect(first.queryParameters['v'], '2');
      expect(first.queryParameters['tid'], 'G-TEST123456');
      expect(first.queryParameters['cid'], '123.456');
      expect(first.queryParameters['sid'], '1700000000');
      expect(first.queryParameters['sct'], '1');
      expect(first.queryParameters['seg'], '1');
      expect(first.queryParameters['_s'], '1');
      expect(first.queryParameters['_ss'], '1');
      expect(first.queryParameters['_fv'], '1');
      expect(first.queryParameters['ul'], 'zh-cn');
      expect(first.queryParameters['sr'], '1728x1117');

      final second = Analytics.buildCollectUri(
        measurementId: 'G-TEST123456',
        clientId: '123.456',
        sessionId: 1700000000,
        sessionCount: 2,
        hitCount: 2,
        firstVisit: true,
        locale: '',
      );
      expect(second.queryParameters['_s'], '2');
      expect(second.queryParameters.containsKey('_ss'), isFalse);
      expect(second.queryParameters.containsKey('_fv'), isFalse);
      expect(second.queryParameters.containsKey('ul'), isFalse);
      expect(second.queryParameters.containsKey('sr'), isFalse);
    },
  );

  test('encodeEvents formats batched events with ep./epn. and truncation', () {
    final longValue = 'a' * 120;
    final body = Analytics.encodeEvents([
      ('app_active', {'os': 'macos', 'long': longValue}),
      ('settings_state', {'plugin_count': 3, 'ui_language': 'zh'}),
    ]);
    final lines = body.split('\n');
    expect(lines, hasLength(2));

    final e0 = Uri.splitQueryString(lines[0]);
    expect(e0['en'], 'app_active');
    expect(e0['_et'], '100');
    expect(e0['ep.os'], 'macos');
    expect(e0['ep.long'], 'a' * 100);

    final e1 = Uri.splitQueryString(lines[1]);
    expect(e1['en'], 'settings_state');
    expect(e1['_et'], '100');
    expect(e1['epn.plugin_count'], '3');
    expect(e1['ep.ui_language'], 'zh');
  });

  test('parseArch extracts CPU architecture from Platform.version', () {
    expect(
      Analytics.parseArch(
        '3.11.0 (stable) (Tue Feb 10 12:00:00 2026) on "macos_arm64"',
      ),
      'arm64',
    );
    expect(Analytics.parseArch('3.11.0 (stable) on "windows_x64"'), 'x64');
    expect(Analytics.parseArch('3.11.0 (stable) on "linux_arm64"'), 'arm64');
    expect(Analytics.parseArch('unexpected'), 'unknown');
  });

  test('normalizeOsVersion extracts coarse OS major version', () {
    expect(
      Analytics.normalizeOsVersion('macos', 'Version 15.3.1 (Build 24D70)'),
      'macos 15',
    );
    expect(
      Analytics.normalizeOsVersion(
        'windows',
        '"Windows 10 Pro" 10.0 (Build 22631)',
      ),
      'windows 11',
    );
    expect(
      Analytics.normalizeOsVersion(
        'windows',
        '"Windows 10 Pro" 10.0 (Build 19045)',
      ),
      'windows 10',
    );
    expect(
      Analytics.normalizeOsVersion(
        'linux',
        'Linux 6.8.0-45-generic #45-Ubuntu SMP',
      ),
      'linux 6.8',
    );
  });

  test(
    'display scale, window size, and library size helpers bucket cleanly',
    () {
      expect(Analytics.formatDisplayScale(1.0), '1x');
      expect(Analytics.formatDisplayScale(1.25), '1.25x');
      expect(Analytics.formatDisplayScale(1.5), '1.5x');
      expect(Analytics.formatDisplayScale(2.0), '2x');

      expect(Analytics.windowSizeBucket(900), 'compact');
      expect(Analytics.windowSizeBucket(1200), 'medium');
      expect(Analytics.windowSizeBucket(1440), 'wide');

      expect(Analytics.librarySizeBucket(0), '0');
      expect(Analytics.librarySizeBucket(42), '1-100');
      expect(Analytics.librarySizeBucket(500), '101-1000');
      expect(Analytics.librarySizeBucket(2500), '1000+');
    },
  );

  test('shouldRotateSession rotates on 30m idle or calendar day rollover', () {
    final t0 = DateTime(2026, 11, 24, 23, 50);
    expect(
      Analytics.shouldRotateSession(t0, DateTime(2026, 11, 24, 23, 59)),
      isFalse,
    );
    expect(
      Analytics.shouldRotateSession(t0, DateTime(2026, 11, 25, 0, 5)),
      isTrue,
    );
    expect(
      Analytics.shouldRotateSession(
        DateTime(2026, 11, 24, 10, 0),
        DateTime(2026, 11, 24, 10, 30),
      ),
      isTrue,
    );
  });
}
