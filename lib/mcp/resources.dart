// MCP Resources (naturally lazy read-only context: clients only call resources/read when needed).

import 'dart:convert';

import '../state.dart';
import 'json_rpc.dart';
import 'tools_core.dart' show serializeTrack;

const List<Map<String, Object?>> mcpResourceDescriptors = [
  {
    'uri': 'ypm://now-playing',
    'name': 'Now Playing',
    'description': 'Current track, playback state, progress, volume, and mode.',
    'mimeType': 'application/json',
  },
  {
    'uri': 'ypm://queue',
    'name': 'Playback Queue',
    'description': 'Current playback queue and active index.',
    'mimeType': 'application/json',
  },
  {
    'uri': 'ypm://sources',
    'name': 'Music Sources',
    'description': 'Loaded music sources (local & plugins), login status, and supported operations.',
    'mimeType': 'application/json',
  },
];

Map<String, Object?> readMcpResource(String uri, AppState app) {
  final Object data;
  switch (uri) {
    case 'ypm://now-playing':
      data = nowPlayingSnapshot(app);
    case 'ypm://queue':
      data = {
        'index': app.index,
        'total': app.queue.length,
        'from': app.queueFrom,
        'name': app.queueName,
        'tracks': [
          for (final (i, t) in app.queue.indexed)
            {...serializeTrack(t), 'index': i, 'current': i == app.index},
        ],
      };
    case 'ypm://sources':
      data = {
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
    default:
      throw JsonRpcException(
        JsonRpcCode.invalidParams,
        'Unknown resource URI: $uri',
      );
  }
  return {
    'contents': [
      {'uri': uri, 'mimeType': 'application/json', 'text': jsonEncode(data)},
    ],
  };
}

Map<String, Object?> nowPlayingSnapshot(AppState app) {
  final t = app.track;
  final duration = app.playbackDuration.round();
  return {
    'playing': app.playing,
    'hasQueue': app.hasQueue,
    'position': double.parse(app.position.toStringAsFixed(2)),
    'duration': duration,
    'progress': double.parse(app.progress.toStringAsFixed(4)),
    'volume': double.parse(app.volume.toStringAsFixed(3)),
    'muted': app.muted,
    'shuffle': app.shuffle,
    'repeat': app.repeat,
    'liked': app.isLiked,
    'hasLyrics': app.hasLyrics,
    'queueIndex': app.index,
    'queueLength': app.queue.length,
    'queueName': app.queueName,
    'activeSource': app.sourceId,
    'track': serializeTrack(t, duration: duration),
  };
}
