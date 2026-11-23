import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/mcp/config.dart';
import 'package:yesplaymusic/mcp/json_rpc.dart';

void main() {
  group('McpConfig', () {
    test('fromJson：非 Map 返回默认值', () {
      expect(McpConfig.fromJson(null), const McpConfig());
      expect(McpConfig.fromJson('x'), const McpConfig());
      expect(McpConfig.fromJson([1]), const McpConfig());
    });

    test('fromJson：端口字符串、越界值被解析并夹紧', () {
      expect(McpConfig.fromJson({'port': '20000'}).port, 20000);
      expect(McpConfig.fromJson({'port': 80}).port, 1024);
      expect(McpConfig.fromJson({'port': 99999}).port, 65535);
      expect(McpConfig.fromJson({'port': 'abc'}).port, McpConfig.defaultPort);
      expect(McpConfig.fromJson({'port': 20000.7}).port, 20000);
    });

    test('fromJson：lazyLoading 缺省为 true，其余布尔缺省为 false', () {
      final c = McpConfig.fromJson(<String, Object?>{});
      expect(c.lazyLoading, isTrue);
      expect(c.enabled, isFalse);
      expect(c.readOnly, isFalse);
      expect(c.requireAuth, isFalse);
      expect(McpConfig.fromJson({'lazyLoading': false}).lazyLoading, isFalse);
      // Values other than true don't count as enabled
      expect(McpConfig.fromJson({'enabled': 'true'}).enabled, isFalse);
      expect(McpConfig.fromJson({'token': 123}).token, '');
    });

    test('toJson / fromJson 往返一致', () {
      const c = McpConfig(
        enabled: true,
        port: 23456,
        lazyLoading: false,
        readOnly: true,
        requireAuth: true,
        token: 'abc',
      );
      final back = McpConfig.fromJson(jsonDecode(jsonEncode(c.toJson())));
      expect(back, c);
      expect(back.hashCode, c.hashCode);
    });

    test('copyWith 夹紧端口', () {
      expect(const McpConfig().copyWith(port: 1).port, 1024);
      expect(const McpConfig().copyWith(port: 70000).port, 65535);
    });

    test('generateToken：32 位十六进制且不重复', () {
      final a = McpConfig.generateToken();
      final b = McpConfig.generateToken();
      expect(a, matches(RegExp(r'^[0-9a-f]{32}$')));
      expect(a, isNot(b));
    });

    test('客户端配置片段：仅在启用鉴权且有 token 时带上 token', () {
      const off = McpConfig(port: 20001);
      final http = jsonDecode(off.httpClientConfigJson()) as Map;
      final srv = (http['mcpServers'] as Map)['yesplaymusic'] as Map;
      expect(srv['url'], 'http://127.0.0.1:20001/mcp');
      expect(srv.containsKey('headers'), isFalse);

      const on = McpConfig(port: 20001, requireAuth: true, token: 't0k');
      final http2 = jsonDecode(on.httpClientConfigJson()) as Map;
      final srv2 = (http2['mcpServers'] as Map)['yesplaymusic'] as Map;
      expect((srv2['headers'] as Map)['Authorization'], 'Bearer t0k');

      final stdio = jsonDecode(on.stdioBridgeConfigJson()) as Map;
      final args =
          ((stdio['mcpServers'] as Map)['yesplaymusic'] as Map)['args'] as List;
      expect(args, containsAllInOrder(['--port', '20001', '--token', 't0k']));

      final stdioOff = jsonDecode(off.stdioBridgeConfigJson()) as Map;
      final argsOff =
          ((stdioOff['mcpServers'] as Map)['yesplaymusic'] as Map)['args']
              as List;
      expect(argsOff, isNot(contains('--token')));
    });
  });

  group('json_rpc', () {
    test('result / error / notification 结构', () {
      expect(jsonRpcResult(1, {'a': 1}), {
        'jsonrpc': '2.0',
        'id': 1,
        'result': {'a': 1},
      });
      final e = jsonRpcError('x', -1, 'm');
      expect((e['error'] as Map).containsKey('data'), isFalse);
      final e2 = jsonRpcError('x', -1, 'm', {'d': 1});
      expect((e2['error'] as Map)['data'], {'d': 1});
      expect(jsonRpcNotification('n').containsKey('params'), isFalse);
      expect(jsonRpcNotification('n', {'p': 1})['params'], {'p': 1});
    });

    test('toolResult：字符串原样，其它 JSON 编码，错误带 isError', () {
      final s = toolResult('hi');
      expect(((s['content'] as List).first as Map)['text'], 'hi');
      expect(s.containsKey('isError'), isFalse);
      final j = toolResult({'a': 1}, isError: true);
      expect(((j['content'] as List).first as Map)['text'], '{"a":1}');
      expect(j['isError'], true);
    });
  });
}
