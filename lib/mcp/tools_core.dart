// Core tools (eager; always exposed directly in lazy mode) and the lazy meta tools.

import '../data.dart';
import '../l10n/l10n.dart';
import '../music/models.dart' as m;
import '../music/source.dart';
import '../state.dart';
import 'resources.dart';
import 'tool_registry.dart';

Map<String, Object?> serializeTrack(Track t, {int? duration}) => {
  'title': t.title,
  'artist': t.artist,
  if (t.album.isNotEmpty) 'album': t.album,
  'duration': duration ?? t.seconds,
  if (t.ref != null) 'source': t.ref!.source,
  if (t.ref != null) 'id': t.ref!.id,
  if (t.ref != null && t.ref!.album.id.isNotEmpty) 'albumId': t.ref!.album.id,
};

Map<String, Object?> serializeModelTrack(m.Track t, [String? fallbackSource]) {
  final src = t.source.isNotEmpty ? t.source : (fallbackSource ?? '');
  return {
    if (src.isNotEmpty) 'source': src,
    'id': t.id,
    'title': t.name,
    'artist': t.artistNames,
    if (t.album.name.isNotEmpty) 'album': t.album.name,
    if (t.album.id.isNotEmpty) 'albumId': t.album.id,
    'duration': (t.duration / 1000).round(),
    if (t.unavailable) 'unavailable': true,
  };
}

String _str(Map<String, Object?> args, String key, [String fallback = '']) {
  final v = args[key];
  return v is String ? v.trim() : fallback;
}

int _int(Map<String, Object?> args, String key, [int fallback = 0]) {
  final v = args[key];
  if (v is num) return v.toInt();
  if (v is String) return int.tryParse(v) ?? fallback;
  return fallback;
}

double? _double(Map<String, Object?> args, String key) {
  final v = args[key];
  if (v is num) return v.toDouble();
  if (v is String) return double.tryParse(v);
  return null;
}

bool? _bool(Map<String, Object?> args, String key) {
  final v = args[key];
  if (v is bool) return v;
  if (v is String) {
    if (v.toLowerCase() == 'true') return true;
    if (v.toLowerCase() == 'false') return false;
  }
  return null;
}

Source resolveSource(AppState app, String? requested, {String? requireOp}) {
  final id = (requested != null && requested.trim().isNotEmpty)
      ? requested.trim()
      : app.sourceId;
  final s = app.sources[id];
  if (s != null && (requireOp == null || s.can(requireOp))) {
    return s;
  }
  if (requested != null && requested.trim().isNotEmpty) {
    if (s == null) {
      throw ArgumentError('Music source "$id" not found.');
    }
    throw SourceError(
      SourceErrorKind.unsupported,
      'Source "${s.info.name}" does not support $requireOp.',
    );
  }
  if (requireOp != null) {
    for (final candidate in app.sources.all) {
      if (candidate.can(requireOp)) return candidate;
    }
    throw SourceError(
      SourceErrorKind.unsupported,
      'No loaded music source supports $requireOp.',
    );
  }
  throw ArgumentError('No music source available.');
}

List<McpTool> buildCoreTools() => [
  McpTool(
    name: 'get_now_playing',
    category: 'core',
    core: true,
    readOnly: true,
    idempotent: true,
    description: 'Get the currently playing track, playback status, progress, volume, shuffle/repeat mode, and queue summary.',
    inputSchema: const {
      'type': 'object',
      'properties': {},
      'additionalProperties': false,
    },
    handler: (args, ctx) async => nowPlayingSnapshot(ctx.app),
  ),
  McpTool(
    name: 'control_playback',
    category: 'core',
    core: true,
    readOnly: false,
    idempotent: false,
    description: 'Control YesPlayMusic playback: play, pause, toggle, next, prev, seek (seconds), seek_by (delta seconds), volume (0.0-1.0), mute, shuffle, or repeat.',
    inputSchema: const {
      'type': 'object',
      'properties': {
        'action': {
          'type': 'string',
          'enum': [
            'play',
            'pause',
            'toggle',
            'next',
            'prev',
            'seek',
            'seek_by',
            'volume',
            'mute',
            'shuffle',
            'repeat',
          ],
          'description': 'Playback action to execute.',
        },
        'value': {
          'description': 'Optional parameter: seconds for seek/seek_by, 0..1 for volume, or boolean for mute/shuffle/repeat.',
        },
      },
      'required': ['action'],
      'additionalProperties': false,
    },
    handler: (args, ctx) async {
      final app = ctx.app;
      final action = _str(args, 'action');
      switch (action) {
        case 'play':
          app.play();
        case 'pause':
          app.pause();
        case 'toggle':
          app.togglePlay();
        case 'next':
          app.next();
        case 'prev':
          app.prev();
        case 'seek':
          final sec = _double(args, 'value');
          if (sec == null) {
            throw ArgumentError('seek requires numeric "value" in seconds.');
          }
          app.seekTo(sec);
        case 'seek_by':
          final delta = _double(args, 'value');
          if (delta == null) {
            throw ArgumentError('seek_by requires numeric "value" in seconds.');
          }
          app.seekBy(delta);
        case 'volume':
          final v = _double(args, 'value');
          if (v == null) {
            throw ArgumentError('volume requires numeric "value" in 0.0..1.0.');
          }
          app.setVolume(v);
        case 'mute':
          final b = _bool(args, 'value');
          if (b == null || b != app.muted) app.toggleMute();
        case 'shuffle':
          final b = _bool(args, 'value');
          if (b == null || b != app.shuffle) app.toggleShuffle();
        case 'repeat':
          final b = _bool(args, 'value');
          if (b == null || b != app.repeat) app.toggleRepeat();
        default:
          throw ArgumentError('Unsupported playback action: "$action"');
      }
      return nowPlayingSnapshot(app);
    },
  ),
  McpTool(
    name: 'search_music',
    category: 'core',
    core: true,
    readOnly: true,
    idempotent: true,
    requiredOp: Op.search,
    description: 'Search for tracks, albums, artists, or playlists. Defaults to the active source; pass source="all" to search across all loaded sources.',
    inputSchema: const {
      'type': 'object',
      'properties': {
        'query': {'type': 'string', 'description': 'Search keywords.'},
        'kind': {
          'type': 'string',
          'enum': ['tracks', 'albums', 'artists', 'playlists'],
          'default': 'tracks',
          'description': 'Entity type to search.',
        },
        'source': {
          'type': 'string',
          'description': 'Optional music source ID, or "all" to aggregate across all searchable sources.',
        },
        'offset': {
          'type': 'integer',
          'minimum': 0,
          'default': 0,
          'description': 'Pagination offset.',
        },
        'limit': {
          'type': 'integer',
          'minimum': 1,
          'maximum': 50,
          'default': 15,
          'description': 'Maximum items to return per source.',
        },
      },
      'required': ['query'],
      'additionalProperties': false,
    },
    handler: (args, ctx) async {
      final query = _str(args, 'query');
      if (query.isEmpty) throw ArgumentError('query must not be empty.');
      final kindStr = _str(args, 'kind', 'tracks');
      final kind = m.SearchKind.values.firstWhere(
        (k) => k.name == kindStr,
        orElse: () => m.SearchKind.tracks,
      );
      final offset = _int(args, 'offset', 0).clamp(0, 10000);
      final limit = _int(args, 'limit', 15).clamp(1, 50);
      final srcArg = _str(args, 'source');

      final targets = srcArg == 'all'
          ? [
              for (final s in ctx.app.sources.all)
                if (s.can(Op.search)) s,
            ]
          : [resolveSource(ctx.app, srcArg, requireOp: Op.search)];

      final tracks = <Map<String, Object?>>[];
      final albums = <Map<String, Object?>>[];
      final artists = <Map<String, Object?>>[];
      final playlists = <Map<String, Object?>>[];
      final errors = <String, String>{};
      var more = false;

      await Future.wait([
        for (final s in targets)
          () async {
            try {
              final r = await s.search(query, kind, offset: offset);
              more = more || r.more;
              for (final t in r.tracks.take(limit)) {
                tracks.add(serializeModelTrack(t, s.id));
              }
              for (final a in r.albums.take(limit)) {
                albums.add({
                  'source': s.id,
                  'id': a.id,
                  'name': a.name,
                  'artist': a.artists.map((x) => x.name).join(', '),
                  if (a.released.isNotEmpty) 'released': a.released,
                  if (a.trackCount > 0) 'trackCount': a.trackCount,
                });
              }
              for (final a in r.artists.take(limit)) {
                artists.add({'source': s.id, 'id': a.id, 'name': a.name});
              }
              for (final p in r.playlists.take(limit)) {
                playlists.add({
                  'source': s.id,
                  'id': p.id,
                  'name': p.name,
                  if (p.owner.isNotEmpty) 'owner': p.owner,
                  if (p.trackCount > 0) 'trackCount': p.trackCount,
                });
              }
            } catch (e) {
              errors[s.id] = '$e';
            }
          }(),
      ]);

      return {
        'query': query,
        'kind': kind.name,
        'sources': [for (final s in targets) s.id],
        'more': more,
        if (tracks.isNotEmpty) 'tracks': tracks,
        if (albums.isNotEmpty) 'albums': albums,
        if (artists.isNotEmpty) 'artists': artists,
        if (playlists.isNotEmpty) 'playlists': playlists,
        if (errors.isNotEmpty) 'errors': errors,
      };
    },
  ),
  McpTool(
    name: 'play_tracks',
    category: 'core',
    core: true,
    readOnly: false,
    idempotent: false,
    description: 'Play music immediately: pass "query" to search and play the best matching track, OR pass "source" + "id" with kind="track"|"album"|"playlist".',
    inputSchema: const {
      'type': 'object',
      'properties': {
        'query': {
          'type': 'string',
          'description':
              'Search keywords to find and play the top matching track.',
        },
        'source': {
          'type': 'string',
          'description': 'Music source ID (defaults to active source).',
        },
        'id': {
          'type': 'string',
          'description': 'Track, album, or playlist ID within the source.',
        },
        'kind': {
          'type': 'string',
          'enum': ['track', 'album', 'playlist'],
          'default': 'track',
          'description': 'Type of entity when playing by ID.',
        },
        'title': {
          'type': 'string',
          'description': 'Optional track title when playing a track by ID.',
        },
        'artist': {
          'type': 'string',
          'description': 'Optional artist name when playing a track by ID.',
        },
        'album': {
          'type': 'string',
          'description': 'Optional album name when playing a track by ID.',
        },
        'duration': {
          'type': 'integer',
          'description': 'Optional duration in seconds when playing by ID.',
        },
      },
      'additionalProperties': false,
    },
    handler: (args, ctx) async {
      final app = ctx.app;
      final query = _str(args, 'query');
      final srcArg = _str(args, 'source');
      final id = _str(args, 'id');
      final kind = _str(args, 'kind', 'track');

      if (query.isNotEmpty) {
        final s = resolveSource(app, srcArg, requireOp: Op.search);
        final res = await s.search(query, m.SearchKind.tracks);
        final playable = [
          for (final t in res.tracks)
            if (!t.unavailable) Track.of(t.withSource(s.id)),
        ];
        if (playable.isEmpty) {
          throw SourceError(
            SourceErrorKind.unavailable,
            'No playable tracks found for "$query" in ${s.info.name}.',
          );
        }
        app.playList(playable, name: L.searchMcpQueueName(query));
        return {
          'played': serializeTrack(playable.first),
          'queuedCount': playable.length,
        };
      }

      if (id.isEmpty) {
        throw ArgumentError('Provide either "query" or "id".');
      }

      final s = resolveSource(app, srcArg);
      switch (kind) {
        case 'album':
          final page = await s.album(id);
          final tracks = [
            for (final t in page.tracks)
              if (!t.unavailable) Track.of(t.withSource(s.id)),
          ];
          if (tracks.isEmpty) {
            throw SourceError(
              SourceErrorKind.unavailable,
              'Album "$id" has no playable tracks.',
            );
          }
          app.playList(
            tracks,
            from: 'album:${s.id == 'local' ? id : '@${s.id}/$id'}',
            name: page.album.name,
          );
          return {
            'album': page.album.name,
            'played': serializeTrack(tracks.first),
            'queuedCount': tracks.length,
          };
        case 'playlist':
          final pl = await s.playlist(id);
          final tracks = [
            for (final t in pl.tracks)
              if (!t.unavailable) Track.of(t.withSource(s.id)),
          ];
          if (tracks.isEmpty) {
            throw SourceError(
              SourceErrorKind.unavailable,
              'Playlist "$id" has no playable tracks.',
            );
          }
          app.playList(tracks, from: 'playlist:${s.id}/$id', name: pl.name);
          return {
            'playlist': pl.name,
            'played': serializeTrack(tracks.first),
            'queuedCount': tracks.length,
          };
        default:
          final title = _str(args, 'title', id);
          final artist = _str(args, 'artist');
          final album = _str(args, 'album');
          final duration = _int(args, 'duration', 0);
          final mt = m.Track(
            id: id,
            name: title,
            source: s.id,
            artists: artist.isEmpty
                ? const []
                : [m.Artist(id: '', name: artist)],
            album: m.Album(id: '', name: album),
            duration: duration * 1000,
          );
          final t = Track.of(mt);
          app.playTrack(t);
          return {'played': serializeTrack(t)};
      }
    },
  ),
  McpTool(
    name: 'manage_queue',
    category: 'core',
    core: true,
    readOnly: false,
    idempotent: false,
    description: 'Inspect or modify the playback queue: list, play_at (index), add_next, add_end, remove (index), or clear.',
    inputSchema: const {
      'type': 'object',
      'properties': {
        'action': {
          'type': 'string',
          'enum': ['list', 'play_at', 'add_next', 'add_end', 'remove', 'clear'],
          'default': 'list',
        },
        'index': {'type': 'integer', 'minimum': 0},
        'offset': {'type': 'integer', 'minimum': 0, 'default': 0},
        'limit': {
          'type': 'integer',
          'minimum': 1,
          'maximum': 100,
          'default': 30,
        },
        'source': {'type': 'string'},
        'id': {'type': 'string'},
        'title': {'type': 'string'},
        'artist': {'type': 'string'},
        'album': {'type': 'string'},
        'duration': {'type': 'integer'},
      },
      'required': ['action'],
      'additionalProperties': false,
    },
    handler: (args, ctx) async {
      final app = ctx.app;
      final action = _str(args, 'action', 'list');
      switch (action) {
        case 'list':
          final offset = _int(args, 'offset', 0).clamp(0, app.queue.length);
          final limit = _int(args, 'limit', 30).clamp(1, 100);
          final end = (offset + limit).clamp(offset, app.queue.length);
          return {
            'index': app.index,
            'total': app.queue.length,
            'queueName': app.queueName,
            'tracks': [
              for (var i = offset; i < end; i++)
                {
                  ...serializeTrack(app.queue[i]),
                  'index': i,
                  'current': i == app.index,
                },
            ],
          };
        case 'play_at':
          final i = _int(args, 'index', -1);
          if (i < 0 || i >= app.queue.length) {
            throw ArgumentError(
              'index $i out of range (0..${app.queue.length - 1}).',
            );
          }
          app.playQueueAt(i);
          return nowPlayingSnapshot(app);
        case 'add_next':
        case 'add_end':
          final id = _str(args, 'id');
          if (id.isEmpty) throw ArgumentError('id is required for $action.');
          final s = resolveSource(app, _str(args, 'source'));
          final title = _str(args, 'title', id);
          final artist = _str(args, 'artist');
          final album = _str(args, 'album');
          final duration = _int(args, 'duration', 0);
          final t = Track.of(
            m.Track(
              id: id,
              name: title,
              source: s.id,
              artists: artist.isEmpty
                  ? const []
                  : [m.Artist(id: '', name: artist)],
              album: m.Album(id: '', name: album),
              duration: duration * 1000,
            ),
          );
          if (action == 'add_next') {
            app.addNext(t);
          } else {
            app.addToQueue(t);
          }
          return {
            'ok': true,
            'queueLength': app.queue.length,
            'added': serializeTrack(t),
          };
        case 'remove':
          final i = _int(args, 'index', -1);
          if (i < 0 || i >= app.queue.length) {
            throw ArgumentError('index $i out of range.');
          }
          app.removeQueueAt(i);
          return {
            'ok': true,
            'queueLength': app.queue.length,
            'index': app.index,
          };
        case 'clear':
          app.clearQueue();
          return {'ok': true, 'queueLength': app.queue.length};
        default:
          throw ArgumentError('Unsupported queue action: "$action"');
      }
    },
  ),
  // ── Lazy meta tools ──
  McpTool(
    name: 'ypm_discover_tools',
    category: 'meta',
    core: true,
    meta: true,
    readOnly: true,
    idempotent: true,
    description:
        'Discover additional YesPlayMusic MCP tools on demand (lazy loading). '
        'Filter by category (lyrics, playlist, library, discovery, radio, comments, sources, navigation) '
        'or keyword query. Discovered tools are unlocked for this session and can be called directly or via ypm_call_tool.',
    inputSchema: const {
      'type': 'object',
      'properties': {
        'category': {
          'type': 'string',
          'enum': [
            'lyrics',
            'playlist',
            'library',
            'discovery',
            'radio',
            'comments',
            'sources',
            'navigation',
          ],
          'description': 'Optional toolset category to inspect and unlock.',
        },
        'query': {
          'type': 'string',
          'description':
              'Optional keyword to search tool names and descriptions.',
        },
        'includeSchema': {
          'type': 'boolean',
          'default': true,
          'description': 'Include full JSON inputSchema for matched tools.',
        },
        'enable': {
          'type': 'boolean',
          'default': true,
          'description': 'Unlock matched tools in this session and emit notifications/tools/list_changed.',
        },
      },
      'additionalProperties': false,
    },
    handler: (args, ctx) async => ctx.registry.discoverTools(
      ctx.app,
      ctx.config,
      ctx.session,
      category: _str(args, 'category'),
      query: _str(args, 'query'),
      includeSchema: _bool(args, 'includeSchema') ?? true,
      enable: _bool(args, 'enable') ?? true,
    ),
  ),
  McpTool(
    name: 'ypm_call_tool',
    category: 'meta',
    core: true,
    meta: true,
    readOnly: false,
    idempotent: false,
    description:
        'Invoke any lazy-loaded YesPlayMusic tool by name after discovering it via ypm_discover_tools. '
        'Useful for clients that do not dynamically refresh tools/list.',
    inputSchema: const {
      'type': 'object',
      'properties': {
        'name': {
          'type': 'string',
          'description': 'Exact name of the tool to invoke.',
        },
        'arguments': {
          'type': 'object',
          'description': 'Arguments matching the tool inputSchema.',
          'additionalProperties': true,
        },
      },
      'required': ['name'],
      'additionalProperties': false,
    },
    handler: (args, ctx) async {
      final name = _str(args, 'name');
      if (name.isEmpty) throw ArgumentError('name is required.');
      if (name == 'ypm_call_tool') {
        throw ArgumentError('Cannot recursively invoke ypm_call_tool.');
      }
      final inner = args['arguments'] is Map
          ? (args['arguments'] as Map).cast<String, Object?>()
          : const <String, Object?>{};
      final tool = ctx.registry[name];
      if (tool == null) {
        throw ArgumentError(
          'Unknown tool "$name". Call ypm_discover_tools first.',
        );
      }
      if (!ctx.registry.isAvailable(tool, ctx.app, ctx.config)) {
        throw ArgumentError(
          'Tool "$name" is currently unavailable (disabled by read-only mode or unsupported by loaded sources).',
        );
      }
      return await tool.handler(inner, ctx);
    },
  ),
];
