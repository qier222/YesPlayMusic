// YesPlayMusic's in-app MCP server (Streamable HTTP + SSE notifications + lazy loading).
//
// Binds to 127.0.0.1 only, checks Origin against CSRF/DNS rebinding, optional Bearer token.
// Endpoints:
//   POST   /mcp     JSON-RPC 2.0 requests (initialize / tools/* / resources/* / ping)
//   GET    /mcp     SSE notification channel (pushes notifications/tools/list_changed)
//   DELETE /mcp     ends the session
//   GET    /health  health check (lets the stdio bridge detect whether the app is running)

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

  /// SSE heartbeat interval: used to detect disconnected notification channels.
  static const Duration heartbeatInterval = Duration(seconds: 25);

  /// Sessions without a notification channel and no requests for this long are removed (checked on heartbeat). Tests can shorten it.
  static Duration sessionIdle = const Duration(minutes: 30);

  McpConfig get config => _config;
  bool get running => _http != null;
  String? get error => _error;
  int get sessionCount => _sessions.length;

  ({int core, int lazy, int total}) get toolCounts =>
      registry.counts(app, _config);

  /// Applies a new config: starts, restarts (on port change) or stops the server as needed.
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

  /// Tells clients to refresh tools/list only when the loaded source or its supported ops change,
  /// so playback progress updates (250ms) add no overhead.
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

  // ───── HTTP routing and security checks ─────

  Future<void> _handleHttp(HttpRequest req) async {
    final res = req.response;
    final path = req.uri.path;

    // 1. Origin check (against browser CSRF / DNS rebinding)
    final origin = req.headers.value('origin');
    if (origin != null && origin.isNotEmpty && !_isLocalOrigin(origin)) {
      res.statusCode = HttpStatus.forbidden;
      res.headers.contentType = ContentType.json;
      res.write(jsonEncode({'error': 'Forbidden origin: $origin'}));
      await res.close();
      return;
    }

    // 2. Health check (for the stdio bridge; leaks no user data)
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

    // 3. Optional Bearer token auth
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

  /// Constant-time byte comparison, so prefix-match timing can't leak the token.
  static bool _constantTimeEquals(String a, String b) {
    final x = utf8.encode(a), y = utf8.encode(b);
    var diff = x.length ^ y.length;
    for (var i = 0; i < y.length; i++) {
      diff |= (i < x.length ? x[i] : 0) ^ y[i];
    }
    return diff == 0;
  }

  static bool _isLocalOrigin(String origin) {
    // `Origin: null` comes from opaque origins such as sandboxed iframes and file:// pages; any web page can forge it,
    // so it must not be allowed as a local origin.
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

  /// Removes idle sessions: no notification channel and no request for over [sessionIdle].
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

  /// The session for this request (MCP spec session management):
  /// - a known session ID: that session;
  /// - an unknown ID (expired, or the app restarted): returns null, the caller answers 404,
  ///   and the client re-initializes per the spec;
  /// - no ID: on initialize a new session is created and registered; other requests get an unregistered temporary session,
  ///   which supports simple clients that ignore sessions without leaving a session behind per request.
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

    // MCP requires POST to be application/json. Browsers skip the CORS preflight for "simple requests" like text/plain,
    // so allowing them would let any web page trigger tool calls cross-site.
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
    // Temporary sessions get no ID: the client keeps sending none and won't hit 404
    if (_sessions.containsKey(session.id)) {
      res.headers.set('Mcp-Session-Id', session.id);
    }

    if (decoded is List && decoded.isEmpty) {
      // JSON-RPC 2.0: an empty array is an invalid request
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
    // The notification channel can only attach to a session created by initialize
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

  // ───── JSON-RPC 2.0 / MCP method dispatch ─────

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

    // Notifications (no id) are handled directly with no response body.
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
