// MCP Server 配置模型：持久化在 prefs.json 的 `mcp` 字段里。

import 'dart:convert';
import 'dart:math';

class McpConfig {
  const McpConfig({
    this.enabled = false,
    this.port = defaultPort,
    this.lazyLoading = true,
    this.readOnly = false,
    this.requireAuth = false,
    this.token = '',
  });

  static const int defaultPort = 18888;

  /// 是否启用本地 MCP Server（监听 127.0.0.1:[port]）。
  final bool enabled;

  /// 监听端口（1024~65535）。
  final int port;

  /// 懒加载模式：开启后 tools/list 仅暴露核心工具 + discover/call 元工具，
  /// 按需发现并解锁扩展工具；关闭后全量暴露当前源支持的所有工具。
  final bool lazyLoading;

  /// 只读安全模式：屏蔽会修改远程/用户数据的工具（删改歌单、发评论、喜欢/不喜欢等）。
  final bool readOnly;

  /// 是否要求 Bearer Token 鉴权。
  final bool requireAuth;

  /// Bearer Token；启用鉴权时若为空会自动生成。
  final String token;

  String get endpointUrl => 'http://127.0.0.1:$port/mcp';

  McpConfig copyWith({
    bool? enabled,
    int? port,
    bool? lazyLoading,
    bool? readOnly,
    bool? requireAuth,
    String? token,
  }) => McpConfig(
    enabled: enabled ?? this.enabled,
    port: (port ?? this.port).clamp(1024, 65535),
    lazyLoading: lazyLoading ?? this.lazyLoading,
    readOnly: readOnly ?? this.readOnly,
    requireAuth: requireAuth ?? this.requireAuth,
    token: token ?? this.token,
  );

  factory McpConfig.fromJson(Object? raw) {
    if (raw is! Map) return const McpConfig();
    final portRaw = raw['port'];
    final parsedPort = portRaw is num
        ? portRaw.toInt()
        : int.tryParse('$portRaw') ?? defaultPort;
    return McpConfig(
      enabled: raw['enabled'] == true,
      port: parsedPort.clamp(1024, 65535),
      lazyLoading: raw['lazyLoading'] != false,
      readOnly: raw['readOnly'] == true,
      requireAuth: raw['requireAuth'] == true,
      token: raw['token'] is String ? raw['token'] as String : '',
    );
  }

  Map<String, Object?> toJson() => {
    'enabled': enabled,
    'port': port,
    'lazyLoading': lazyLoading,
    'readOnly': readOnly,
    'requireAuth': requireAuth,
    'token': token,
  };

  /// 生成 32 位十六进制随机 Token。
  static String generateToken() {
    final rng = Random.secure();
    final sb = StringBuffer();
    for (var i = 0; i < 16; i++) {
      sb.write(rng.nextInt(256).toRadixString(16).padLeft(2, '0'));
    }
    return sb.toString();
  }

  /// Streamable HTTP 客户端配置片段（Cursor / Antigravity / Claude 等通用）。
  String httpClientConfigJson() {
    final server = <String, Object?>{
      'url': endpointUrl,
      if (requireAuth && token.isNotEmpty)
        'headers': {'Authorization': 'Bearer $token'},
    };
    return const JsonEncoder.withIndent('  ').convert({
      'mcpServers': {'yesplaymusic': server},
    });
  }

  /// stdio 桥接客户端配置片段（适用于仅支持 stdio 的客户端，支持自动唤醒 App）。
  String stdioBridgeConfigJson({
    String bridgeScript = 'bin/ypm_mcp_bridge.dart',
  }) {
    final args = <String>[
      'run',
      bridgeScript,
      '--port',
      '$port',
      if (requireAuth && token.isNotEmpty) ...['--token', token],
    ];
    return const JsonEncoder.withIndent('  ').convert({
      'mcpServers': {
        'yesplaymusic': {'command': 'dart', 'args': args},
      },
    });
  }

  @override
  bool operator ==(Object other) =>
      other is McpConfig &&
      other.enabled == enabled &&
      other.port == port &&
      other.lazyLoading == lazyLoading &&
      other.readOnly == readOnly &&
      other.requireAuth == requireAuth &&
      other.token == token;

  @override
  int get hashCode =>
      Object.hash(enabled, port, lazyLoading, readOnly, requireAuth, token);
}
