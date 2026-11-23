import 'package:flutter/widgets.dart';
import 'package:intl/intl.dart';

import 'app_localizations.dart';

export 'app_localizations.dart';

/// App language options (including "follow system").
class AppLanguage {
  const AppLanguage({
    required this.code,
    required this.nativeName,
    required this.locale,
    required this.bcp47,
  });

  /// Identifier persisted in prefs.json.
  final String code;

  /// Native language name; empty for follow system (translated in the current language).
  final String nativeName;

  /// Passed to WidgetsApp.locale; null for follow system.
  final Locale? locale;

  /// BCP-47 tag passed to the plugin runtime (host.language()); for follow system, decided by the effective locale.
  final String bcp47;

  static const system = AppLanguage(
    code: 'system',
    nativeName: '',
    locale: null,
    bcp47: '',
  );

  static const List<AppLanguage> values = [
    system,
    AppLanguage(
      code: 'zh',
      nativeName: '简体中文',
      locale: Locale('zh'),
      bcp47: 'zh-CN',
    ),
    AppLanguage(
      code: 'zh_Hant',
      nativeName: '繁體中文',
      locale: Locale.fromSubtags(languageCode: 'zh', scriptCode: 'Hant'),
      bcp47: 'zh-TW',
    ),
    AppLanguage(
      code: 'en',
      nativeName: 'English',
      locale: Locale('en'),
      bcp47: 'en',
    ),
    AppLanguage(
      code: 'ja',
      nativeName: '日本語',
      locale: Locale('ja'),
      bcp47: 'ja',
    ),
    AppLanguage(
      code: 'ko',
      nativeName: '한국어',
      locale: Locale('ko'),
      bcp47: 'ko',
    ),
    AppLanguage(
      code: 'fr',
      nativeName: 'Français',
      locale: Locale('fr'),
      bcp47: 'fr',
    ),
    AppLanguage(
      code: 'de',
      nativeName: 'Deutsch',
      locale: Locale('de'),
      bcp47: 'de',
    ),
    AppLanguage(
      code: 'es',
      nativeName: 'Español',
      locale: Locale('es'),
      bcp47: 'es',
    ),
    AppLanguage(
      code: 'ru',
      nativeName: 'Русский',
      locale: Locale('ru'),
      bcp47: 'ru',
    ),
  ];

  static AppLanguage byCode(String? code) =>
      values.firstWhere((e) => e.code == code, orElse: () => system);

  String displayName(AppLocalizations l) =>
      code == 'system' ? l.langSystem : nativeName;
}

/// Resolves the system language list to a supported Locale (Traditional Chinese maps to zh_Hant, unknown languages fall back to en).
Locale resolveAppLocale(
  List<Locale>? locales,
  Iterable<Locale> supportedLocales,
) {
  if (locales != null) {
    for (final loc in locales) {
      if (loc.languageCode == 'zh') {
        final isHant =
            loc.scriptCode == 'Hant' ||
            const {'TW', 'HK', 'MO'}.contains(loc.countryCode?.toUpperCase());
        return isHant
            ? const Locale.fromSubtags(languageCode: 'zh', scriptCode: 'Hant')
            : const Locale('zh');
      }
      for (final s in supportedLocales) {
        if (s.languageCode == loc.languageCode) return s;
      }
    }
  }
  return const Locale('en');
}

/// Converts a Locale into the BCP-47 tag used by plugins.
String bcp47Of(Locale locale) {
  if (locale.languageCode == 'zh') {
    return locale.scriptCode == 'Hant' ? 'zh-TW' : 'zh-CN';
  }
  return locale.languageCode;
}

/// Global current localizations, for logic without a BuildContext (AppState, Updater, plugin loading, etc.).
/// Defaults to Chinese for unit tests without UI; synced automatically in WidgetsApp.builder.
AppLocalizations L = lookupAppLocalizations(const Locale('zh'));

/// The effective Locale, updated together with [L].
Locale currentLocale = const Locale('zh');

/// Called when the effective language changes (user changed it or the system language changed), e.g. to notify plugins.
void Function(Locale locale)? onGlobalLocaleChanged;

void syncGlobalL10n(BuildContext context) {
  final loc = Localizations.localeOf(context);
  final changed = loc != currentLocale;
  currentLocale = loc;
  L = AppLocalizations.of(context);
  if (changed) onGlobalLocaleChanged?.call(loc);
}

/// The reverse of [bcp47Of]: the plugin isolate uses it to pick strings in the same language.
AppLocalizations l10nForTag(String tag) {
  final parts = tag.split(RegExp('[-_]'));
  final lang = parts.first.toLowerCase();
  final hant =
      lang == 'zh' &&
      parts
          .skip(1)
          .any(
            (x) => const {'tw', 'hk', 'mo', 'hant'}.contains(x.toLowerCase()),
          );
  return lookupAppLocalizations(
    resolveAppLocale([
      hant
          ? const Locale.fromSubtags(languageCode: 'zh', scriptCode: 'Hant')
          : Locale(lang),
    ], AppLocalizations.supportedLocales),
  );
}

extension L10nX on BuildContext {
  AppLocalizations get l10n => AppLocalizations.of(this);
}

/// Date line above the home page's large title (formatted for the current language).
String formatHomeDate(DateTime d, Locale locale) {
  final tag = locale.toLanguageTag();
  try {
    return DateFormat.MMMMEEEEd(tag).format(d);
  } catch (_) {
    // Without date data (initializeDateFormatting in main), only en_US is built in
    return DateFormat.MMMMEEEEd('en_US').format(d);
  }
}

/// Abbreviated play / comment counts: CJK uses 万/亿, English K/M/B, other languages their CLDR short forms.
String formatShortCount(int n, Locale locale) {
  String one(double v) => v >= 10
      ? '${v.round()}'
      : v.toStringAsFixed(1).replaceFirst(RegExp(r'\.0$'), '');
  final lang = locale.languageCode;
  if (lang == 'zh') {
    final hant = locale.scriptCode == 'Hant';
    if (n >= 100000000) return '${one(n / 100000000)} ${hant ? '億' : '亿'}';
    if (n >= 10000) return '${one(n / 10000)} ${hant ? '萬' : '万'}';
    return '$n';
  }
  if (lang == 'ja') {
    if (n >= 100000000) return '${one(n / 100000000)}億';
    if (n >= 10000) return '${one(n / 10000)}万';
    return '$n';
  }
  if (lang == 'ko') {
    if (n >= 100000000) return '${one(n / 100000000)}억';
    if (n >= 10000) return '${one(n / 10000)}만';
    return '$n';
  }
  if (lang != 'en') {
    // Other languages use their own abbreviations and decimal separator
    // (de 1,2 Mio., fr 1,2 M, ru 1,2 млн).
    return NumberFormat.compact(locale: lang).format(n);
  }
  if (n >= 1000000000) return '${one(n / 1000000000)}B';
  if (n >= 1000000) return '${one(n / 1000000)}M';
  if (n >= 1000) return '${one(n / 1000)}K';
  return '$n';
}

/// Storage size such as "1.5 GB" or "320 MB", with the locale's decimal separator.
String formatBytes(int bytes, Locale locale) {
  final tag = locale.languageCode;
  final gb = bytes / (1 << 30);
  if (gb >= 1) return '${NumberFormat('0.0', tag).format(gb)} GB';
  final mb = bytes / (1 << 20);
  final n = mb < 10 ? NumberFormat('0.0', tag).format(mb) : '${mb.round()}';
  return '$n MB';
}

/// List separator: the ideographic comma for Chinese and Japanese, ", " for other languages.
String listJoiner(Locale locale) =>
    (locale.languageCode == 'zh' || locale.languageCode == 'ja') ? '、' : ', ';
