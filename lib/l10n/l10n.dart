import 'package:flutter/widgets.dart';
import 'package:intl/intl.dart';

import 'app_localizations.dart';

export 'app_localizations.dart';

/// 应用支持的语言选项（含「跟随系统」）。
class AppLanguage {
  const AppLanguage({
    required this.code,
    required this.nativeName,
    required this.locale,
    required this.bcp47,
  });

  /// 持久化到 prefs.json 的标识。
  final String code;

  /// 原生语言名称；跟随系统为空（由当前语言翻译）。
  final String nativeName;

  /// 传给 WidgetsApp.locale；跟随系统为 null。
  final Locale? locale;

  /// 传给插件运行时（host.language()）的 BCP-47 标签；跟随系统按当前生效 locale 决定。
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

/// 将系统语言列表解析为应用支持的 Locale（繁中自动归到 zh_Hant，未知语言回退到 en）。
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

/// 将 Locale 转为给插件用的 BCP-47 标签。
String bcp47Of(Locale locale) {
  if (locale.languageCode == 'zh') {
    return locale.scriptCode == 'Hant' ? 'zh-TW' : 'zh-CN';
  }
  return locale.languageCode;
}

/// 全局当前语言实例，供没有 BuildContext 的逻辑层（AppState、Updater、插件加载等）使用。
/// 默认中文以兼容无 UI 环境的单元测试；在 WidgetsApp.builder 里会自动同步。
AppLocalizations L = lookupAppLocalizations(const Locale('zh'));

/// 当前生效的 Locale，与 [L] 同步更新。
Locale currentLocale = const Locale('zh');

/// 生效语言变了（用户改了语言或系统语言变了）时调用，比如通知插件。
void Function(Locale locale)? onGlobalLocaleChanged;

void syncGlobalL10n(BuildContext context) {
  final loc = Localizations.localeOf(context);
  final changed = loc != currentLocale;
  currentLocale = loc;
  L = AppLocalizations.of(context);
  if (changed) onGlobalLocaleChanged?.call(loc);
}

/// [bcp47Of] 的反方向：插件 isolate 里用它挑同一种语言的文案。
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

/// 首页大标题上方的日期行（跟随当前语言格式化）。
String formatHomeDate(DateTime d, Locale locale) {
  final tag = locale.toLanguageTag();
  try {
    return DateFormat.MMMMEEEEd(tag).format(d);
  } catch (_) {
    // 日期数据没初始化（main 里 initializeDateFormatting）时只有 en_US 是内置的
    return DateFormat.MMMMEEEEd('en_US').format(d);
  }
}

/// 播放量 / 评论数缩写：中日韩用万/亿，其他语言用 K/M/B。
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
  if (n >= 1000000000) return '${one(n / 1000000000)}B';
  if (n >= 1000000) return '${one(n / 1000000)}M';
  if (n >= 1000) return '${one(n / 1000)}K';
  return '$n';
}

/// 列表分隔顿号/逗号（中日文用顿号，其他语言用 ", "）。
String listJoiner(Locale locale) =>
    (locale.languageCode == 'zh' || locale.languageCode == 'ja') ? '、' : ', ';
