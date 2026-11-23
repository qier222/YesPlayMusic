// Plugin localisation: reads translation tables from locales/<language>.json in the plugin directory.
//
// Matching order:
// 1. Exact tag (e.g. zh-CN.json, en.json) and its underscore form (zh_CN.json)
// 2. Chinese special cases: Traditional (zh-TW / zh-HK / zh-MO / zh-Hant) tries zh-TW / zh-Hant / zh-HK / zh in turn;
//    Simplified (zh-CN / zh-SG / zh-Hans / zh) tries zh-CN / zh-Hans / zh in turn
// 3. Other languages: first drop the region to try the base language (en-US → en), then look in locales/ for a region file
//    with the same prefix (en → en-US.json, first by file name order)

import 'dart:convert';
import 'dart:io';

import 'package:path/path.dart' as p;

/// Reads the translation table matching [language] (BCP-47) in plugin directory [dir]; returns an empty table if missing or malformed.
Map<String, String> loadPluginLocale(String dir, String language) {
  final localesDir = Directory(p.join(dir, 'locales'));
  if (!localesDir.existsSync()) return const {};

  for (final tag in _candidates(language)) {
    final map = _readJsonMap(p.join(localesDir.path, '$tag.json'));
    if (map != null) return map;
  }

  // Non-Chinese languages without a region (e.g. en, ja): may fall back to a region file of the same language (e.g. en-US.json).
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

/// Translates a plugin's static text (name, description, settings, navigation etc. in plugin.json) on the main (UI) isolate.
String pluginTranslate(String dir, String language, String text) {
  if (text.isEmpty || dir.isEmpty) return text;
  final map = _cache.putIfAbsent((
    dir,
    language,
  ), () => loadPluginLocale(dir, language));
  return map[text] ?? text;
}

/// Clears the translation cache (called when a plugin is reloaded or uninstalled).
void clearPluginLocaleCache([String? dir]) {
  if (dir == null) {
    _cache.clear();
  } else {
    _cache.removeWhere((k, _) => k.$1 == dir);
  }
}
