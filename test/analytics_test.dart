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
}
