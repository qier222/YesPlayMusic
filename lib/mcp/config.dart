// MCP server config model: persisted in the `mcp` field of prefs.json.

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

  /// Whether the local MCP server is enabled (listening on 127.0.0.1:[port]).
  final bool enabled;

  /// Listening port (1024–65535).
  final int port;

  /// Lazy mode: when on, tools/list exposes only core tools + the discover/call meta tools,
  /// and extended tools are discovered and unlocked on demand; when off, every tool the current source supports is exposed.
  final bool lazyLoading;

  /// Read-only safe mode: blocks tools that modify remote/user data (editing or deleting playlists, posting comments, like/dislike, etc.).
  final bool readOnly;

  /// Whether Bearer token auth is required.
  final bool requireAuth;

  /// Bearer token; generated automatically if empty when auth is enabled.
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

  /// Generates a random 32-digit hex token.
  static String generateToken() {
    final rng = Random.secure();
    final sb = StringBuffer();
    for (var i = 0; i < 16; i++) {
      sb.write(rng.nextInt(256).toRadixString(16).padLeft(2, '0'));
    }
    return sb.toString();
  }

  /// Streamable HTTP client config snippet (works for Cursor / Antigravity / Claude, etc.).
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

  /// stdio bridge client config snippet (for clients that only support stdio; can wake the app automatically).
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
