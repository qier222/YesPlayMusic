import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/plugin/plugin_source.dart';
import 'package:yesplaymusic/state.dart';

import '../plugin/fixture.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  // A plugin stuck in an infinite loop is stopped: auto-restart once first; if it stops again within 60 seconds it goes to a failure card.
  test('crashed plugin restarts once, then goes to failed', () async {
    final dir = writeFixture(AppState.pluginsDir(), id: 'restart-me');
    final app = AppState();
    addTearDown(() {
      app.dispose();
      Directory(dir).deleteSync(recursive: true);
    });
    await app.loadPlugins();
    PluginSource plugin() => app.plugins.singleWhere((s) => s.dir == dir);

    final first = plugin();
    var gaps = 0;
    // During the restart the plugin and music source stay present, with no flash
    void watch() {
      if (!app.plugins.any((s) => s.dir == dir) ||
          app.sources[first.id] == null) {
        gaps++;
      }
    }

    app.addListener(watch);
    await expectLater(first.invoke('spin'), throwsA(anything));
    expect(app.plugins.any((s) => s.dir == dir), isTrue);
    expect(app.sources[first.id], isNotNull);
    for (var i = 0; i < 100 && identical(plugin(), first); i++) {
      await Future<void>.delayed(const Duration(milliseconds: 50));
    }
    app.removeListener(watch);
    expect(gaps, 0);
    final second = plugin();
    expect(second, isNot(same(first)));
    expect(app.sources[second.id], same(second));
    expect(app.pluginErrors, isNot(contains(dir)));

    await expectLater(second.invoke('spin'), throwsA(anything));
    await pumpEventQueue();
    expect(app.plugins.where((s) => s.dir == dir), isEmpty);
    expect(app.sources[second.id], isNull);
    expect(app.pluginErrors[dir], isNotEmpty);
  }, timeout: const Timeout(Duration(seconds: 60)));
}
