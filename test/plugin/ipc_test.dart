// host.ipc (local channels) and the playback op.
import 'dart:convert';
import 'dart:io';
import 'dart:math';

import 'package:flutter_test/flutter_test.dart';
import 'package:path/path.dart' as p;
import 'package:yesplaymusic/music/models.dart';
import 'package:yesplaymusic/music/source.dart';
import 'package:yesplaymusic/plugin/ipc.dart';
import 'package:yesplaymusic/plugin/plugin_source.dart';

const _js = r'''
export async function talk({ name, text }) {
  const c = await host.ipc.connect(name);
  await c.write(new TextEncoder().encode(text));
  const r = await c.read();
  c.close();
  return new TextDecoder().decode(r);
}
export async function refused({ name }) {
  try { await host.ipc.connect(name); return "connected"; } catch (e) { return e.message; }
}
export function pid() { return host.pid; }
export function playback(a) { host.storage.set("k", a); }
export function last() { return host.storage.get("k"); }
''';

void main() {
  test('names and permissions', () {
    expect(ipcNameValid('discord-ipc-0'), isTrue);
    expect(ipcNameValid('snap.discord/discord-ipc-0'), !Platform.isWindows);
    expect(ipcNameValid('../x'), isFalse);
    expect(ipcNameValid('a/../b'), isFalse);
    expect(ipcNameValid('/tmp/x'), isFalse);
    expect(ipcNameValid(''), isFalse);
    expect(ipcAllowed('discord-ipc-3', ['discord-ipc-*']), isTrue);
    expect(ipcAllowed('discord-ipc-3/x', ['discord-ipc-*']), isFalse);
    expect(ipcAllowed('docker.sock', ['discord-ipc-*']), isFalse);
    expect(ipcDirs({'TMPDIR': '/t', 'TMP': '/t'}), ['/t', '/tmp']);
  });

  test('plugin talks to a local socket, only within permissions.ipc', () async {
    final tmp = Directory.systemTemp.createTempSync('ypm_ipc_');
    addTearDown(() => tmp.deleteSync(recursive: true));
    // Put the socket in the first directory host.ipc searches
    final name = 'ypm-test-${Random().nextInt(1 << 30)}';
    final path = p.join(ipcDirs().first, name);
    final server = await ServerSocket.bind(
      InternetAddress(path, type: InternetAddressType.unix),
      0,
    );
    addTearDown(() async {
      await server.close();
      if (File(path).existsSync()) File(path).deleteSync();
    });
    server.listen((c) {
      c.listen((d) {
        c.add(utf8.encode('pong:${utf8.decode(d)}'));
      });
    });

    final dir = p.join(tmp.path, 'plugins', 'ipcfix');
    Directory(dir).createSync(recursive: true);
    File(p.join(dir, 'plugin.json')).writeAsStringSync(
      jsonEncode({
        'id': 'ipcfix',
        'name': 'IPC',
        'permissions': {
          'ipc': ['ypm-test-*'],
        },
      }),
    );
    File(p.join(dir, 'index.js')).writeAsStringSync(_js);
    final s = await PluginSource.start(dir, dataRoot: p.join(tmp.path, 'data'));
    addTearDown(s.close);

    expect(s.manifest.ipc, ['ypm-test-*']);
    expect(await s.invoke('talk', {'name': name, 'text': '晚风'}), 'pong:晚风');
    expect(
      await s.invoke('refused', {'name': 'discord-ipc-0'}),
      contains('not in the plugin'),
    );
    expect(
      await s.invoke('refused', {'name': 'ypm-test-missing'}),
      contains('cannot connect'),
    );
    expect(await s.invoke('pid'), pid);

    expect(s.can(Op.playback), isTrue);
    const t = Track(id: '1', name: 'x', source: 'local');
    await s.playback(t, playing: true, positionMs: 1500);
    expect(await s.invoke('last'), {
      'track': t.toJson(),
      'playing': true,
      'position': 1500,
    });
    await s.playback(null, playing: false, positionMs: 0);
    expect((await s.invoke('last') as Map)['track'], isNull);
  }, skip: Platform.isWindows ? 'Unix 套接字' : false);
}
