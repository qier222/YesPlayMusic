import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:path/path.dart' as p;
import 'package:yesplaymusic/plugin/locale.dart';

void main() {
  late Directory dir;

  setUp(() {
    dir = Directory.systemTemp.createTempSync('ypm_plugin_locale_test_');
    clearPluginLocaleCache();
  });

  tearDown(() {
    clearPluginLocaleCache();
    dir.deleteSync(recursive: true);
  });

  void writeLocale(String name, String json) {
    final f = File(p.join(dir.path, 'locales', name));
    f.parent.createSync(recursive: true);
    f.writeAsStringSync(json);
  }

  test('exact match and underscore variant', () {
    writeLocale('zh-CN.json', '{"Hello": "你好"}');
    writeLocale('en.json', '{"你好": "Hello"}');
    expect(loadPluginLocale(dir.path, 'zh-CN'), {'Hello': '你好'});
    expect(loadPluginLocale(dir.path, 'en'), {'你好': 'Hello'});

    writeLocale('zh_TW.json', '{"Hello": "哈囉"}');
    expect(loadPluginLocale(dir.path, 'zh-TW'), {'Hello': '哈囉'});
  });

  test('zh-TW falls back to zh-Hant and zh, not zh-CN', () {
    writeLocale('zh-CN.json', '{"Hello": "简体"}');
    expect(loadPluginLocale(dir.path, 'zh-TW'), isEmpty);

    writeLocale('zh.json', '{"Hello": "通用中文"}');
    expect(loadPluginLocale(dir.path, 'zh-TW'), {'Hello': '通用中文'});

    writeLocale('zh-Hant.json', '{"Hello": "繁體"}');
    expect(loadPluginLocale(dir.path, 'zh-TW'), {'Hello': '繁體'});
  });

  test('zh-CN falls back to zh-Hans then zh', () {
    writeLocale('zh.json', '{"Hello": "通用"}');
    expect(loadPluginLocale(dir.path, 'zh-CN'), {'Hello': '通用'});

    writeLocale('zh-Hans.json', '{"Hello": "简体"}');
    expect(loadPluginLocale(dir.path, 'zh-CN'), {'Hello': '简体'});
  });

  test('non-zh falls back between base and region files', () {
    writeLocale('en-US.json', '{"歌曲": "Track"}');
    expect(loadPluginLocale(dir.path, 'en'), {'歌曲': 'Track'});

    writeLocale('ja.json', '{"歌曲": "トラック"}');
    expect(loadPluginLocale(dir.path, 'ja-JP'), {'歌曲': 'トラック'});
  });

  test('pluginTranslate caches and clears on reload', () {
    writeLocale('en.json', '{"设置": "Settings"}');
    expect(pluginTranslate(dir.path, 'en', '设置'), 'Settings');
    expect(pluginTranslate(dir.path, 'en', '未翻译'), '未翻译');

    writeLocale('en.json', '{"设置": "Preferences"}');
    // Before clearing the cache, the old cache is still used
    expect(pluginTranslate(dir.path, 'en', '设置'), 'Settings');

    clearPluginLocaleCache(dir.path);
    expect(pluginTranslate(dir.path, 'en', '设置'), 'Preferences');
  });

  test('missing dir or broken json returns original text', () {
    expect(pluginTranslate(dir.path, 'en', 'Test'), 'Test');
    writeLocale('en.json', '{not json');
    expect(pluginTranslate(dir.path, 'en', 'Test'), 'Test');
  });
}
