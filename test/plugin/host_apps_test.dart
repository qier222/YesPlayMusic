// host.spawn, host.webSignIn and host.signInPrompt.
import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:path/path.dart' as p;
import 'package:yesplaymusic/plugin/manifest.dart';
import 'package:yesplaymusic/plugin/process.dart';
import 'package:yesplaymusic/plugin/runtime.dart';

const _js = r'''
export async function run({ command, args, input }) {
  const proc = host.spawn(command, args);
  if (input !== undefined) proc.write(input);
  proc.closeStdin();
  const lines = [];
  for (let l; (l = await proc.readLine()) !== null; ) lines.push(l);
  const code = await proc.wait();
  return { lines, code, err: proc.errorOutput(), pid: proc.pid > 0 };
}
export async function signIn() {
  return host.webSignIn({ url: "https://example.com/login", cookiesOf: "https://example.com", until: ["sid"] });
}
export async function qrSignIn() {
  host.signInPrompt({ qr: "https://example.com/code", text: "Scan it" });
  host.signInPrompt({ text: "Done" });
  host.signInPrompt();
  return "ok";
}
export async function badSignIn() {
  return host.webSignIn({ url: "https://example.com/login", cookiesOf: "https://elsewhere.org", until: ["sid"] });
}
''';

void main() {
  late Directory tmp;
  setUp(() => tmp = Directory.systemTemp.createTempSync('ypm_host_'));
  tearDown(() => tmp.deleteSync(recursive: true));

  Future<PluginRuntime> make({
    List<String> process = const ['cat', 'sh'],
    bool allow = true,
    Future<Object?> Function(String, Map<String, Object?>)? ask,
  }) async {
    final dir = Directory(p.join(tmp.path, 'x'))..createSync();
    final manifest = jsonEncode({
      'id': 'x',
      'name': 'X',
      'main': 'index.js',
      'permissions': {
        'network': ['example.com'],
        'process': process,
      },
    });
    File(p.join(dir.path, 'index.js')).writeAsStringSync(_js);
    final rt = PluginRuntime(
      manifest: PluginManifest.parse(manifest),
      dir: dir.path,
      dataDir: p.join(tmp.path, 'data'),
      allowPrograms: allow,
      onAsk: ask,
    );
    await rt.load();
    addTearDown(rt.dispose);
    return rt;
  }

  Matcher fails(String text) => throwsA(
    isA<PluginError>().having((e) => e.message, 'message', contains(text)),
  );

  test('spawn: stdin, stdout lines, exit code, stderr', () async {
    final rt = await make();
    final r = await rt.call('run', {
      'command': 'cat',
      'args': [],
      'input': 'a\nb\n',
    }) as Map;
    expect(r['lines'], ['a', 'b']);
    expect(r['code'], 0);
    expect(r['pid'], true);
    final e = await rt.call('run', {
      'command': 'sh',
      'args': ['-c', 'echo oops >&2; exit 3'],
    }) as Map;
    expect(e['code'], 3);
    expect(e['err'], contains('oops'));
  });

  test('spawn needs the permission and the user\'s consent', () async {
    final rt = await make(process: ['cat']);
    await expectLater(
      rt.call('run', {'command': 'sh', 'args': []}),
      fails('process permission'),
    );
    final off = await make(allow: false);
    await expectLater(
      off.call('run', {'command': 'cat', 'args': []}),
      fails('not allowed'),
    );
  });

  test('process permission matching', () {
    const dir = '/plug';
    expect(processAllowed('yt-dlp', ['yt-dlp'], dir), true);
    expect(processAllowed('/opt/homebrew/bin/yt-dlp', ['yt-dlp'], dir), false);
    expect(
      processAllowed('/opt/homebrew/bin/yt-dlp', ['/opt/*/bin/yt-dlp'], dir),
      true,
    );
    expect(processAllowed('bin/helper-arm64', ['bin/helper-*'], dir), true);
    expect(processAllowed('bin/sub/helper', ['bin/*'], dir), false);
    expect(processAllowed('../evil', ['*'], dir), true);
    expect(processAllowed('ffmpeg', ['ff*'], dir), true);
    // Backslashes count as path separators: a name wildcard can't be used to jump to another program
    expect(
      processAllowed(r'ff\..\..\Windows\System32\cmd', ['ff*'], dir),
      false,
    );
    expect(processAllowed(r'bin\sub\helper', ['bin/*'], dir), false);
    expect(processAllowed('../bin/helper', ['bin/*'], dir), false);
  });

  test('webSignIn asks the app and checks cookiesOf', () async {
    final asked = <Map<String, Object?>>[];
    final rt = await make(
      ask: (op, a) async {
        asked.add({'op': op, ...a});
        return {'cookie': 'sid=1'};
      },
    );
    expect(await rt.call('signIn'), {'cookie': 'sid=1'});
    expect(asked.single['op'], 'webSignIn');
    expect(asked.single['until'], ['sid']);
    await expectLater(rt.call('badSignIn'), fails('network permission'));
  });

  test('webSignIn failure reaches the plugin', () async {
    final rt = await make(ask: (op, a) async => throw StateError('closed'));
    await expectLater(rt.call('signIn'), fails('closed'));
  });

  test('signInPrompt reaches the app without waiting for it', () async {
    final asked = <Map<String, Object?>>[];
    final rt = await make(
      ask: (op, a) async {
        asked.add({'op': op, ...a});
        throw StateError('no dialog');
      },
    );
    expect(await rt.call('qrSignIn'), 'ok');
    expect(asked, [
      {
        'op': 'signInPrompt',
        'qr': 'https://example.com/code',
        'text': 'Scan it',
      },
      {'op': 'signInPrompt', 'qr': '', 'text': 'Done'},
      {'op': 'signInPrompt', 'qr': '', 'text': ''},
    ]);
  });
}
