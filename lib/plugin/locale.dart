// 插件本地化：从插件目录的 locales/<语言>.json 读取翻译表。
//
// 匹配顺序：
// 1. 精确标签（如 zh-CN.json、en.json）及其下划线写法（zh_CN.json）
// 2. 中文特例：繁体（zh-TW / zh-HK / zh-MO / zh-Hant）依次尝试 zh-TW / zh-Hant / zh-HK / zh；
//    简体（zh-CN / zh-SG / zh-Hans / zh）依次尝试 zh-CN / zh-Hans / zh
// 3. 其他语言：先去掉地区码试基础语言（en-US → en），再在 locales/ 里找同前缀的
//    地区文件（en → en-US.json，按文件名排序取第一个）

import 'dart:convert';
import 'dart:io';

import 'package:path/path.dart' as p;

/// 读取插件目录 [dir] 下匹配 [language]（BCP-47）的翻译表；找不到或格式不对返回空表。
Map<String, String> loadPluginLocale(String dir, String language) {
  final localesDir = Directory(p.join(dir, 'locales'));
  if (!localesDir.existsSync()) return const {};

  for (final tag in _candidates(language)) {
    final map = _readJsonMap(p.join(localesDir.path, '$tag.json'));
    if (map != null) return map;
  }

  // 无地区码的非中文语言（如 en、ja）：允许回退到同语言的地区文件（如 en-US.json）。
  final parts = language.trim().split(RegExp(r'[-_]'));
  final base = parts.first.toLowerCase();
  if (base.isNotEmpty && base != 'zh') {
    final re = RegExp(
      '^${RegExp.escape(base)}[-_].+\\.json\$',
      caseSensitive: false,
    );
    try {
      final matches =
          localesDir
              .listSync(followLinks: false)
              .whereType<File>()
              .where((f) => re.hasMatch(p.basename(f.path)))
              .toList()
            ..sort((a, b) => p.basename(a.path).compareTo(p.basename(b.path)));
      for (final f in matches) {
        final map = _readJsonMap(f.path);
        if (map != null) return map;
      }
    } catch (_) {}
  }

  return const {};
}

List<String> _candidates(String language) {
  final raw = language.trim();
  if (raw.isEmpty) return const [];
  final out = <String>[];
  void add(String tag) {
    if (tag.isNotEmpty && !out.contains(tag)) out.add(tag);
  }

  void addWithUnderscore(String tag) {
    add(tag);
    if (tag.contains('-')) add(tag.replaceAll('-', '_'));
    if (tag.contains('_')) add(tag.replaceAll('_', '-'));
  }

  addWithUnderscore(raw);
  final parts = raw.split(RegExp(r'[-_]'));
  final base = parts.first.toLowerCase();
  final subtags = parts.skip(1).map((x) => x.toLowerCase()).toSet();

  if (base == 'zh') {
    final isHant = subtags.any(const {'tw', 'hk', 'mo', 'hant'}.contains);
    if (isHant) {
      for (final t in const ['zh-TW', 'zh-Hant', 'zh-HK', 'zh']) {
        addWithUnderscore(t);
      }
    } else {
      for (final t in const ['zh-CN', 'zh-Hans', 'zh']) {
        addWithUnderscore(t);
      }
    }
  } else if (parts.length > 1) {
    add(base);
  }
  return out;
}

Map<String, String>? _readJsonMap(String path) {
  final file = File(path);
  if (!file.existsSync()) return null;
  try {
    final j = jsonDecode(file.readAsStringSync());
    if (j is Map) {
      return {for (final e in j.entries) '${e.key}': '${e.value}'};
    }
  } catch (_) {}
  return null;
}

final Map<(String, String), Map<String, String>> _cache = {};

/// 在主 isolate（UI）里翻译插件静态文案（plugin.json 里的名称、介绍、设置项、导航等）。
String pluginTranslate(String dir, String language, String text) {
  if (text.isEmpty || dir.isEmpty) return text;
  final map = _cache.putIfAbsent((
    dir,
    language,
  ), () => loadPluginLocale(dir, language));
  return map[text] ?? text;
}

/// 清理翻译缓存（重新加载或卸载插件时调用）。
void clearPluginLocaleCache([String? dir]) {
  if (dir == null) {
    _cache.clear();
  } else {
    _cache.removeWhere((k, _) => k.$1 == dir);
  }
}
