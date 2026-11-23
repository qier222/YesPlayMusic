// Lazy extended tool set: grouped by domain and trimmed by the Ops the loaded sources support.

import '../music/lrc.dart' as lrc;
import '../music/models.dart' as m;
import '../music/source.dart';
import '../state.dart';
import 'tool_registry.dart';
import 'tools_core.dart';

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

bool? _bool(Map<String, Object?> args, String key) {
  final v = args[key];
  if (v is bool) return v;
  return null;
}

List<String> _strList(Map<String, Object?> args, String key) {
  final v = args[key];
  if (v is! List) return const [];
  return [for (final x in v) '$x'.trim()].where((x) => x.isNotEmpty).toList();
}

/// Resolves the target song's (sourceId, trackId), falling back to the currently playing song.
(String, String) _resolveTrackRef(AppState app, Map<String, Object?> args) {
  final id = _str(args, 'id');
  final src = _str(args, 'source');
  if (id.isNotEmpty) {
    return (src.isNotEmpty ? src : app.sourceId, id);
  }
  final ref = app.track.ref;
  if (ref == null) {
    throw ArgumentError(
      'No real track is currently playing; please pass "source" and "id".',
    );
  }
  return (src.isNotEmpty ? src : ref.source, ref.id);
}

List<McpTool> buildLazyTools() => [
  // ───── lyrics ─────
  McpTool(
    name: 'get_lyrics',
    category: 'lyrics',
    requiredOp: Op.lyrics,
    readOnly: true,
    idempotent: true,
    description: 'Get lyrics for a track (defaults to the currently playing track). Supports plain text, raw LRC, or timestamped lines.',
    inputSchema: const {
      'type': 'object',
      'properties': {
        'source': {
          'type': 'string',
          'description': 'Optional music source ID.',
        },
        'id': {
          'type': 'string',
          'description': 'Optional track ID (defaults to current track).',
        },
        'format': {
          'type': 'string',
          'enum': ['plain', 'lrc', 'lines'],
          'default': 'plain',
        },
      },
      'additionalProperties': false,
    },
    handler: (args, ctx) async {
      final (srcId, trackId) = _resolveTrackRef(ctx.app, args);
      final s = resolveSource(ctx.app, srcId, requireOp: Op.lyrics);
      final res = await s.lyrics(trackId);
      final fmt = _str(args, 'format', 'plain');
      if (fmt == 'lrc') {
        return {
          'source': s.id,
          'id': trackId,
          'lrc': res.lrc,
          if (res.translation.isNotEmpty) 'translation': res.translation,
        };
      }
      final lines = lrc.lyricLines(res);
      if (fmt == 'lines') {
        return {
          'source': s.id,
          'id': trackId,
          'lines': [
            for (final l in lines)
              {
                'startMs': l.start,
                'text': l.text,
                if (l.translation.isNotEmpty) 'translation': l.translation,
              },
          ],
        };
      }
      final text = lines
          .map(
            (l) =>
                l.translation.isEmpty ? l.text : '${l.text}\n${l.translation}',
          )
          .join('\n');
      return {
        'source': s.id,
        'id': trackId,
        'text': text.isNotEmpty ? text : res.lrc,
      };
    },
  ),

  // ───── playlist ─────
  McpTool(
    name: 'list_playlists',
    category: 'playlist',
    requiredOp: Op.playlists,
    readOnly: true,
    idempotent: true,
    description: 'List user playlists from a music source.',
    inputSchema: const {
      'type': 'object',
      'properties': {
        'source': {'type': 'string'},
      },
      'additionalProperties': false,
    },
    handler: (args, ctx) async {
      final s = resolveSource(
        ctx.app,
        _str(args, 'source'),
        requireOp: Op.playlists,
      );
      final ps = await s.playlists();
      return {
        'source': s.id,
        'playlists': [
          for (final p in ps)
            {
              'id': p.id,
              'name': p.name,
              if (p.owner.isNotEmpty) 'owner': p.owner,
              if (p.trackCount > 0) 'trackCount': p.trackCount,
              'mine': p.mine,
              'fixed': p.fixed,
            },
        ],
      };
    },
  ),
  McpTool(
    name: 'get_playlist',
    category: 'playlist',
    requiredOp: Op.playlist,
    readOnly: true,
    idempotent: true,
    description: 'Get details and tracks of a playlist by ID.',
    inputSchema: const {
      'type': 'object',
      'properties': {
        'source': {'type': 'string'},
        'id': {'type': 'string', 'description': 'Playlist ID.'},
        'limit': {
          'type': 'integer',
          'minimum': 1,
          'maximum': 200,
          'default': 50,
        },
      },
      'required': ['id'],
      'additionalProperties': false,
    },
    handler: (args, ctx) async {
      final id = _str(args, 'id');
      if (id.isEmpty) throw ArgumentError('id is required.');
      final limit = _int(args, 'limit', 50).clamp(1, 200);
      final s = resolveSource(
        ctx.app,
        _str(args, 'source'),
        requireOp: Op.playlist,
      );
      final pl = await s.playlist(id);
      return {
        'source': s.id,
        'id': pl.id,
        'name': pl.name,
        if (pl.description.isNotEmpty) 'description': pl.description,
        if (pl.owner.isNotEmpty) 'owner': pl.owner,
        'trackCount': pl.tracks.isNotEmpty ? pl.tracks.length : pl.trackCount,
        'tracks': [
          for (final t in pl.tracks.take(limit)) serializeModelTrack(t, s.id),
        ],
      };
    },
  ),
  McpTool(
    name: 'create_playlist',
    category: 'playlist',
    requiredOp: Op.createPlaylist,
    readOnly: false,
    idempotent: false,
    mutatesData: true,
    description: 'Create a new playlist in a music source.',
    inputSchema: const {
      'type': 'object',
      'properties': {
        'source': {'type': 'string'},
        'name': {'type': 'string', 'description': 'Playlist name.'},
      },
      'required': ['name'],
      'additionalProperties': false,
    },
    handler: (args, ctx) async {
      final name = _str(args, 'name');
      if (name.isEmpty) throw ArgumentError('name is required.');
      final s = resolveSource(
        ctx.app,
        _str(args, 'source'),
        requireOp: Op.createPlaylist,
      );
      final pl = await s.createPlaylist(name);
      return {'source': s.id, 'id': pl.id, 'name': pl.name};
    },
  ),
  McpTool(
    name: 'add_to_playlist',
    category: 'playlist',
    requiredOp: Op.addToPlaylist,
    readOnly: false,
    idempotent: false,
    mutatesData: true,
    description: 'Add one or more track IDs to a playlist.',
    inputSchema: const {
      'type': 'object',
      'properties': {
        'source': {'type': 'string'},
        'playlistId': {'type': 'string'},
        'trackIds': {
          'type': 'array',
          'items': {'type': 'string'},
        },
      },
      'required': ['playlistId', 'trackIds'],
      'additionalProperties': false,
    },
    handler: (args, ctx) async {
      final playlistId = _str(args, 'playlistId');
      final trackIds = _strList(args, 'trackIds');
      if (playlistId.isEmpty || trackIds.isEmpty) {
        throw ArgumentError('playlistId and non-empty trackIds are required.');
      }
      final s = resolveSource(
        ctx.app,
        _str(args, 'source'),
        requireOp: Op.addToPlaylist,
      );
      await s.addToPlaylist(playlistId, trackIds);
      return {
        'ok': true,
        'source': s.id,
        'playlistId': playlistId,
        'added': trackIds.length,
      };
    },
  ),
  McpTool(
    name: 'remove_from_playlist',
    category: 'playlist',
    requiredOp: Op.removeFromPlaylist,
    readOnly: false,
    destructive: true,
    idempotent: false,
    mutatesData: true,
    description: 'Remove one or more track IDs from a playlist.',
    inputSchema: const {
      'type': 'object',
      'properties': {
        'source': {'type': 'string'},
        'playlistId': {'type': 'string'},
        'trackIds': {
          'type': 'array',
          'items': {'type': 'string'},
        },
      },
      'required': ['playlistId', 'trackIds'],
      'additionalProperties': false,
    },
    handler: (args, ctx) async {
      final playlistId = _str(args, 'playlistId');
      final trackIds = _strList(args, 'trackIds');
      if (playlistId.isEmpty || trackIds.isEmpty) {
        throw ArgumentError('playlistId and non-empty trackIds are required.');
      }
      final s = resolveSource(
        ctx.app,
        _str(args, 'source'),
        requireOp: Op.removeFromPlaylist,
      );
      await s.removeFromPlaylist(playlistId, trackIds);
      return {
        'ok': true,
        'source': s.id,
        'playlistId': playlistId,
        'removed': trackIds.length,
      };
    },
  ),
  McpTool(
    name: 'delete_playlist',
    category: 'playlist',
    requiredOp: Op.deletePlaylist,
    readOnly: false,
    destructive: true,
    idempotent: false,
    mutatesData: true,
    description: 'Permanently delete a user playlist.',
    inputSchema: const {
      'type': 'object',
      'properties': {
        'source': {'type': 'string'},
        'playlistId': {'type': 'string'},
      },
      'required': ['playlistId'],
      'additionalProperties': false,
    },
    handler: (args, ctx) async {
      final playlistId = _str(args, 'playlistId');
      if (playlistId.isEmpty) throw ArgumentError('playlistId is required.');
      final s = resolveSource(
        ctx.app,
        _str(args, 'source'),
        requireOp: Op.deletePlaylist,
      );
      await s.deletePlaylist(playlistId);
      return {'ok': true, 'source': s.id, 'deleted': playlistId};
    },
  ),

  // ───── library ─────
  McpTool(
    name: 'get_liked_tracks',
    category: 'library',
    requiredOp: Op.liked,
    readOnly: true,
    idempotent: true,
    description: 'Get user liked/favorited tracks from a music source.',
    inputSchema: const {
      'type': 'object',
      'properties': {
        'source': {'type': 'string'},
        'offset': {'type': 'integer', 'minimum': 0, 'default': 0},
        'limit': {
          'type': 'integer',
          'minimum': 1,
          'maximum': 100,
          'default': 30,
        },
      },
      'additionalProperties': false,
    },
    handler: (args, ctx) async {
      final s = resolveSource(
        ctx.app,
        _str(args, 'source'),
        requireOp: Op.liked,
      );
      final offset = _int(args, 'offset', 0).clamp(0, 10000);
      final limit = _int(args, 'limit', 30).clamp(1, 100);
      final page = await s.liked(offset: offset);
      return {
        'source': s.id,
        'more': page.more,
        'tracks': [
          for (final t in page.tracks.take(limit)) serializeModelTrack(t, s.id),
        ],
      };
    },
  ),
  McpTool(
    name: 'like_track',
    category: 'library',
    requiredOp: Op.like,
    readOnly: false,
    idempotent: true,
    mutatesData: true,
    description:
        'Like or unlike a track (defaults to the currently playing track).',
    inputSchema: const {
      'type': 'object',
      'properties': {
        'source': {'type': 'string'},
        'id': {'type': 'string'},
        'liked': {'type': 'boolean', 'default': true},
      },
      'additionalProperties': false,
    },
    handler: (args, ctx) async {
      final (srcId, trackId) = _resolveTrackRef(ctx.app, args);
      final on = _bool(args, 'liked') ?? true;
      final s = resolveSource(ctx.app, srcId, requireOp: Op.like);
      await s.like(trackId, on);
      final key = '$srcId:$trackId';
      on ? ctx.app.liked.add(key) : ctx.app.liked.remove(key);
      ctx.app.update(() {});
      return {'ok': true, 'source': s.id, 'id': trackId, 'liked': on};
    },
  ),
  McpTool(
    name: 'get_saved_albums',
    category: 'library',
    requiredOp: Op.savedAlbums,
    readOnly: true,
    idempotent: true,
    description: 'Get saved/collected albums from a music source.',
    inputSchema: const {
      'type': 'object',
      'properties': {
        'source': {'type': 'string'},
        'offset': {'type': 'integer', 'minimum': 0, 'default': 0},
        'limit': {
          'type': 'integer',
          'minimum': 1,
          'maximum': 100,
          'default': 30,
        },
      },
      'additionalProperties': false,
    },
    handler: (args, ctx) async {
      final s = resolveSource(
        ctx.app,
        _str(args, 'source'),
        requireOp: Op.savedAlbums,
      );
      final offset = _int(args, 'offset', 0).clamp(0, 10000);
      final limit = _int(args, 'limit', 30).clamp(1, 100);
      final albums = await s.savedAlbums(offset: offset);
      return {
        'source': s.id,
        'albums': [
          for (final a in albums.take(limit))
            {
              'id': a.id,
              'name': a.name,
              'artist': a.artists.map((x) => x.name).join(', '),
              if (a.released.isNotEmpty) 'released': a.released,
            },
        ],
      };
    },
  ),
  McpTool(
    name: 'get_recent_played',
    category: 'library',
    requiredOp: Op.recent,
    readOnly: true,
    idempotent: true,
    description: 'Get recently played tracks from a music source.',
    inputSchema: const {
      'type': 'object',
      'properties': {
        'source': {'type': 'string'},
        'limit': {
          'type': 'integer',
          'minimum': 1,
          'maximum': 100,
          'default': 30,
        },
      },
      'additionalProperties': false,
    },
    handler: (args, ctx) async {
      final s = resolveSource(
        ctx.app,
        _str(args, 'source'),
        requireOp: Op.recent,
      );
      final limit = _int(args, 'limit', 30).clamp(1, 100);
      final tracks = await s.recent();
      return {
        'source': s.id,
        'tracks': [
          for (final t in tracks.take(limit)) serializeModelTrack(t, s.id),
        ],
      };
    },
  ),
  McpTool(
    name: 'get_source_library',
    category: 'library',
    requiredOp: Op.library,
    readOnly: true,
    idempotent: true,
    description: 'Browse full library (tracks, albums, or artists) on local or self-hosted music sources.',
    inputSchema: const {
      'type': 'object',
      'properties': {
        'source': {'type': 'string'},
        'kind': {
          'type': 'string',
          'enum': ['tracks', 'albums', 'artists'],
          'default': 'tracks',
        },
        'offset': {'type': 'integer', 'minimum': 0, 'default': 0},
        'limit': {
          'type': 'integer',
          'minimum': 1,
          'maximum': 100,
          'default': 30,
        },
      },
      'additionalProperties': false,
    },
    handler: (args, ctx) async {
      final s = resolveSource(
        ctx.app,
        _str(args, 'source'),
        requireOp: Op.library,
      );
      final kindStr = _str(args, 'kind', 'tracks');
      final kind = m.SearchKind.values.firstWhere(
        (k) => k.name == kindStr,
        orElse: () => m.SearchKind.tracks,
      );
      final offset = _int(args, 'offset', 0).clamp(0, 10000);
      final limit = _int(args, 'limit', 30).clamp(1, 100);
      final r = await s.library(kind, offset: offset);
      return {
        'source': s.id,
        'kind': kind.name,
        'more': r.more,
        if (r.tracks.isNotEmpty)
          'tracks': [
            for (final t in r.tracks.take(limit)) serializeModelTrack(t, s.id),
          ],
        if (r.albums.isNotEmpty)
          'albums': [
            for (final a in r.albums.take(limit))
              {
                'id': a.id,
                'name': a.name,
                'artist': a.artists.map((x) => x.name).join(', '),
                if (a.released.isNotEmpty) 'released': a.released,
              },
          ],
        if (r.artists.isNotEmpty)
          'artists': [
            for (final a in r.artists.take(limit)) {'id': a.id, 'name': a.name},
          ],
      };
    },
  ),

  // ───── discovery ─────
  McpTool(
    name: 'get_album',
    category: 'discovery',
    requiredOp: Op.album,
    readOnly: true,
    idempotent: true,
    description: 'Get album metadata and tracklist by ID.',
    inputSchema: const {
      'type': 'object',
      'properties': {
        'source': {'type': 'string'},
        'id': {'type': 'string'},
      },
      'required': ['id'],
      'additionalProperties': false,
    },
    handler: (args, ctx) async {
      final id = _str(args, 'id');
      if (id.isEmpty) throw ArgumentError('id is required.');
      final s = resolveSource(
        ctx.app,
        _str(args, 'source'),
        requireOp: Op.album,
      );
      final page = await s.album(id);
      return {
        'source': s.id,
        'album': {
          'id': page.album.id,
          'name': page.album.name,
          'artist': page.album.artists.map((x) => x.name).join(', '),
          if (page.album.released.isNotEmpty) 'released': page.album.released,
        },
        'tracks': [for (final t in page.tracks) serializeModelTrack(t, s.id)],
      };
    },
  ),
  McpTool(
    name: 'get_artist',
    category: 'discovery',
    requiredOp: Op.artist,
    readOnly: true,
    idempotent: true,
    description: 'Get artist top tracks, albums, and related artists by ID.',
    inputSchema: const {
      'type': 'object',
      'properties': {
        'source': {'type': 'string'},
        'id': {'type': 'string'},
      },
      'required': ['id'],
      'additionalProperties': false,
    },
    handler: (args, ctx) async {
      final id = _str(args, 'id');
      if (id.isEmpty) throw ArgumentError('id is required.');
      final s = resolveSource(
        ctx.app,
        _str(args, 'source'),
        requireOp: Op.artist,
      );
      final page = await s.artist(id);
      return {
        'source': s.id,
        'artist': {'id': page.artist.id, 'name': page.artist.name},
        'tracks': [
          for (final t in page.tracks.take(30)) serializeModelTrack(t, s.id),
        ],
        'albums': [
          for (final a in page.albums.take(30))
            {
              'id': a.id,
              'name': a.name,
              if (a.released.isNotEmpty) 'released': a.released,
            },
        ],
        'related': [
          for (final r in page.related.take(20)) {'id': r.id, 'name': r.name},
        ],
      };
    },
  ),
  McpTool(
    name: 'get_similar_tracks',
    category: 'discovery',
    requiredOp: Op.similar,
    readOnly: true,
    idempotent: true,
    description: 'Get tracks similar to a given track (defaults to currently playing track).',
    inputSchema: const {
      'type': 'object',
      'properties': {
        'source': {'type': 'string'},
        'id': {'type': 'string'},
      },
      'additionalProperties': false,
    },
    handler: (args, ctx) async {
      final (srcId, trackId) = _resolveTrackRef(ctx.app, args);
      final s = resolveSource(ctx.app, srcId, requireOp: Op.similar);
      final ts = await s.similar(trackId);
      return {
        'source': s.id,
        'seedId': trackId,
        'tracks': [for (final t in ts) serializeModelTrack(t, s.id)],
      };
    },
  ),
  McpTool(
    name: 'get_home',
    category: 'discovery',
    requiredOp: Op.home,
    readOnly: true,
    idempotent: true,
    description: 'Get home feed recommendations and sections from a source.',
    inputSchema: const {
      'type': 'object',
      'properties': {
        'source': {'type': 'string'},
      },
      'additionalProperties': false,
    },
    handler: (args, ctx) async {
      final s = resolveSource(
        ctx.app,
        _str(args, 'source'),
        requireOp: Op.home,
      );
      final b = await s.home();
      return {
        'source': s.id,
        if (b.title.isNotEmpty) 'title': b.title,
        'sections': [
          for (final sec in b.sections)
            {
              if (sec.title.isNotEmpty) 'title': sec.title,
              if (sec.tracks.isNotEmpty)
                'tracks': [
                  for (final t in sec.tracks.take(12))
                    serializeModelTrack(t, s.id),
                ],
              if (sec.albums.isNotEmpty)
                'albums': [
                  for (final a in sec.albums.take(12))
                    {'id': a.id, 'name': a.name},
                ],
              if (sec.playlists.isNotEmpty)
                'playlists': [
                  for (final p in sec.playlists.take(12))
                    {'id': p.id, 'name': p.name},
                ],
              if (sec.modes.isNotEmpty)
                'modes': [
                  for (final mo in sec.modes)
                    {
                      'title': mo.title,
                      if (mo.station.isNotEmpty) 'station': mo.station,
                      if (mo.playlist.isNotEmpty) 'playlist': mo.playlist,
                    },
                ],
            },
        ],
      };
    },
  ),
  McpTool(
    name: 'get_hot_searches',
    category: 'discovery',
    requiredOp: Op.hotSearches,
    readOnly: true,
    idempotent: true,
    description: 'Get trending / hot search keywords from a music source.',
    inputSchema: const {
      'type': 'object',
      'properties': {
        'source': {'type': 'string'},
      },
      'additionalProperties': false,
    },
    handler: (args, ctx) async {
      final s = resolveSource(
        ctx.app,
        _str(args, 'source'),
        requireOp: Op.hotSearches,
      );
      final items = await s.hotSearches();
      return {
        'source': s.id,
        'items': [
          for (final h in items)
            {'word': h.word, if (h.hint.isNotEmpty) 'hint': h.hint},
        ],
      };
    },
  ),

  // ───── radio ─────
  McpTool(
    name: 'start_station',
    category: 'radio',
    requiredOp: Op.station,
    readOnly: false,
    idempotent: false,
    description: 'Start playing a radio station / endless mix by station ID.',
    inputSchema: const {
      'type': 'object',
      'properties': {
        'source': {'type': 'string'},
        'id': {'type': 'string', 'description': 'Station ID.'},
        'name': {'type': 'string', 'description': 'Optional display name.'},
        'seed': {'type': 'string', 'description': 'Optional seed track ID.'},
      },
      'required': ['id'],
      'additionalProperties': false,
    },
    handler: (args, ctx) async {
      final id = _str(args, 'id');
      if (id.isEmpty) throw ArgumentError('id is required.');
      final s = resolveSource(
        ctx.app,
        _str(args, 'source'),
        requireOp: Op.station,
      );
      final name = _str(args, 'name', id);
      final seed = _str(args, 'seed');
      await ctx.app.playStation(
        s.id,
        id,
        name,
        seed: seed.isEmpty ? null : seed,
      );
      return {
        'ok': true,
        'source': s.id,
        'station': id,
        'queueLength': ctx.app.queue.length,
        'nowPlaying': serializeTrack(ctx.app.track),
      };
    },
  ),
  McpTool(
    name: 'dislike_track',
    category: 'radio',
    requiredOp: Op.dislike,
    readOnly: false,
    idempotent: false,
    mutatesData: true,
    description: 'Mark a track as disliked (defaults to current track) and skip it if playing.',
    inputSchema: const {
      'type': 'object',
      'properties': {
        'source': {'type': 'string'},
        'id': {'type': 'string'},
        'station': {'type': 'string'},
      },
      'additionalProperties': false,
    },
    handler: (args, ctx) async {
      final (srcId, trackId) = _resolveTrackRef(ctx.app, args);
      final s = resolveSource(ctx.app, srcId, requireOp: Op.dislike);
      final cur = ctx.app.track.ref;
      if (cur != null && cur.source == srcId && cur.id == trackId) {
        await ctx.app.dislike(ctx.app.track);
      } else {
        await s.dislike(trackId, station: _str(args, 'station'));
      }
      return {'ok': true, 'source': s.id, 'id': trackId};
    },
  ),

  // ───── comments ─────
  McpTool(
    name: 'get_comments',
    category: 'comments',
    requiredOp: Op.comments,
    readOnly: true,
    idempotent: true,
    description:
        'Get comments for a track (defaults to currently playing track).',
    inputSchema: const {
      'type': 'object',
      'properties': {
        'source': {'type': 'string'},
        'id': {'type': 'string'},
        'sort': {
          'type': 'string',
          'enum': ['hot', 'new'],
          'default': 'hot',
        },
        'offset': {'type': 'integer', 'minimum': 0, 'default': 0},
      },
      'additionalProperties': false,
    },
    handler: (args, ctx) async {
      final (srcId, trackId) = _resolveTrackRef(ctx.app, args);
      final s = resolveSource(ctx.app, srcId, requireOp: Op.comments);
      final sort = _str(args, 'sort', 'hot');
      final offset = _int(args, 'offset', 0).clamp(0, 10000);
      final page = await s.comments(trackId, sort: sort, offset: offset);
      return {
        'source': s.id,
        'id': trackId,
        'total': page.total,
        'more': page.more,
        'comments': [
          for (final c in page.comments.take(30))
            {
              'id': c.id,
              'user': c.userName,
              'text': c.text,
              'likes': c.likes,
              'liked': c.liked,
              if (c.time > 0) 'time': c.time,
            },
        ],
      };
    },
  ),
  McpTool(
    name: 'post_comment',
    category: 'comments',
    requiredOp: Op.postComment,
    readOnly: false,
    destructive: true,
    idempotent: false,
    mutatesData: true,
    description: 'Post a comment on a track (or reply to an existing comment).',
    inputSchema: const {
      'type': 'object',
      'properties': {
        'source': {'type': 'string'},
        'id': {'type': 'string'},
        'text': {'type': 'string'},
        'replyTo': {'type': 'string'},
      },
      'required': ['text'],
      'additionalProperties': false,
    },
    handler: (args, ctx) async {
      final text = _str(args, 'text');
      if (text.isEmpty) throw ArgumentError('text is required.');
      final (srcId, trackId) = _resolveTrackRef(ctx.app, args);
      final s = resolveSource(ctx.app, srcId, requireOp: Op.postComment);
      final c = await s.postComment(
        trackId,
        text,
        replyTo: _str(args, 'replyTo'),
      );
      return {
        'ok': true,
        'source': s.id,
        'id': trackId,
        if (c != null) 'commentId': c.id,
      };
    },
  ),
  McpTool(
    name: 'like_comment',
    category: 'comments',
    requiredOp: Op.likeComment,
    readOnly: false,
    idempotent: true,
    mutatesData: true,
    description: 'Like or unlike a track comment.',
    inputSchema: const {
      'type': 'object',
      'properties': {
        'source': {'type': 'string'},
        'id': {'type': 'string'},
        'commentId': {'type': 'string'},
        'liked': {'type': 'boolean', 'default': true},
      },
      'required': ['commentId'],
      'additionalProperties': false,
    },
    handler: (args, ctx) async {
      final commentId = _str(args, 'commentId');
      if (commentId.isEmpty) throw ArgumentError('commentId is required.');
      final (srcId, trackId) = _resolveTrackRef(ctx.app, args);
      final on = _bool(args, 'liked') ?? true;
      final s = resolveSource(ctx.app, srcId, requireOp: Op.likeComment);
      await s.likeComment(trackId, commentId, on);
      return {'ok': true, 'commentId': commentId, 'liked': on};
    },
  ),

  // ───── sources ─────
  McpTool(
    name: 'list_sources',
    category: 'sources',
    readOnly: true,
    idempotent: true,
    description: 'List all loaded music sources (local library and plugins), login status, and supported operations.',
    inputSchema: const {
      'type': 'object',
      'properties': {},
      'additionalProperties': false,
    },
    handler: (args, ctx) async {
      final app = ctx.app;
      return {
        'activeSource': app.sourceId,
        'sources': [
          for (final s in app.sources.all)
            {
              'id': s.id,
              'name': s.info.name,
              'active': s.id == app.sourceId,
              'loggedIn': app.accounts.containsKey(s.id),
              if (app.accounts[s.id] case final acc?)
                'account': {'id': acc.id, 'name': acc.name},
              'ops': s.ops.toList()..sort(),
            },
        ],
      };
    },
  ),
  McpTool(
    name: 'switch_source',
    category: 'sources',
    readOnly: false,
    idempotent: true,
    description: 'Switch the active music source in YesPlayMusic.',
    inputSchema: const {
      'type': 'object',
      'properties': {
        'source': {'type': 'string', 'description': 'Target music source ID.'},
      },
      'required': ['source'],
      'additionalProperties': false,
    },
    handler: (args, ctx) async {
      final id = _str(args, 'source');
      if (id.isEmpty || ctx.app.sources[id] == null) {
        throw ArgumentError('Unknown music source: "$id".');
      }
      ctx.app.setSource(id);
      return {'ok': true, 'activeSource': ctx.app.sourceId};
    },
  ),
  McpTool(
    name: 'rescan_local_library',
    category: 'sources',
    readOnly: false,
    idempotent: true,
    description: 'Rescan local music folders to refresh the local library.',
    inputSchema: const {
      'type': 'object',
      'properties': {},
      'additionalProperties': false,
    },
    handler: (args, ctx) async {
      await ctx.app.loadLibrary();
      return {'ok': true, 'albumsCount': ctx.app.libraryAlbums.length};
    },
  ),

  // ───── navigation ─────
  McpTool(
    name: 'navigate_to',
    category: 'navigation',
    readOnly: false,
    idempotent: true,
    description: 'Navigate the YesPlayMusic UI to a tab/route or open/close the Now Playing overlay.',
    inputSchema: const {
      'type': 'object',
      'properties': {
        'tab': {
          'type': 'string',
          'enum': ['home', 'discover', 'library', 'search', 'settings'],
        },
        'route': {
          'type': 'string',
          'description': 'Explicit in-app route (e.g. /settings, /search).',
        },
        'nowPlaying': {
          'type': 'boolean',
          'description': 'Open or close the Now Playing view.',
        },
        'npTab': {
          'type': 'string',
          'enum': ['lyrics', 'queue', 'similar', 'comments'],
        },
      },
      'additionalProperties': false,
    },
    handler: (args, ctx) async {
      final app = ctx.app;
      final tab = _str(args, 'tab');
      final route = _str(args, 'route');
      final np = _bool(args, 'nowPlaying');
      final npTabStr = _str(args, 'npTab');

      if (tab.isNotEmpty) {
        switch (tab) {
          case 'home':
            app.goTab(0);
          case 'discover':
            app.goTab(1);
          case 'library':
            app.goTab(2);
          case 'search':
            app.goTab(3);
          case 'settings':
            app.open('/settings');
        }
      } else if (route.isNotEmpty) {
        app.open(route);
      }

      NpTab? parsedNpTab;
      if (npTabStr.isNotEmpty) {
        parsedNpTab = NpTab.values.firstWhere(
          (t) => t.name == npTabStr,
          orElse: () => NpTab.lyrics,
        );
      }

      if (np == true) {
        app.openNowPlaying(parsedNpTab);
      } else if (np == false) {
        app.closeNowPlaying();
      } else if (parsedNpTab != null) {
        app.setNpTab(parsedNpTab);
      }

      return {
        'ok': true,
        'path': app.path,
        'nowPlaying': app.npOpen,
        'npTab': app.npTab.name,
      };
    },
  ),
];
