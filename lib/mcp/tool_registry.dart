// MCP 工具注册表、Session 状态与懒加载分发器。
//
// 支持两种懒加载协作模式：
// 1. 通用渐进式懒加载（默认）：tools/list 仅返回核心工具 + ypm_discover_tools +
//    ypm_call_tool；LLM 通过 discover 获取扩展工具 Schema，再用 ypm_call_tool 执行。
// 2. 动态热刷新（兼容支持 notifications/tools/list_changed 的客户端）：discover 或
//    enable 后，将对应工具注册进当前 Session 并推送 list_changed 通知，客户端随后
//    可直接调用真实工具名。

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

  /// 是否在懒加载模式下初始直接暴露。
  final bool core;

  /// 是否是懒加载元工具（ypm_discover_tools / ypm_call_tool）。
  /// 在全量暴露模式下不显示元工具，减少冗余。
  final bool meta;

  /// MCP Tool Annotations。
  final bool readOnly;
  final bool destructive;
  final bool idempotent;

  /// 是否会修改远程/用户持久化数据（歌单、喜欢、评论、不喜欢等）。
  /// 在 `config.readOnly` 启用时被屏蔽。
  final bool mutatesData;

  /// 依赖的单一 Source Op；为空表示不依赖特定 Op。
  final String? requiredOp;

  /// 满足任意一个 Op 即可用。
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

/// 单个 MCP 客户端会话，记录其通过懒加载已解锁的工具和活跃 SSE 流。
class McpSession {
  McpSession(this.id);

  final String id;
  bool initialized = false;
  DateTime lastSeen = DateTime.now();

  /// 当前会话已动态解锁的懒加载分类与工具名。
  final Set<String> enabledCategories = {};
  final Set<String> enabledTools = {};

  /// 当前会话挂载的 SSE 通知通道（GET /mcp），见 [serveSse]。
  final List<IOSink> _sseStreams = [];

  /// 每条 SSE 通道上一次写入的 flush，写入必须串行：
  /// flush 未完成时再 write 会抛 StateError，连发两条通知时整条通道就被误判为断开。
  final Map<IOSink, Future<void>> _pending = {};

  /// 通道被移除时完成，供 GET /mcp 的处理函数结束等待。
  final Map<IOSink, Completer<void>> _detached = {};

  /// 对端断开后 flush 会一直挂起、`res.done` 也不触发，只能靠超时发现死连接。
  /// 测试里会调短。
  static Duration writeTimeout = const Duration(seconds: 5);

  int get sseCount => _sseStreams.length;

  /// 把 [res] 当作 SSE 通道挂到会话上，直到对端断开或通道被移除才返回。
  /// 调用方先设好状态码和响应头（Content-Type 等），这里负责其余部分。
  ///
  /// HttpResponse 会吞掉对端断开的 SocketException（之后写入静默丢弃、flush 照样成功、
  /// done 也不触发），所以写完响应头就拿出原始 Socket：写失败会直接报错，
  /// 读端 onDone 能立刻发现断开。
  Future<void> serveSse(HttpResponse res, {void Function()? onAttached}) async {
    // 不分块、读到连接关闭为止：detach 之后直接写 socket。
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

  /// 挂上一条 SSE 通道；返回的 Future 在通道被移除（断开、超时、会话关闭）时完成。
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

  /// 向当前会话的所有 SSE 通道推送 JSON-RPC 通知。
  void notify(String method, [Map<String, Object?>? params]) {
    _broadcast(
      'event: message\ndata: ${jsonEncode(jsonRpcNotification(method, params))}\n\n',
    );
  }

  /// SSE 注释行心跳：客户端忽略，服务端借此发现已断开的连接。
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
            // 客户端已断开或写超时：移除通道，不让错误冒泡成未捕获异常。
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

  /// 判断工具在当前已加载源与配置下是否可用。
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

  /// 计算当前所有可用工具的数量（核心 / 懒加载），供设置页展示。
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

  /// 生成 `tools/list` 返回的工具列表。
  List<Map<String, Object?>> listTools(
    AppState app,
    McpConfig config,
    McpSession session,
  ) {
    final out = <Map<String, Object?>>[];
    for (final t in _tools.values) {
      if (!isAvailable(t, app, config)) continue;
      if (!config.lazyLoading) {
        // 全量模式：直接暴露所有真实工具，省略懒加载元工具。
        if (!t.meta) out.add(t.toMcpSchema());
        continue;
      }
      // 懒加载模式：暴露核心工具、元工具，以及当前会话已动态解锁的扩展工具。
      if (t.core ||
          t.meta ||
          session.enabledCategories.contains(t.category) ||
          session.enabledTools.contains(t.name)) {
        out.add(t.toMcpSchema());
      }
    }
    return out;
  }

  /// 懒加载发现入口：按分类或关键词列出扩展工具及其 Schema，并可选地为当前会话解锁。
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

  /// 执行指定工具（支持直接调用，也支持通过 ypm_call_tool 代理调用）。
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
