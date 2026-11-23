import 'dart:ui';

import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/l10n/l10n.dart';

void main() {
  test('所有 9 种语言均可正常加载且关键文案非空', () {
    expect(AppLocalizations.supportedLocales.length, 9);
    for (final loc in AppLocalizations.supportedLocales) {
      final l = lookupAppLocalizations(loc);
      expect(l.navHome, isNotEmpty);
      expect(l.navSettings, isNotEmpty);
      expect(l.langSystem, isNotEmpty);
      expect(l.countTracks(5), isNotEmpty);
    }
  });

  test('resolveAppLocale 正确解析简繁中文、其他语言与未知语言回退', () {
    const supported = AppLocalizations.supportedLocales;
    expect(
      resolveAppLocale([const Locale('zh', 'CN')], supported),
      const Locale('zh'),
    );
    expect(
      resolveAppLocale([const Locale('zh', 'TW')], supported),
      const Locale.fromSubtags(languageCode: 'zh', scriptCode: 'Hant'),
    );
    expect(
      resolveAppLocale([const Locale('zh', 'HK')], supported),
      const Locale.fromSubtags(languageCode: 'zh', scriptCode: 'Hant'),
    );
    expect(
      resolveAppLocale([const Locale('ja', 'JP')], supported),
      const Locale('ja'),
    );
    expect(
      resolveAppLocale([const Locale('ko', 'KR')], supported),
      const Locale('ko'),
    );
    expect(
      resolveAppLocale([const Locale('fr', 'FR')], supported),
      const Locale('fr'),
    );
    expect(
      resolveAppLocale([const Locale('de', 'DE')], supported),
      const Locale('de'),
    );
    expect(
      resolveAppLocale([const Locale('es', 'MX')], supported),
      const Locale('es'),
    );
    expect(
      resolveAppLocale([const Locale('ru', 'RU')], supported),
      const Locale('ru'),
    );
    // Unknown languages fall back to English
    expect(
      resolveAppLocale([const Locale('it', 'IT')], supported),
      const Locale('en'),
    );
  });

  test('formatShortCount 按语言格式化播放量缩写', () {
    expect(formatShortCount(12500, const Locale('zh')), '1.3 万');
    expect(
      formatShortCount(
        12500,
        const Locale.fromSubtags(languageCode: 'zh', scriptCode: 'Hant'),
      ),
      '1.3 萬',
    );
    expect(formatShortCount(12500, const Locale('ja')), '1.3万');
    expect(formatShortCount(12500, const Locale('ko')), '1.3만');
    expect(formatShortCount(12500, const Locale('en')), '13K');
    expect(formatShortCount(1500000, const Locale('en')), '1.5M');
    expect(formatShortCount(1200000, const Locale('de')), '1,2\u00A0Mio.');
    expect(formatShortCount(1200000, const Locale('ru')), '1,2\u00A0млн');
  });

  test('formatBytes uses the locale decimal separator', () {
    expect(formatBytes(3 << 29, const Locale('en')), '1.5 GB');
    expect(formatBytes(3 << 29, const Locale('de')), '1,5 GB');
    expect(formatBytes(5 << 20, const Locale('fr')), '5,0 MB');
    expect(formatBytes(320 << 20, const Locale('zh')), '320 MB');
  });

  test('AppLanguage.byCode 与 bcp47Of 正确映射', () {
    expect(AppLanguage.byCode('system').locale, isNull);
    expect(AppLanguage.byCode('unknown').code, 'system');
    expect(
      bcp47Of(const Locale.fromSubtags(languageCode: 'zh', scriptCode: 'Hant')),
      'zh-TW',
    );
    expect(bcp47Of(const Locale('zh')), 'zh-CN');
    expect(bcp47Of(const Locale('ja')), 'ja');
  });

  // The plugin isolate picks strings by BCP-47 tag: Traditional Chinese, unknown languages fall back to English.
  test('l10nForTag', () {
    expect(l10nForTag('zh-CN').localeName, 'zh');
    expect(l10nForTag('zh-TW').localeName, 'zh_Hant');
    expect(l10nForTag('ja').localeName, 'ja');
    expect(l10nForTag('xx').localeName, 'en');
  });

  test('listJoiner uses the ideographic comma for zh and ja only', () {
    expect(listJoiner(const Locale('zh')), '、');
    expect(listJoiner(const Locale('zh', 'TW')), '、');
    expect(listJoiner(const Locale('ja')), '、');
    expect(listJoiner(const Locale('en')), ', ');
    expect(listJoiner(const Locale('de')), ', ');
  });
}
