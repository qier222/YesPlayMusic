// MCP tool registry, session state and lazy dispatcher.
//
// Supports two lazy-loading modes:
// 1. Generic progressive lazy loading (default): tools/list returns only core tools + ypm_discover_tools +
//    ypm_call_tool; the LLM gets extended tool schemas via discover, then runs them with ypm_call_tool.
// 2. Dynamic hot refresh (for clients that support notifications/tools/list_changed): after discover or
//    enable, the tools are registered on the current session and a list_changed notification is pushed; the client
//    can then call the real tool names directly.

import 'dart:async';
import 'dart:convert';
import 'dart:io';

import '../music/source.dart';
import '../state.dart';
import 'config.dart';
import 'json_rpc.dart';

typedef McpToolHandler = Future<Object?> Function(
  Map<String, Object?> args,
  McpCallContext ctx,
);

class McpCallContext {
  const McpCallContext({
    required this.app,
    required this.config,
    required this.session,
    required this.registry,
  });

  final AppState app;
  final McpConfig config;
  final McpSession session;
  final McpToolRegistry registry;
}

class McpTool {
  const McpTool({
    required this.name,
    required this.category,
    required this.description,
    required this.inputSchema,
    required this.handler,
    this.core = false,
    this.meta = false,
    this.readOnly = true,
    this.destructive = false,
    this.idempotent = true,
    this.mutatesData = false,
    this.requiredOp,
    this.anyOps = const [],
  });

  final String name;
  final String category;
  final String description;
  final Map<String, Object?> inputSchema;
  final McpToolHandler handler;

  /// Whether exposed directly from the start in lazy mode.
  final bool core;

  /// Whether this is a lazy meta tool (ypm_discover_tools / ypm_call_tool).
  /// Meta tools are hidden in full exposure mode to reduce noise.
  final bool meta;

  /// MCP Tool Annotations。
  final bool readOnly;
  final bool destructive;
  final bool idempotent;

  /// Whether it modifies remote/user persistent data (playlists, likes, comments, dislikes, etc.).
  /// Blocked when `config.readOnly` is enabled.
  final bool mutatesData;

  /// The single source Op it depends on; empty means no specific Op.
  final String? requiredOp;

  /// Available if any one of these Ops is supported.
  final List<String> anyOps;

  Map<String, Object?> toMcpSchema() => {
    'name': name,
    'description': description,
    'inputSchema': inputSchema,
    'annotations': {
      'readOnlyHint': readOnly,
      'destructiveHint': destructive,
      'idempotentHint': idempotent,
      'openWorldHint': false,
    },
  };

  Map<String, Object?> toSummary() => {
    'name': name,
    'category': category,
    'description': description,
    if (mutatesData) 'mutatesData': true,
    if (destructive) 'destructive': true,
  };
}

/// One MCP client session, tracking the tools it has unlocked lazily and its active SSE streams.
class McpSession {
  McpSession(this.id);

  final String id;
  bool initialized = false;
  DateTime lastSeen = DateTime.now();

  /// Lazy categories and tool names this session has unlocked dynamically.
  final Set<String> enabledCategories = {};
  final Set<String> enabledTools = {};

  /// SSE notification channels attached to this session (GET /mcp), see [serveSse].
  final List<IOSink> _sseStreams = [];

  /// The last flush on each SSE channel; writes must be serialized:
  /// writing again before a flush completes throws StateError, so sending two notifications back to back would wrongly mark the channel as disconnected.
  final Map<IOSink, Future<void>> _pending = {};

  /// Completes when the channel is removed, so the GET /mcp handler can stop waiting.
  final Map<IOSink, Completer<void>> _detached = {};

  /// After the peer disconnects, flush hangs forever and `res.done` never fires; only a timeout finds dead connections.
  /// Tests shorten it.
  static Duration writeTimeout = const Duration(seconds: 5);

  int get sseCount => _sseStreams.length;

  /// Attaches [res] to the session as an SSE channel, returning only when the peer disconnects or the channel is removed.
  /// The caller sets the status code and headers (Content-Type etc.) first; this handles the rest.
  ///
  /// HttpResponse swallows SocketExceptions from a disconnected peer (later writes are silently dropped, flush still succeeds,
  /// and done never fires), so after writing the headers we take the raw Socket: failed writes then throw,
  /// and the read side's onDone notices the disconnect right away.
  Future<void> serveSse(HttpResponse res, {void Function()? onAttached}) async {
    // No chunking, read until the connection closes: after detach, write to the socket directly.
    res.headers.chunkedTransferEncoding = false;
    res.persistentConnection = false;
    final Socket socket;
    try {
      socket = await res.detachSocket();
      socket.write(': connected\n\n');
      await socket.flush();
    } catch (_) {
      return;
    }

    final closed = Completer<void>();
    void done([Object? _]) {
      if (!closed.isCompleted) closed.complete();
    }

    final sub = socket.listen(
      (_) {},
      onDone: done,
      onError: done,
      cancelOnError: true,
    );
    final detached = attachSse(socket);
    onAttached?.call();
    try {
      await Future.any([closed.future, detached]);
    } finally {
      detachSse(socket);
      await sub.cancel();
      socket.destroy();
    }
  }

  /// Attaches an SSE channel; the returned Future completes when the channel is removed (disconnect, timeout, session closed).
  Future<void> attachSse(IOSink res) {
    _sseStreams.add(res);
    return (_detached[res] ??= Completer<void>()).future;
  }

  void detachSse(IOSink res) {
    _sseStreams.remove(res);
    _pending.remove(res);
    final c = _detached.remove(res);
    if (c != null && !c.isCompleted) c.complete();
  }

  /// Pushes a JSON-RPC notification to every SSE channel of this session.
  void notify(String method, [Map<String, Object?>? params]) {
    _broadcast(
      'event: message\ndata: ${jsonEncode(jsonRpcNotification(method, params))}\n\n',
    );
  }

  /// SSE comment-line heartbeat: clients ignore it, the server uses it to find disconnected connections.
  void keepAlive() => _broadcast(': ping\n\n');

  void _broadcast(String payload) {
    if (_sseStreams.isEmpty) return;
    for (final s in List<IOSink>.of(_sseStreams)) {
      final prev = _pending[s] ?? Future<void>.value();
      _pending[s] = prev
          .then((_) async {
            if (!_sseStreams.contains(s)) return;
            s.write(payload);
            await s.flush().timeout(writeTimeout);
          })
          .catchError((Object _) {
            // Client disconnected or write timed out: remove the channel instead of letting the error bubble up as uncaught.
            detachSse(s);
          });
    }
  }

  Future<void> close() async {
    final streams = List<IOSink>.of(_sseStreams);
    for (final s in streams) {
      detachSse(s);
    }
    for (final s in streams) {
      try {
        await s.close().timeout(writeTimeout);
      } catch (_) {}
    }
  }
}

class McpToolRegistry {
  McpToolRegistry(List<McpTool> tools) {
    for (final t in tools) {
      _tools[t.name] = t;
    }
  }

  final Map<String, McpTool> _tools = {};

  Iterable<McpTool> get all => _tools.values;
  McpTool? operator [](String name) => _tools[name];

  /// Whether the tool is available with the currently loaded sources and config.
  bool isAvailable(McpTool tool, AppState app, McpConfig config) {
    if (config.readOnly && tool.mutatesData) return false;
    if (tool.requiredOp != null) {
      final hasOp = app.sources.all.any((s) => s.can(tool.requiredOp!));
      if (!hasOp) return false;
    }
    if (tool.anyOps.isNotEmpty) {
      final hasAny = app.sources.all.any(
        (s) => tool.anyOps.any((op) => s.can(op)),
      );
      if (!hasAny) return false;
    }
    return true;
  }

  /// Counts all currently available tools (core / lazy) for the settings page.
  ({int core, int lazy, int total}) counts(AppState app, McpConfig config) {
    var core = 0, lazy = 0;
    for (final t in _tools.values) {
      if (t.meta) continue;
      if (!isAvailable(t, app, config)) continue;
      if (t.core) {
        core++;
      } else {
        lazy++;
      }
    }
    return (core: core, lazy: lazy, total: core + lazy);
  }

  /// Builds the tool list returned by `tools/list`.
  List<Map<String, Object?>> listTools(
    AppState app,
    McpConfig config,
    McpSession session,
  ) {
    final out = <Map<String, Object?>>[];
    for (final t in _tools.values) {
      if (!isAvailable(t, app, config)) continue;
      if (!config.lazyLoading) {
        // Full mode: expose every real tool directly, omitting the lazy meta tools.
        if (!t.meta) out.add(t.toMcpSchema());
        continue;
      }
      // Lazy mode: expose core tools, meta tools and extended tools this session has unlocked.
      if (t.core ||
          t.meta ||
          session.enabledCategories.contains(t.category) ||
          session.enabledTools.contains(t.name)) {
        out.add(t.toMcpSchema());
      }
    }
    return out;
  }

  /// Lazy discovery entry: lists extended tools and their schemas by category or keyword, optionally unlocking them for this session.
  Map<String, Object?> discoverTools(
    AppState app,
    McpConfig config,
    McpSession session, {
    String? category,
    String? query,
    bool includeSchema = true,
    bool enable = true,
  }) {
    final catFilter = category?.trim().toLowerCase() ?? '';
    final q = query?.trim().toLowerCase() ?? '';

    final availableLazy = [
      for (final t in _tools.values)
        if (!t.core && !t.meta && isAvailable(t, app, config)) t,
    ];

    final categoryCounts = <String, int>{};
    for (final t in availableLazy) {
      categoryCounts[t.category] = (categoryCounts[t.category] ?? 0) + 1;
    }

    final matched = <McpTool>[];
    for (final t in availableLazy) {
      if (catFilter.isNotEmpty && t.category.toLowerCase() != catFilter) {
        continue;
      }
      if (q.isNotEmpty) {
        final hay = '${t.name} ${t.category} ${t.description}'.toLowerCase();
        if (!hay.contains(q)) continue;
      }
      matched.add(t);
    }

    var changed = false;
    if (enable && config.lazyLoading && matched.isNotEmpty) {
      if (catFilter.isNotEmpty && q.isEmpty) {
        changed = session.enabledCategories.add(catFilter) || changed;
      }
      for (final t in matched) {
        changed = session.enabledTools.add(t.name) || changed;
      }
      if (changed) {
        session.notify('notifications/tools/list_changed');
      }
    }

    return {
      'lazyLoading': config.lazyLoading,
      'categories': categoryCounts,
      'matchedCount': matched.length,
      if (changed) 'unlockedInSession': true,
      'tools': [
        for (final t in matched)
          includeSchema
              ? {...t.toMcpSchema(), 'category': t.category}
              : t.toSummary(),
      ],
      'usage':
          'Call any discovered tool directly (if your client refreshed tools/list) '
          'or via ypm_call_tool(name, arguments).',
    };
  }

  /// Runs a tool (called directly or proxied through ypm_call_tool).
  Future<Map<String, Object?>> callTool(
    String name,
    Map<String, Object?> args,
    AppState app,
    McpConfig config,
    McpSession session,
  ) async {
    final tool = _tools[name];
    if (tool == null) {
      return toolResult({
        'error': 'Unknown tool: $name',
        'hint': 'Use ypm_discover_tools to see available tools.',
      }, isError: true);
    }
    if (!isAvailable(tool, app, config)) {
      final reason = config.readOnly && tool.mutatesData
          ? 'Tool "$name" is disabled because MCP read-only mode is enabled.'
          : 'Tool "$name" is not supported by any currently loaded music source.';
      return toolResult({'error': reason}, isError: true);
    }
    try {
      final res = await tool.handler(
        args,
        McpCallContext(
          app: app,
          config: config,
          session: session,
          registry: this,
        ),
      );
      return toolResult(res ?? {'ok': true});
    } on SourceError catch (e) {
      return toolResult({
        'error': e.reason.isEmpty ? e.kind.name : e.reason,
        'code': e.kind.name,
      }, isError: true);
    } on ArgumentError catch (e) {
      return toolResult({'error': '${e.message ?? e}'}, isError: true);
    } catch (e) {
      return toolResult({'error': '$e'}, isError: true);
    }
  }
}
