import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/music/models.dart' as m;
import 'package:yesplaymusic/music/source.dart';
import 'package:yesplaymusic/state.dart';

/// A source that can save playlists; [error] makes the next call fail.
class _PlaylistSource extends Source {
  @override
  final m.SourceInfo info = const m.SourceInfo(id: 'lists', name: 'Lists');

  @override
  final Set<String> ops = const {Op.savePlaylist};

  final calls = <(String, bool)>[];
  Object? error;

  @override
  Future<void> savePlaylist(String id, bool on) async {
    calls.add((id, on));
    if (error != null) throw error!;
  }
}

/// A source that doesn't support playlists at all.
class _NoSaveSource extends Source {
  @override
  final m.SourceInfo info = const m.SourceInfo(id: 'nosave', name: 'No Save');

  @override
  final Set<String> ops = const {};

  final calls = <(String, bool)>[];

  @override
  Future<void> savePlaylist(String id, bool on) async {
    calls.add((id, on));
  }
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late AppState app;
  late _PlaylistSource src;
  const playlist = m.Playlist(id: 'pl1', name: 'Someone else playlist');

  setUp(() {
    app = AppState();
    src = _PlaylistSource();
    app.sources.add(src);
  });
  tearDown(() => app.dispose());

  test('toggleSavePlaylist: saves and unsaves through the source', () async {
    expect(await app.toggleSavePlaylist(src, playlist, true), isTrue);
    expect(await app.toggleSavePlaylist(src, playlist, false), isTrue);
    expect(src.calls, [('pl1', true), ('pl1', false)]);
  });

  test('toggleSavePlaylist: failure returns false', () async {
    src.error = SourceError(SourceErrorKind.failed, 'nope');
    expect(await app.toggleSavePlaylist(src, playlist, true), isFalse);
    expect(src.calls, [('pl1', true)]);
  });

  test('toggleSavePlaylist: unsupported source is a no-op', () async {
    final noSave = _NoSaveSource();
    app.sources.add(noSave);
    expect(await app.toggleSavePlaylist(noSave, playlist, true), isFalse);
    expect(noSave.calls, isEmpty);
  });
}
