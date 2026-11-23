// YesPlayMusic 本体端 MCP Server（Streamable HTTP + SSE 通知 + 懒加载）。
//
// 仅绑定 127.0.0.1，校验 Origin 防 CSRF/DNS Rebinding，支持可选 Bearer Token。
// 端点：
//   POST   /mcp     JSON-RPC 2.0 请求（initialize / tools/* / resources/* / ping）
//   GET    /mcp     SSE 通知通道（推送 notifications/tools/list_changed）
//   DELETE /mcp     结束会话
//   GET    /health  健康检查（供 stdio 桥接探测 App 是否已启动）

import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math';

import 'package:flutter/foundation.dart';

import '../l10n/l10n.dart';
import '../state.dart';
import '../version.dart';
import 'config.dart';
import 'json_rpc.dart';
import 'resources.dart';
import 'tool_registry.dart';
import 'tools_core.dart';
import 'tools_source.dart';

class McpServer {
  McpServer(this.app, {this.onStatusChanged})
    : registry = McpToolRegistry([...buildCoreTools(), ...buildLazyTools()]);

  final AppState app;
  final void Function()? onStatusChanged;
  final McpToolRegistry registry;

  HttpServer? _http;
  McpConfig _config = const McpConfig();
  final Map<String, McpSession> _sessions = {};
  String? _error;
  String _sourceFingerprint = '';
  bool _listeningState = false;
  Timer? _heartbeat;

  /// SSE 心跳间隔：用来发现已断开的通知通道。
  static const Duration heartbeatInterval = Duration(seconds: 25);

  /// 没有通知通道、这么久没来请求的会话清掉（心跳时检查）。测试里可以改短。
  static Duration sessionIdle = const Duration(minutes: 30);

  McpConfig get config => _config;
  bool get running => _http != null;
  String? get error => _error;
  int get sessionCount => _sessions.length;

  ({int core, int lazy, int total}) get toolCounts =>
      registry.counts(app, _config);

  /// 应用新配置：按需启动、重启（端口变更时）或停止服务。
  Future<void> applyConfig(McpConfig next) async {
    final prev = _config;
    _config = next;

    if (!next.enabled) {
      await stop();
      return;
    }

    final needRestart = _http == null || prev.port != next.port;
    if (needRestart) {
      await _start(next.port);
    } else if (prev.lazyLoading != next.lazyLoading ||
        prev.readOnly != next.readOnly) {
      _broadcastToolsChanged();
      onStatusChanged?.call();
    } else {
      onStatusChanged?.call();
    }
  }

  Future<void> _start(int port) async {
    await stop(notify: false);
    _error = null;
    try {
      final server = await HttpServer.bind(InternetAddress.loopbackIPv4, port);
      _http = server;
      _sourceFingerprint = _computeSourceFingerprint();
      if (!_listeningState) {
        app.addListener(_onAppStateChanged);
        _listeningState = true;
      }
      _heartbeat = Timer.periodic(heartbeatInterval, (_) {
        for (final s in _sessions.values) {
          s.keepAlive();
        }
        dropIdleSessions();
      });
      server.listen(
        _handleHttp,
        onError: (Object e) {
          _error = '$e';
          onStatusChanged?.call();
        },
      );
    } catch (e) {
      _error = L.mcpPortStartFailed(port, '$e');
    }
    onStatusChanged?.call();
  }

  Future<void> stop({bool notify = true}) async {
    _heartbeat?.cancel();
    _heartbeat = null;
    if (_listeningState) {
      app.removeListener(_onAppStateChanged);
      _listeningState = false;
    }
    final sessions = List<McpSession>.of(_sessions.values);
    _sessions.clear();
    for (final s in sessions) {
      await s.close();
    }
    final server = _http;
    _http = null;
    if (server != null) {
      await server.close(force: true);
    }
    _error = null;
    if (notify) onStatusChanged?.call();
  }

  String _computeSourceFingerprint() {
    final entries = [
      for (final s in app.sources.all)
        '${s.id}:${(s.ops.toList()..sort()).join(',')}',
    ]..sort();
    return entries.join('|');
  }

  /// 仅在已加载音乐源或其支持的操作集变化时通知客户端刷新 tools/list，
  /// 避免播放进度刷新（250ms）带来任何额外开销。
  void _onAppStateChanged() {
    if (_sessions.isEmpty) return;
    final fp = _computeSourceFingerprint();
    if (fp == _sourceFingerprint) return;
    _sourceFingerprint = fp;
    _broadcastToolsChanged();
  }

  void _broadcastToolsChanged() {
    for (final s in _sessions.values) {
      s.notify('notifications/tools/list_changed');
    }
  }

  // ───── HTTP 路由与安全校验 ─────

  Future<void> _handleHttp(HttpRequest req) async {
    final res = req.response;
    final path = req.uri.path;

    // 1. Origin 校验（防浏览器 CSRF / DNS Rebinding）
    final origin = req.headers.value('origin');
    if (origin != null && origin.isNotEmpty && !_isLocalOrigin(origin)) {
      res.statusCode = HttpStatus.forbidden;
      res.headers.contentType = ContentType.json;
      res.write(jsonEncode({'error': 'Forbidden origin: $origin'}));
      await res.close();
      return;
    }

    // 2. 健康检查（供 stdio 桥接探测，不泄露任何用户数据）
    if (path == '/health' && req.method == 'GET') {
      res.statusCode = HttpStatus.ok;
      res.headers.contentType = ContentType.json;
      res.write(
        jsonEncode({
          'ok': true,
          'app': 'yesplaymusic',
          'protocolVersion': mcpProtocolVersion,
        }),
      );
      await res.close();
      return;
    }

    if (path != '/mcp' && path != '/') {
      res.statusCode = HttpStatus.notFound;
      await res.close();
      return;
    }

    // 3. 可选 Bearer Token 鉴权
    if (_config.requireAuth && _config.token.isNotEmpty) {
      final auth = req.headers.value(HttpHeaders.authorizationHeader) ?? '';
      if (!_constantTimeEquals(auth, 'Bearer ${_config.token}')) {
        res.statusCode = HttpStatus.unauthorized;
        res.headers.contentType = ContentType.json;
        res.write(jsonEncode({'error': 'Unauthorized: invalid Bearer token'}));
        await res.close();
        return;
      }
    }

    switch (req.method) {
      case 'POST':
        await _handlePost(req);
      case 'GET':
        await _handleSse(req);
      case 'DELETE':
        await _handleDelete(req);
      default:
        res.statusCode = HttpStatus.methodNotAllowed;
        res.headers.set(HttpHeaders.allowHeader, 'GET, POST, DELETE');
        await res.close();
    }
  }

  /// 等长逐字节比较，避免按前缀匹配长度泄露 token 的计时差异。
  static bool _constantTimeEquals(String a, String b) {
    final x = utf8.encode(a), y = utf8.encode(b);
    var diff = x.length ^ y.length;
    for (var i = 0; i < y.length; i++) {
      diff |= (i < x.length ? x[i] : 0) ^ y[i];
    }
    return diff == 0;
  }

  static bool _isLocalOrigin(String origin) {
    // `Origin: null` 来自 sandbox iframe、file:// 页面等不透明来源，任何网页都能伪造，
    // 不能当作本机来源放行。
    if (origin == 'null') return false;
    final uri = Uri.tryParse(origin);
    if (uri == null) return false;
    final host = uri.host.toLowerCase();
    return host == 'localhost' || host == '127.0.0.1' || host == '::1';
  }

  String _newSessionId() {
    final rng = Random.secure();
    final sb = StringBuffer('ypm_');
    for (var i = 0; i < 16; i++) {
      sb.write(rng.nextInt(256).toRadixString(16).padLeft(2, '0'));
    }
    return sb.toString();
  }

  /// 清掉空闲的会话：没有通知通道，而且超过 [sessionIdle] 没来请求。
  @visibleForTesting
  void dropIdleSessions() {
    final now = DateTime.now();
    final idle = [
      for (final e in _sessions.entries)
        if (e.value.sseCount == 0 &&
            now.difference(e.value.lastSeen) > sessionIdle)
          e.key,
    ];
    if (idle.isEmpty) return;
    for (final id in idle) {
      _sessions.remove(id)?.close().ignore();
    }
    onStatusChanged?.call();
  }

  /// 这个请求用的会话（MCP 规范的会话管理）：
  /// - 带着认识的会话 ID：就是它；
  /// - 带着不认识的 ID（过期了、App 重启过）：返回 null，调用方回 404，
  ///   客户端按规范重新 initialize；
  /// - 没带 ID：initialize 时新建并登记；其他请求用一个不登记的临时会话，
  ///   兼容不管会话的简单客户端，又不会每个请求都留下一个会话。
  McpSession? _sessionFor(HttpRequest req, {bool initialize = false}) {
    final sid = req.headers.value('mcp-session-id');
    if (sid != null && sid.isNotEmpty) {
      final s = _sessions[sid];
      if (s != null) {
        s.lastSeen = DateTime.now();
        return s;
      }
      if (!initialize) return null;
    }
    if (!initialize) return McpSession(_newSessionId());
    final id = _newSessionId();
    final s = _sessions[id] = McpSession(id);
    onStatusChanged?.call();
    return s;
  }

  Future<void> _sessionNotFound(HttpResponse res) async {
    res.statusCode = HttpStatus.notFound;
    res.headers.contentType = ContentType.json;
    res.write(
      jsonEncode(
        jsonRpcError(null, JsonRpcCode.invalidRequest, 'Session not found'),
      ),
    );
    await res.close();
  }

  Future<void> _handlePost(HttpRequest req) async {
    final res = req.response;
    res.headers.contentType = ContentType.json;

    // MCP 规定 POST 必须是 application/json。text/plain 之类的“简单请求”浏览器不做
    // CORS 预检，放行它们等于允许任意网页跨站触发工具调用。
    if (req.headers.contentType?.mimeType != 'application/json') {
      res.statusCode = HttpStatus.unsupportedMediaType;
      res.write(
        jsonEncode(
          jsonRpcError(
            null,
            JsonRpcCode.invalidRequest,
            'Content-Type must be application/json',
          ),
        ),
      );
      await res.close();
      return;
    }

    String body;
    try {
      body = await utf8.decoder.bind(req).join();
    } catch (e) {
      res.statusCode = HttpStatus.badRequest;
      res.write(jsonEncode(jsonRpcError(null, JsonRpcCode.parseError, '$e')));
      await res.close();
      return;
    }

    Object? decoded;
    try {
      decoded = jsonDecode(body);
    } on FormatException catch (e) {
      res.statusCode = HttpStatus.badRequest;
      res.write(
        jsonEncode(
          jsonRpcError(
            null,
            JsonRpcCode.parseError,
            'Invalid JSON: ${e.message}',
          ),
        ),
      );
      await res.close();
      return;
    }

    bool isInit(Object? m) => m is Map && m['method'] == 'initialize';
    final session = _sessionFor(
      req,
      initialize: decoded is List ? decoded.any(isInit) : isInit(decoded),
    );
    if (session == null) return _sessionNotFound(res);
    // 临时会话不给 ID：客户端下次还是不带，不会撞上 404
    if (_sessions.containsKey(session.id)) {
      res.headers.set('Mcp-Session-Id', session.id);
    }

    if (decoded is List && decoded.isEmpty) {
      // JSON-RPC 2.0：空数组是无效请求
      res.statusCode = HttpStatus.badRequest;
      res.write(
        jsonEncode(
          jsonRpcError(null, JsonRpcCode.invalidRequest, 'Empty batch'),
        ),
      );
      await res.close();
      return;
    }

    if (decoded is List) {
      final responses = <Map<String, Object?>>[];
      for (final item in decoded) {
        if (item is Map) {
          final r = await _dispatch(item.cast<String, Object?>(), session);
          if (r != null) responses.add(r);
        } else {
          responses.add(
            jsonRpcError(null, JsonRpcCode.invalidRequest, 'Invalid request'),
          );
        }
      }
      if (responses.isEmpty) {
        res.statusCode = HttpStatus.accepted;
      } else {
        res.statusCode = HttpStatus.ok;
        res.write(jsonEncode(responses));
      }
      await res.close();
      return;
    }

    if (decoded is! Map) {
      res.statusCode = HttpStatus.badRequest;
      res.write(
        jsonEncode(
          jsonRpcError(
            null,
            JsonRpcCode.invalidRequest,
            'Expected JSON object',
          ),
        ),
      );
      await res.close();
      return;
    }

    final reply = await _dispatch(decoded.cast<String, Object?>(), session);
    if (reply == null) {
      res.statusCode = HttpStatus.accepted;
    } else {
      res.statusCode = HttpStatus.ok;
      res.write(jsonEncode(reply));
    }
    await res.close();
  }

  Future<void> _handleSse(HttpRequest req) async {
    final res = req.response;
    // 通知通道只能挂在 initialize 建立的会话上
    final sid = req.headers.value('mcp-session-id');
    final session = sid == null ? null : _sessions[sid];
    if (session == null) {
      if (sid == null || sid.isEmpty) {
        res.statusCode = HttpStatus.badRequest;
        await res.close();
        return;
      }
      return _sessionNotFound(res);
    }
    session.lastSeen = DateTime.now();
    res.statusCode = HttpStatus.ok;
    res.headers.set(
      HttpHeaders.contentTypeHeader,
      'text/event-stream; charset=utf-8',
    );
    res.headers.set(HttpHeaders.cacheControlHeader, 'no-cache');
    res.headers.set('Mcp-Session-Id', session.id);

    await session.serveSse(res, onAttached: onStatusChanged);
    onStatusChanged?.call();
  }

  Future<void> _handleDelete(HttpRequest req) async {
    final res = req.response;
    final sid = req.headers.value('mcp-session-id');
    if (sid != null) {
      final removed = _sessions.remove(sid);
      await removed?.close();
      onStatusChanged?.call();
    }
    res.statusCode = HttpStatus.ok;
    await res.close();
  }

  // ───── JSON-RPC 2.0 / MCP 方法分发 ─────

  Future<Map<String, Object?>?> _dispatch(
    Map<String, Object?> msg,
    McpSession session,
  ) async {
    final hasId = msg.containsKey('id');
    final id = msg['id'];
    final method = msg['method'];
    if (method is! String || method.isEmpty) {
      if (!hasId) return null;
      return jsonRpcError(id, JsonRpcCode.invalidRequest, 'Missing method');
    }
    final params = msg['params'] is Map
        ? (msg['params'] as Map).cast<String, Object?>()
        : const <String, Object?>{};

    // 通知（无 id）直接处理且不返回响应体。
    if (!hasId) {
      if (method == 'notifications/initialized') {
        session.initialized = true;
      }
      return null;
    }

    try {
      final Object result = switch (method) {
        'initialize' => _onInitialize(params, session),
        'ping' => const <String, Object?>{},
        'tools/list' => {'tools': registry.listTools(app, _config, session)},
        'tools/call' => await _onToolsCall(params, session),
        'resources/list' => {'resources': mcpResourceDescriptors},
        'resources/read' => _onResourcesRead(params),
        _ => throw JsonRpcException(
          JsonRpcCode.methodNotFound,
          'Method not found: $method',
        ),
      };
      return jsonRpcResult(id, result);
    } on JsonRpcException catch (e) {
      return jsonRpcError(id, e.code, e.message, e.data);
    } catch (e) {
      return jsonRpcError(id, JsonRpcCode.internalError, '$e');
    }
  }

  Map<String, Object?> _onInitialize(
    Map<String, Object?> params,
    McpSession session,
  ) {
    session.initialized = true;
    final reqVer = params['protocolVersion'] is String
        ? params['protocolVersion'] as String
        : mcpProtocolVersion;
    final negotiated = mcpSupportedVersions.contains(reqVer)
        ? reqVer
        : mcpProtocolVersion;

    return {
      'protocolVersion': negotiated,
      'capabilities': {
        'tools': {'listChanged': true},
        'resources': const <String, Object?>{},
      },
      'serverInfo': {'name': 'yesplaymusic', 'version': appVersion},
      'instructions': _config.lazyLoading
          ? 'YesPlayMusic MCP Server (lazy-loading mode). Core playback/search/queue '
                'tools are directly available. Call ypm_discover_tools(category or query) '
                'to inspect and unlock additional toolsets (lyrics, playlist, library, '
                'discovery, radio, comments, sources, navigation), then call them directly '
                'or via ypm_call_tool.'
          : 'YesPlayMusic MCP Server (full-exposure mode). All tools supported by currently '
                'loaded music sources are available directly.',
    };
  }

  Future<Map<String, Object?>> _onToolsCall(
    Map<String, Object?> params,
    McpSession session,
  ) async {
    final name = params['name'];
    if (name is! String || name.isEmpty) {
      throw const JsonRpcException(
        JsonRpcCode.invalidParams,
        'Missing tool "name".',
      );
    }
    final args = params['arguments'] is Map
        ? (params['arguments'] as Map).cast<String, Object?>()
        : const <String, Object?>{};
    return registry.callTool(name, args, app, _config, session);
  }

  Map<String, Object?> _onResourcesRead(Map<String, Object?> params) {
    final uri = params['uri'];
    if (uri is! String || uri.isEmpty) {
      throw const JsonRpcException(
        JsonRpcCode.invalidParams,
        'Missing resource "uri".',
      );
    }
    return readMcpResource(uri, app);
  }
}
