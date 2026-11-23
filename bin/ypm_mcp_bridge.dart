// YesPlayMusic MCP stdio-to-Streamable-HTTP 桥接脚本。
//
// 用于只支持 stdio 传输的 MCP 客户端：
//   dart run bin/ypm_mcp_bridge.dart [--port 18888] [--token <token>] [--no-auto-launch]
//
// 收到第一个请求时探测 http://127.0.0.1:<port>/health；
// 若 YesPlayMusic 尚未运行且未禁用 --no-auto-launch（macOS），会尝试后台唤醒 App 并等待就绪。

import 'dart:async';
import 'dart:convert';
import 'dart:io';

Future<void> main(List<String> args) async {
  var port = int.tryParse(Platform.environment['YPM_MCP_PORT'] ?? '') ?? 18888;
  var token = Platform.environment['YPM_MCP_TOKEN'] ?? '';
  var autoLaunch = true;

  for (var i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--port':
        if (i + 1 < args.length) {
          port = int.tryParse(args[++i]) ?? port;
        }
      case '--token':
        if (i + 1 < args.length) token = args[++i];
      case '--no-auto-launch':
        autoLaunch = false;
    }
  }

  final client = HttpClient()..connectionTimeout = const Duration(seconds: 5);
  final endpoint = Uri.parse('http://127.0.0.1:$port/mcp');
  final healthUrl = Uri.parse('http://127.0.0.1:$port/health');
  String? sessionId;
  var ensured = false;

  Future<bool> isHealthy() async {
    try {
      final req = await client.getUrl(healthUrl);
      final res = await req.close();
      await res.drain<void>();
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  Future<void> ensureAppRunning() async {
    if (ensured) return;
    if (await isHealthy()) {
      ensured = true;
      return;
    }
    if (!autoLaunch || !Platform.isMacOS) return;
    try {
      await Process.run('open', ['-g', '-a', 'YesPlayMusic']);
    } catch (_) {
      return;
    }
    for (var attempt = 0; attempt < 24; attempt++) {
      await Future<void>.delayed(const Duration(milliseconds: 350));
      if (await isHealthy()) {
        ensured = true;
        return;
      }
    }
  }

  // 最近一次 initialize 请求原文：App 重启后旧会话失效（404），用它重新建会话
  String? lastInitialize;

  Future<(int, String)> post(String body) async {
    final req = await client.postUrl(endpoint);
    req.headers.contentType = ContentType.json;
    req.headers.set(HttpHeaders.acceptHeader, 'application/json');
    if (token.isNotEmpty) {
      req.headers.set(HttpHeaders.authorizationHeader, 'Bearer $token');
    }
    if (sessionId != null) {
      req.headers.set('Mcp-Session-Id', sessionId!);
    }
    req.write(body);
    final res = await req.close();
    final nextSid = res.headers.value('mcp-session-id');
    if (nextSid != null && nextSid.isNotEmpty) sessionId = nextSid;
    return (res.statusCode, await utf8.decoder.bind(res).join());
  }

  Future<void> forwardLine(String line) async {
    final trimmed = line.trim();
    if (trimmed.isEmpty) return;

    Object? parsedId;
    try {
      final obj = jsonDecode(trimmed);
      if (obj is Map && obj.containsKey('id')) parsedId = obj['id'];
      if (obj is Map && obj['method'] == 'initialize') {
        lastInitialize = trimmed;
        // 客户端主动重新初始化：不带旧会话
        sessionId = null;
      }
    } catch (_) {}

    await ensureAppRunning();

    try {
      var (status, body) = await post(trimmed);
      final init = lastInitialize;
      if (status == HttpStatus.notFound &&
          sessionId != null &&
          init != null &&
          init != trimmed) {
        // 会话没了（App 重启或空闲被清理）：重新 initialize 再重试一次
        sessionId = null;
        await post(init);
        if (sessionId != null) {
          await post(
            jsonEncode({
              'jsonrpc': '2.0',
              'method': 'notifications/initialized',
            }),
          );
        }
        (status, body) = await post(trimmed);
      }
      if (status == HttpStatus.accepted || body.trim().isEmpty) {
        return;
      }
      if (status >= 400 && parsedId != null) {
        stdout.writeln(
          jsonEncode({
            'jsonrpc': '2.0',
            'id': parsedId,
            'error': {'code': -32000, 'message': 'HTTP $status: $body'},
          }),
        );
        return;
      }
      stdout.writeln(body.trim());
    } catch (e) {
      if (parsedId != null) {
        stdout.writeln(
          jsonEncode({
            'jsonrpc': '2.0',
            'id': parsedId,
            'error': {
              'code': -32001,
              'message':
                  'Cannot connect to YesPlayMusic MCP Server on 127.0.0.1:$port ($e). '
                  'Make sure YesPlayMusic is running and MCP Server is enabled in Settings.',
            },
          }),
        );
      }
    }
  }

  await for (final line
      in stdin.transform(utf8.decoder).transform(const LineSplitter())) {
    await forwardLine(line);
  }
  client.close(force: true);
}
