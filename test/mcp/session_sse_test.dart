import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/mcp/tool_registry.dart';

/// Starts a local server with only SSE attached, returning the session, the text the client received, and a cleanup function.
Future<
  ({
    McpSession session,
    StringBuffer received,
    Future<void> Function() disconnect,
    Future<void> Function() dispose,
  })
>
_sse() async {
  final server = await HttpServer.bind(InternetAddress.loopbackIPv4, 0);
  final session = McpSession('s');
  final attached = Completer<void>();
  server.listen((req) async {
    req.response.headers.contentType = ContentType('text', 'event-stream');
    await session.serveSse(req.response, onAttached: attached.complete);
  });
  final client = HttpClient();
  final req = await client.getUrl(
    Uri.parse('http://127.0.0.1:${server.port}/'),
  );
  final res = await req.close();
  final buf = StringBuffer();
  final sub = res.transform(utf8.decoder).listen(buf.write, onError: (_) {});
  await attached.future;
  return (
    session: session,
    received: buf,
    disconnect: () async {
      await sub.cancel();
      client.close(force: true);
    },
    dispose: () async {
      await sub.cancel();
      client.close(force: true);
      await server.close(force: true);
    },
  );
}

void main() {
  setUpAll(() => McpSession.writeTimeout = const Duration(milliseconds: 300));
  test('连续推送多条通知，SSE 通道不丢、顺序不乱', () async {
    final h = await _sse();
    h.session.notify('a');
    h.session.notify('b');
    h.session.notify('c', {'x': 1});
    await Future<void>.delayed(const Duration(milliseconds: 200));
    expect(h.session.sseCount, 1);
    final text = h.received.toString();
    final a = text.indexOf('"method":"a"');
    final b = text.indexOf('"method":"b"');
    final c = text.indexOf('"method":"c"');
    expect([a, b, c].every((i) => i >= 0), isTrue, reason: text);
    expect(a < b && b < c, isTrue);
    expect(text, contains('"params":{"x":1}'));
    await h.dispose();
  });

  test('客户端断开后推送：通道被移除，不抛未捕获异常', () async {
    final h = await _sse();
    await h.disconnect();
    // No heartbeat: the read side's onDone notices the peer closing.
    for (var i = 0; i < 40 && h.session.sseCount > 0; i++) {
      await Future<void>.delayed(const Duration(milliseconds: 50));
    }
    expect(h.session.sseCount, 0);
    // Pushing after removal must not throw an uncaught exception either (the test zone would report it).
    h.session.keepAlive();
    h.session.notify('late');
    await Future<void>.delayed(const Duration(milliseconds: 100));
    await h.dispose();
  });

  test('close 关闭所有通道', () async {
    final h = await _sse();
    await h.session.close();
    expect(h.session.sseCount, 0);
    h.session.notify('noop');
    await h.dispose();
  });
}
