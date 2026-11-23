import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:path/path.dart' as p;
import 'package:yesplaymusic/plugin/manifest.dart';
import 'package:yesplaymusic/plugin/runtime.dart';

import 'fixture.dart';

void main() {
  late Directory tmp;
  late HttpServer server;
  late PluginRuntime rt;
  final logs = <String>[];

  PluginRuntime make({int sliceMs = 5000, Duration? timeout}) {
    final dir = writeFixture(p.join(tmp.path, 'plugins'));
    return PluginRuntime(
      manifest: PluginManifest.parse(
        File(p.join(dir, 'plugin.json')).readAsStringSync(),
      ),
      dir: dir,
      dataDir: p.join(tmp.path, 'data'),
      settings: {'server': 'http://127.0.0.1:${server.port}'},
      onLog: (l, m) => logs.add('$l $m'),
      sliceMs: sliceMs,
      callTimeout: timeout ?? const Duration(seconds: 10),
    );
  }

  setUp(() async {
    tmp = Directory.systemTemp.createTempSync('ypm_plugin_');
    server = await fixtureServer();
    logs.clear();
    rt = make();
    await rt.load();
  });
  tearDown(() async {
    rt.dispose();
    await server.close(force: true);
    tmp.deleteSync(recursive: true);
  });

  // Loads main, can import other files in the plugin directory, and lists exported functions.
  test('loads module and lists exports', () {
    expect(rt.exports, containsAll(['search', 'misc', 'store']));
  });

  // fetch to the server set in settings ({setting:server} permission), with headers, parsing JSON.
  test('fetch through setting-host permission', () async {
    final r = await rt.call('search', {'query': '晚風'}) as Map;
    expect((r['tracks'] as List).single['name'], '晚風|1');
  });

  // Hosts not in permissions.network: rejected; redirects to disallowed hosts are rejected too.
  test('network permission is enforced, including redirects', () async {
    await expectLater(
      rt.call('blocked'),
      throwsA(
        isA<PluginError>().having(
          (e) => e.message,
          'm',
          contains('example.com is not in'),
        ),
      ),
    );
    await expectLater(
      rt.call('redirectOut'),
      throwsA(
        isA<PluginError>().having(
          (e) => e.message,
          'm',
          contains('redirected to localhost'),
        ),
      ),
    );
  });

  // Redirects to another origin (another port here) drop credentials; same-origin redirects keep them.
  test('redirect drops credentials across origins', () async {
    final base = 'http://127.0.0.1:${server.port}';
    expect(await rt.call('redirectCreds', {'to': '$base/headers'}), {
      'authorization': 'Bearer t',
      'cookie': 's=1',
      'x-keep': '1',
    });
    final other = await fixtureServer();
    addTearDown(() => other.close(force: true));
    expect(
      await rt.call('redirectCreds', {
        'to': 'http://127.0.0.1:${other.port}/headers',
      }),
      {'authorization': null, 'cookie': null, 'x-keep': '1'},
    );
  });

  // POST forms, binary responses, aborting requests.
  test('post form, binary body, abort', () async {
    final r = await rt.call('post') as Map;
    expect(r['text'], 'a=1+2&b=%E4%B8%AD');
    expect(r['ct'], startsWith('application/x-www-form-urlencoded'));
    expect(await rt.call('bytes'), [0, 255, 128]);
    expect(await rt.call('abort'), 'AbortError');
  });

  // Error codes thrown by the plugin come back as-is.
  test('error codes', () async {
    await expectLater(
      rt.call('needSignIn'),
      throwsA(
        isA<PluginError>().having((e) => (e.code, e.message), 'e', (
          'signIn',
          '请先登录',
        )),
      ),
    );
    await expectLater(
      rt.call('nope'),
      throwsA(isA<PluginError>().having((e) => e.code, 'code', 'unsupported')),
    );
  });

  // Storage is written to dataDir and survives a new runtime.
  test('storage persists', () async {
    expect(await rt.call('store', {'v': 1}), isNull);
    expect(await rt.call('store', {'v': 2}), 1);
    rt.dispose();
    rt = make();
    await rt.load();
    expect(await rt.call('store', {'v': 3}), 2);
  });

  // Async results driven by setTimeout.
  test('timers', () async {
    expect(await rt.call('wait', {'ms': 30}), 30);
  });

  // Built-in URL, encoding, md5, localisation.
  test('web APIs and host helpers', () async {
    expect(await rt.call('misc'), {
      'md5': '900150983cd24fb0d6963f7d28e17f72',
      'aes': '674c7ef38e78cabd9cec9c125823a639',
      'url': 'https://a.com/p/b?x=1#h',
      'enc': '晚風🎵',
      'qs': '1,2',
      't': '你好',
      'platform': 'string',
    });
  });

  // Can't import files outside the plugin directory.
  test('modules stay inside the plugin', () async {
    await expectLater(
      rt.call('escape'),
      throwsA(
        isA<PluginError>().having(
          (e) => e.message,
          'm',
          contains('outside the plugin'),
        ),
      ),
    );
  });

  // Call timeout: returns an error, and the plugin still works.
  test('call timeout', () async {
    rt.dispose();
    rt = make(timeout: const Duration(milliseconds: 200));
    await rt.load();
    await expectLater(
      rt.call('wait', {'ms': 2000}),
      throwsA(isA<PluginError>()),
    );
    expect(await rt.call('wait', {'ms': 1}), 1);
  });

  // Infinite loop: interrupted and the plugin disabled, without hanging the host.
  test('runaway plugin is stopped', () async {
    rt.dispose();
    rt = make(sliceMs: 300);
    await rt.load();
    await expectLater(rt.call('spin'), throwsA(isA<PluginError>()));
    expect(rt.broken, isNotNull);
    await expectLater(rt.call('misc'), throwsA(isA<PluginError>()));
  });

  // host.language() follows the app language; after changing it, host.t() switches to that language's locales file.
  test('language follows the app and can change', () async {
    Directory(p.join(rt.dir, 'locales')).createSync();
    File(p.join(rt.dir, 'locales', 'en.json'))
        .writeAsStringSync('{"你好":"Hello"}');
    expect(await rt.call('lang'), ['zh-CN', '你好']);
    rt.language = 'en';
    expect(await rt.call('lang'), ['en', 'Hello']);
    rt.language = 'ja';
    expect(await rt.call('lang'), ['ja', '你好']);
  });
}
