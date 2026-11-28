import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/data.dart';
import 'package:yesplaymusic/mcp/config.dart';
import 'package:yesplaymusic/mcp/mcp_server.dart';
import 'package:yesplaymusic/music/models.dart' as m;
import 'package:yesplaymusic/music/source.dart';
import 'package:yesplaymusic/state.dart';
import 'package:yesplaymusic/version.dart';

class _FakeSource extends Source {
  _FakeSource({required String id, required String name, required this.ops})
    : info = m.SourceInfo(id: id, name: name);

  @override
  final m.SourceInfo info;

  @override
  final Set<String> ops;

  final List<String> deletedPlaylists = [];
  final List<String> createdPlaylists = [];

  @override
  Future<m.SearchResult> search(
    String query,
    m.SearchKind kind, {
    int offset = 0,
  }) async => m.SearchResult(
    tracks: [
      for (var i = offset + 1; i <= 4; i++)
        m.Track(
          id: 't$i',
          name: 'Song for $query',
          source: id,
          artists: const [m.Artist(id: 'a1', name: 'Tester')],
          album: const m.Album(id: 'al1', name: 'Test Album'),
          duration: 210000,
        ),
    ],
  );

  @override
  Future<m.Lyrics> lyrics(String id) async =>
      const m.Lyrics(lrc: '[00:01.00]Hello MCP\n[00:05.00]Lazy loading works');

  @override
  Future<List<m.Playlist>> playlists() async => const [
    m.Playlist(id: 'pl1', name: 'Chill Vibes', mine: true, trackCount: 12),
  ];

  @override
  Future<m.Playlist> createPlaylist(String name) async {
    createdPlaylists.add(name);
    return m.Playlist(id: 'pl_new', name: name, mine: true);
  }

  @override
  Future<void> deletePlaylist(String id) async {
    deletedPlaylists.add(id);
  }
}

Future<({int status, String? sessionId, Map<String, Object?>? body})> _rpc(
  HttpClient client,
  int port,
  Object payload, {
  String? sessionId,
  String? token,
  String? origin,
  ContentType? contentType,
}) async {
  final req = await client.postUrl(Uri.parse('http://127.0.0.1:$port/mcp'));
  req.headers.contentType = contentType ?? ContentType.json;
  if (sessionId != null) req.headers.set('Mcp-Session-Id', sessionId);
  if (token != null) {
    req.headers.set(HttpHeaders.authorizationHeader, 'Bearer $token');
  }
  if (origin != null) req.headers.set('Origin', origin);
  req.write(jsonEncode(payload));
  final res = await req.close();
  final text = await utf8.decoder.bind(res).join();
  return (
    status: res.statusCode,
    sessionId: res.headers.value('mcp-session-id'),
    body: text.isEmpty
        ? null
        : switch (jsonDecode(text)) {
            final Map m => m.cast<String, Object?>(),
            final List l => {'batch': l},
            _ => null,
          },
  );
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  // TestWidgetsFlutterBinding intercepts HttpClient with 400 by default; restore real loopback connections here.
  HttpOverrides.global = null;

  late AppState app;
  late McpServer server;
  late HttpClient client;
  late _FakeSource fake;
  late int port;

  setUp(() async {
    app = AppState();
    fake = _FakeSource(
      id: 'fake',
      name: 'Fake Music',
      ops: {
        Op.search,
        Op.lyrics,
        Op.playlists,
        Op.createPlaylist,
        Op.deletePlaylist,
      },
    );
    app.sources.add(fake);
    app.setSource('fake');

    // Use a free random port (assigned by the OS) to avoid port conflicts
    final probe = await ServerSocket.bind(InternetAddress.loopbackIPv4, 0);
    port = probe.port;
    await probe.close();

    server = McpServer(app);
    await server.applyConfig(
      McpConfig(enabled: true, port: port, lazyLoading: true),
    );
    client = HttpClient();
  });

  tearDown(() async {
    client.close(force: true);
    await server.stop();
    app.dispose();
  });

  test(
    'get_now_playing includes the local cover only when requested',
    () async {
      final temp = Directory.systemTemp.createTempSync('ypm_mcp_cover_');
      addTearDown(() => temp.deleteSync(recursive: true));
      final file = File.fromUri(temp.uri.resolve('cover.png'));
      final png = File('assets/app_icon.png').readAsBytesSync();
      file.writeAsBytesSync(png);
      app.queue = [
        Track(
          title: 'Cover test',
          artist: 'Tester',
          cover: file.uri.toString(),
          seconds: 30,
        ),
      ];
      app.index = 0;
      final init = await _rpc(client, port, {
        'jsonrpc': '2.0',
        'id': 1,
        'method': 'initialize',
        'params': {'protocolVersion': '2025-03-26'},
      });
      Future<List> callNowPlaying(int id, [bool? includeArtwork]) async {
        final response = await _rpc(client, port, {
          'jsonrpc': '2.0',
          'id': id,
          'method': 'tools/call',
          'params': {
            'name': 'get_now_playing',
            if (includeArtwork != null)
              'arguments': {'includeArtwork': includeArtwork},
          },
        }, sessionId: init.sessionId);
        return (response.body!['result'] as Map)['content'] as List;
      }

      final defaultContent = await callNowPlaying(2);
      expect(defaultContent, hasLength(1));
      expect(
        jsonDecode(
          (defaultContent.single as Map)['text'] as String,
        )['track']['title'],
        'Cover test',
      );
      expect(await callNowPlaying(3, false), defaultContent);
      final content = await callNowPlaying(4, true);
      expect(content, hasLength(2));
      expect(content.first, defaultContent.single);
      expect(content.last, {
        'type': 'image',
        'mimeType': 'image/png',
        'data': base64Encode(png),
      });
      await file.delete();
      expect(await callNowPlaying(5, true), defaultContent);
    },
  );

  test(
    'initialize + lazy tools/list exposes only core and meta tools',
    () async {
      final init = await _rpc(client, port, {
        'jsonrpc': '2.0',
        'id': 1,
        'method': 'initialize',
        'params': {'protocolVersion': '2025-03-26'},
      });
      expect(init.status, 200);
      expect(init.sessionId, isNotNull);
      final result = init.body!['result'] as Map;
      expect(result['protocolVersion'], '2025-03-26');
      expect((result['capabilities'] as Map)['tools'], {'listChanged': true});

      final list = await _rpc(client, port, {
        'jsonrpc': '2.0',
        'id': 2,
        'method': 'tools/list',
      }, sessionId: init.sessionId);
      final tools = (list.body!['result'] as Map)['tools'] as List;
      final names = {for (final t in tools) (t as Map)['name'] as String};
      expect(
        names,
        containsAll([
          'get_now_playing',
          'control_playback',
          'search_music',
          'play_tracks',
          'manage_queue',
          'ypm_discover_tools',
          'ypm_call_tool',
        ]),
      );
      // Lazy tools must not appear in tools/list initially
      expect(names, isNot(contains('get_lyrics')));
      expect(names, isNot(contains('list_playlists')));
    },
  );

  test('control_playback sets off, one, and all repeat modes', () async {
    final init = await _rpc(client, port, {
      'jsonrpc': '2.0',
      'id': 1,
      'method': 'initialize',
    });

    for (final (i, mode) in ['off', 'one', 'all'].indexed) {
      final call = await _rpc(client, port, {
        'jsonrpc': '2.0',
        'id': i + 2,
        'method': 'tools/call',
        'params': {
          'name': 'control_playback',
          'arguments': {'action': 'repeat', 'value': mode},
        },
      }, sessionId: init.sessionId);
      final content = (call.body!['result'] as Map)['content'] as List;
      final snapshot =
          jsonDecode((content.single as Map)['text'] as String) as Map;
      expect(snapshot['repeat'], mode != 'off');
      expect(snapshot['repeatMode'], mode);
      expect(app.repeatMode.name, mode);
    }
  });

  test(
    'search_music reports more when the requested limit truncates results',
    () async {
      final init = await _rpc(client, port, {
        'jsonrpc': '2.0',
        'id': 1,
        'method': 'initialize',
      });

      Future<Map> search(int offset) async {
        final call = await _rpc(client, port, {
          'jsonrpc': '2.0',
          'id': offset + 2,
          'method': 'tools/call',
          'params': {
            'name': 'search_music',
            'arguments': {'query': 'Song', 'offset': offset, 'limit': 2},
          },
        }, sessionId: init.sessionId);
        final content = (call.body!['result'] as Map)['content'] as List;
        return jsonDecode((content.single as Map)['text'] as String) as Map;
      }

      final first = await search(0);
      expect((first['tracks'] as List).map((t) => t['id']), ['t1', 't2']);
      expect(first['more'], isTrue);

      final last = await search(2);
      expect((last['tracks'] as List).map((t) => t['id']), ['t3', 't4']);
      expect(last['more'], isFalse);
    },
  );

  test('ypm_discover_tools unlocks tools, sends SSE list_changed, and ypm_call_tool invokes them', () async {
    final init = await _rpc(client, port, {
      'jsonrpc': '2.0',
      'id': 1,
      'method': 'initialize',
    });
    final sid = init.sessionId!;

    // Connect the SSE channel to listen for notifications/tools/list_changed
    final sseReq = await client.getUrl(Uri.parse('http://127.0.0.1:$port/mcp'));
    sseReq.headers.set('Mcp-Session-Id', sid);
    final sseRes = await sseReq.close();
    final sseReceived = Completer<String>();
    final sseSub = sseRes.transform(utf8.decoder).listen((chunk) {
      if (chunk.contains('notifications/tools/list_changed') &&
          !sseReceived.isCompleted) {
        sseReceived.complete(chunk);
      }
    });

    // Discover the lyrics category via ypm_discover_tools
    final disc = await _rpc(client, port, {
      'jsonrpc': '2.0',
      'id': 2,
      'method': 'tools/call',
      'params': {
        'name': 'ypm_discover_tools',
        'arguments': {'category': 'lyrics'},
      },
    }, sessionId: sid);
    final discText =
        (((disc.body!['result'] as Map)['content'] as List).first
                as Map)['text']
            as String;
    final discJson = jsonDecode(discText) as Map;
    expect(discJson['matchedCount'], 1);
    expect(discJson['unlockedInSession'], true);
    // The comments category, unsupported by the current source, must not appear among available categories
    expect((discJson['categories'] as Map).containsKey('comments'), isFalse);

    // Should receive an SSE list_changed notification
    final sseChunk = await sseReceived.future.timeout(
      const Duration(seconds: 3),
    );
    expect(sseChunk, contains('notifications/tools/list_changed'));

    // tools/list should now include get_lyrics
    final list2 = await _rpc(client, port, {
      'jsonrpc': '2.0',
      'id': 3,
      'method': 'tools/list',
    }, sessionId: sid);
    final names2 = {
      for (final t in (list2.body!['result'] as Map)['tools'] as List)
        (t as Map)['name'] as String,
    };
    expect(names2, contains('get_lyrics'));

    // Call the lazy tool get_lyrics via ypm_call_tool
    final call = await _rpc(client, port, {
      'jsonrpc': '2.0',
      'id': 4,
      'method': 'tools/call',
      'params': {
        'name': 'ypm_call_tool',
        'arguments': {
          'name': 'get_lyrics',
          'arguments': {'source': 'fake', 'id': 't1', 'format': 'plain'},
        },
      },
    }, sessionId: sid);
    final callText =
        (((call.body!['result'] as Map)['content'] as List).first
                as Map)['text']
            as String;
    expect(callText, contains('Hello MCP'));
    expect(callText, contains('Lazy loading works'));

    await sseSub.cancel();
  });

  test(
    'full exposure mode lists all source-supported tools without meta tools',
    () async {
      await server.applyConfig(
        McpConfig(enabled: true, port: port, lazyLoading: false),
      );
      final list = await _rpc(client, port, {
        'jsonrpc': '2.0',
        'id': 1,
        'method': 'tools/list',
      });
      final names = {
        for (final t in (list.body!['result'] as Map)['tools'] as List)
          (t as Map)['name'] as String,
      };
      expect(names, contains('get_lyrics'));
      expect(names, contains('list_playlists'));
      expect(names, isNot(contains('ypm_discover_tools')));
      expect(names, isNot(contains('ypm_call_tool')));
      // The fake source doesn't support Op.comments, so get_comments isn't exposed
      expect(names, isNot(contains('get_comments')));
    },
  );

  test('read-only mode blocks mutating tools like delete_playlist', () async {
    await server.applyConfig(
      McpConfig(enabled: true, port: port, lazyLoading: false, readOnly: true),
    );
    final call = await _rpc(client, port, {
      'jsonrpc': '2.0',
      'id': 1,
      'method': 'tools/call',
      'params': {
        'name': 'delete_playlist',
        'arguments': {'source': 'fake', 'playlistId': 'pl1'},
      },
    });
    final res = call.body!['result'] as Map;
    expect(res['isError'], true);
    expect(fake.deletedPlaylists, isEmpty);
  });

  test('resources/list and resources/read work', () async {
    final list = await _rpc(client, port, {
      'jsonrpc': '2.0',
      'id': 1,
      'method': 'resources/list',
    });
    final uris = {
      for (final r in (list.body!['result'] as Map)['resources'] as List)
        (r as Map)['uri'] as String,
    };
    expect(
      uris,
      containsAll(['ypm://now-playing', 'ypm://queue', 'ypm://sources']),
    );

    final read = await _rpc(client, port, {
      'jsonrpc': '2.0',
      'id': 2,
      'method': 'resources/read',
      'params': {'uri': 'ypm://sources'},
    });
    final text =
        (((read.body!['result'] as Map)['contents'] as List).first
                as Map)['text']
            as String;
    expect(text, contains('"id":"fake"'));
  });

  test('security: rejects external Origin and enforces Bearer token', () async {
    await server.applyConfig(
      McpConfig(
        enabled: true,
        port: port,
        requireAuth: true,
        token: 'secret123',
      ),
    );

    final badOrigin = await _rpc(
      client,
      port,
      {'jsonrpc': '2.0', 'id': 1, 'method': 'ping'},
      origin: 'https://evil.example.com',
      token: 'secret123',
    );
    expect(badOrigin.status, HttpStatus.forbidden);

    final noToken = await _rpc(client, port, {
      'jsonrpc': '2.0',
      'id': 2,
      'method': 'ping',
    });
    expect(noToken.status, HttpStatus.unauthorized);

    final ok = await _rpc(client, port, {
      'jsonrpc': '2.0',
      'id': 3,
      'method': 'ping',
    }, token: 'secret123');
    expect(ok.status, HttpStatus.ok);
    expect(ok.body!['result'], const <String, Object?>{});
  });

  test('security: Origin null（sandbox iframe）被拒绝', () async {
    final r = await _rpc(client, port, {
      'jsonrpc': '2.0',
      'id': 1,
      'method': 'ping',
    }, origin: 'null');
    expect(r.status, HttpStatus.forbidden);
  });

  test('security: 本机 Origin 放行', () async {
    for (final o in ['http://localhost:3000', 'http://127.0.0.1:8080']) {
      final r = await _rpc(client, port, {
        'jsonrpc': '2.0',
        'id': 1,
        'method': 'ping',
      }, origin: o);
      expect(r.status, HttpStatus.ok, reason: o);
    }
  });

  test('security: 非 application/json 的 POST 被拒绝且不执行工具', () async {
    final r = await _rpc(client, port, {
      'jsonrpc': '2.0',
      'id': 1,
      'method': 'tools/call',
      'params': {
        'name': 'delete_playlist',
        'arguments': {'source': 'fake', 'playlistId': 'pl1'},
      },
    }, contentType: ContentType.text);
    expect(r.status, HttpStatus.unsupportedMediaType);
    expect(fake.deletedPlaylists, isEmpty);
  });

  test('protocol: 非法 JSON 返回 parse error', () async {
    final req = await client.postUrl(Uri.parse('http://127.0.0.1:$port/mcp'));
    req.headers.contentType = ContentType.json;
    req.write('{not json');
    final res = await req.close();
    final body = jsonDecode(await utf8.decoder.bind(res).join()) as Map;
    expect(res.statusCode, HttpStatus.badRequest);
    expect((body['error'] as Map)['code'], -32700);
  });

  test('protocol: 未知方法返回 method not found', () async {
    final r = await _rpc(client, port, {
      'jsonrpc': '2.0',
      'id': 7,
      'method': 'nope/nope',
    });
    expect(r.body!['id'], 7);
    expect((r.body!['error'] as Map)['code'], -32601);
  });

  test('protocol: 通知没有响应体，返回 202', () async {
    final r = await _rpc(client, port, {
      'jsonrpc': '2.0',
      'method': 'notifications/initialized',
    });
    expect(r.status, HttpStatus.accepted);
    expect(r.body, isNull);
  });

  test('protocol: 批量请求逐条应答，跳过通知', () async {
    final r = await _rpc(client, port, [
      {'jsonrpc': '2.0', 'id': 1, 'method': 'ping'},
      {'jsonrpc': '2.0', 'method': 'notifications/initialized'},
      {'jsonrpc': '2.0', 'id': 2, 'method': 'nope'},
      42,
    ]);
    final batch = r.body!['batch'] as List;
    expect(batch, hasLength(3));
    expect((batch[0] as Map)['id'], 1);
    expect(((batch[1] as Map)['error'] as Map)['code'], -32601);
    expect(((batch[2] as Map)['error'] as Map)['code'], -32600);
  });

  test('protocol: 协商不支持的版本时回落到服务端版本', () async {
    final r = await _rpc(client, port, {
      'jsonrpc': '2.0',
      'id': 1,
      'method': 'initialize',
      'params': {'protocolVersion': '1999-01-01'},
    });
    expect((r.body!['result'] as Map)['protocolVersion'], '2025-03-26');
    final old = await _rpc(client, port, {
      'jsonrpc': '2.0',
      'id': 2,
      'method': 'initialize',
      'params': {'protocolVersion': '2024-11-05'},
    });
    expect((old.body!['result'] as Map)['protocolVersion'], '2024-11-05');
  });

  test('protocol: tools/call 缺少 name 返回 invalid params', () async {
    final r = await _rpc(client, port, {
      'jsonrpc': '2.0',
      'id': 1,
      'method': 'tools/call',
      'params': {},
    });
    expect((r.body!['error'] as Map)['code'], -32602);
  });

  test('protocol: 未知工具返回 isError 结果而不是协议错误', () async {
    final r = await _rpc(client, port, {
      'jsonrpc': '2.0',
      'id': 1,
      'method': 'tools/call',
      'params': {'name': 'no_such_tool'},
    });
    expect((r.body!['result'] as Map)['isError'], true);
  });

  test('protocol: resources/read 未知 URI 返回 invalid params', () async {
    final r = await _rpc(client, port, {
      'jsonrpc': '2.0',
      'id': 1,
      'method': 'resources/read',
      'params': {'uri': 'ypm://nope'},
    });
    expect((r.body!['error'] as Map)['code'], -32602);
  });

  test('http: /health 可用，未知路径 404，PUT 405', () async {
    final h = await (await client.getUrl(
      Uri.parse('http://127.0.0.1:$port/health'),
    )).close();
    expect(h.statusCode, 200);
    await h.drain<void>();
    final nf = await (await client.getUrl(
      Uri.parse('http://127.0.0.1:$port/nope'),
    )).close();
    expect(nf.statusCode, 404);
    await nf.drain<void>();
    final put = await (await client.openUrl(
      'PUT',
      Uri.parse('http://127.0.0.1:$port/mcp'),
    )).close();
    expect(put.statusCode, 405);
    await put.drain<void>();
  });

  test('session: DELETE 结束会话', () async {
    final init = await _rpc(client, port, {
      'jsonrpc': '2.0',
      'id': 1,
      'method': 'initialize',
    });
    expect(server.sessionCount, 1);
    final req = await client.openUrl(
      'DELETE',
      Uri.parse('http://127.0.0.1:$port/mcp'),
    );
    req.headers.set('Mcp-Session-Id', init.sessionId!);
    await (await req.close()).drain<void>();
    expect(server.sessionCount, 0);
  });

  test('config: 停用后端口释放', () async {
    await server.applyConfig(McpConfig(enabled: false, port: port));
    expect(server.running, isFalse);
    final s = await ServerSocket.bind(InternetAddress.loopbackIPv4, port);
    await s.close();
  });

  // Sessions are managed per the spec: unknown IDs get 404 (the client re-initializes),
  // plain requests without an ID work but leave no session behind.
  test('session: 不认识的会话 404，不带会话不登记', () async {
    final stale = await _rpc(client, port, {
      'jsonrpc': '2.0',
      'id': 1,
      'method': 'ping',
    }, sessionId: 'ypm_old');
    expect(stale.status, HttpStatus.notFound);
    expect(server.sessionCount, 0);

    final anon = await _rpc(client, port, {
      'jsonrpc': '2.0',
      'id': 1,
      'method': 'ping',
    });
    expect(anon.status, HttpStatus.ok);
    expect(anon.sessionId, isNull);
    expect(server.sessionCount, 0);

    // Re-initialize with an expired ID: get a new session
    final init = await _rpc(client, port, {
      'jsonrpc': '2.0',
      'id': 1,
      'method': 'initialize',
    }, sessionId: 'ypm_old');
    expect(init.status, HttpStatus.ok);
    expect(init.sessionId, isNot('ypm_old'));
    expect(server.sessionCount, 1);

    // Notification channel: 400 without a session, 404 for an unknown session
    for (final (sid, code) in [
      (null, HttpStatus.badRequest),
      ('ypm_old', HttpStatus.notFound),
    ]) {
      final req = await client.getUrl(Uri.parse('http://127.0.0.1:$port/mcp'));
      if (sid != null) req.headers.set('Mcp-Session-Id', sid);
      final res = await req.close();
      expect(res.statusCode, code);
      await res.drain<void>();
    }
  });

  test('session: 空闲会话被清掉', () async {
    final before = McpServer.sessionIdle;
    addTearDown(() => McpServer.sessionIdle = before);
    await _rpc(client, port, {
      'jsonrpc': '2.0',
      'id': 1,
      'method': 'initialize',
    });
    expect(server.sessionCount, 1);
    server.dropIdleSessions();
    expect(server.sessionCount, 1);
    McpServer.sessionIdle = Duration.zero;
    await Future<void>.delayed(const Duration(milliseconds: 5));
    server.dropIdleSessions();
    expect(server.sessionCount, 0);
  });

  test('protocol: 空批量是无效请求', () async {
    final r = await _rpc(client, port, []);
    expect(r.status, HttpStatus.badRequest);
    expect((r.body!['error'] as Map)['code'], -32600);
  });

  test('protocol: serverInfo 版本是应用版本', () async {
    final r = await _rpc(client, port, {
      'jsonrpc': '2.0',
      'id': 1,
      'method': 'initialize',
    });
    final info = (r.body!['result'] as Map)['serverInfo'] as Map;
    expect(info['version'], appVersion);
  });

  test('bridge: App 重启后旧会话 404，桥接自动重新 initialize', () async {
    final bridge = await Process.start('dart', [
      'run',
      'bin/ypm_mcp_bridge.dart',
      '--port',
      '$port',
      '--no-auto-launch',
    ]);
    addTearDown(bridge.kill);
    final lines = StreamIterator(
      bridge.stdout.transform(utf8.decoder).transform(const LineSplitter()),
    );
    Future<Map> call(Map msg) async {
      bridge.stdin.writeln(jsonEncode(msg));
      await bridge.stdin.flush();
      expect(await lines.moveNext(), isTrue);
      return jsonDecode(lines.current) as Map;
    }

    final init = await call({
      'jsonrpc': '2.0',
      'id': 1,
      'method': 'initialize',
      'params': {'protocolVersion': '2025-03-26'},
    });
    expect(init['result'], isNotNull);

    // Simulate an app restart: all sessions are lost
    await server.stop();
    server = McpServer(app);
    await server.applyConfig(
      McpConfig(enabled: true, port: port, lazyLoading: true),
    );

    final list = await call({
      'jsonrpc': '2.0',
      'id': 2,
      'method': 'tools/list',
    });
    expect(list['error'], isNull);
    expect((list['result'] as Map)['tools'], isNotEmpty);
  }, timeout: const Timeout(Duration(minutes: 2)));
}
