// 在真实的 macOS 应用里加载插件：确认打包进 app 的 QuickJS 动态库能用，
// 插件 isolate 能联网（本地服务器）并返回结果。
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:path/path.dart' as p;
import 'package:yesplaymusic/music/models.dart';
import 'package:yesplaymusic/plugin/plugin_source.dart';

import '../test/plugin/fixture.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  // 不用 testWidgets：本机开着辅助功能时，它会因为系统的 SemanticsHandle 报错。
  test('plugin runs inside the app', () async {
    final tmp = Directory.systemTemp.createTempSync('ypm_it_plugin_');
    final server = await fixtureServer();
    try {
      final s = await PluginSource.start(
        writeFixture(p.join(tmp.path, 'plugins')),
        dataRoot: p.join(tmp.path, 'data'),
      );
      await s.setSetting('server', 'http://127.0.0.1:${server.port}');
      final r = await s.search('晚風', SearchKind.tracks);
      expect(r.tracks.single.name, '晚風|1');
      await s.close();
    } finally {
      await server.close(force: true);
      tmp.deleteSync(recursive: true);
    }
  });
}
