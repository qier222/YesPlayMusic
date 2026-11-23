import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/plugin/manifest.dart';

void main() {
  String json(String icon) =>
      '{"id": "x", "name": "X", "main": "index.js", "icon": $icon}';

  test('icon 是插件目录里的图片', () {
    expect(
      PluginManifest.parse(json('"assets/icon.png"')).icon,
      'assets/icon.png',
    );
    expect(PluginManifest.parse(json('"Logo.PNG"')).icon, 'Logo.PNG');
    expect(PluginManifest.parse(json('null')).icon, '');
  });

  test('icon 不能出插件目录，也不能是别的文件', () {
    for (final bad in [
      '"../icon.png"',
      '"/tmp/icon.png"',
      '"index.js"',
      '"icon.svg"',
    ]) {
      expect(() => PluginManifest.parse(json(bad)), throwsFormatException);
    }
  });
}
