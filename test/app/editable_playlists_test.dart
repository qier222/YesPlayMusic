import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/music/models.dart' as m;
import 'package:yesplaymusic/music/source.dart';
import 'package:yesplaymusic/state.dart';

/// A source with editable playlists; [withMembership] toggles the optional op.
class _ListsSource extends Source {
  _ListsSource({this.withMembership = true, this.sourceId = 'lists'});

  final bool withMembership;
  final String sourceId;

  @override
  m.SourceInfo get info => m.SourceInfo(id: sourceId, name: 'Lists');

  @override
  late final Set<String> ops = {
    Op.playlists,
    if (withMembership) Op.trackPlaylists,
  };

  var playlistsCalls = 0;
  final membershipCalls = <String>[];

  @override
  Future<List<m.Playlist>> playlists() async {
    playlistsCalls += 1;
    return const [
      m.Playlist(id: 'a', name: 'A', mine: true),
      m.Playlist(id: 'b', name: 'B', mine: true),
      m.Playlist(id: 'c', name: 'C'),
      m.Playlist(id: 'fixed', name: 'Liked', mine: true, fixed: true),
    ];
  }

  @override
  Future<Set<String>> trackPlaylists(String trackId) async {
    membershipCalls.add(trackId);
    return {'a'};
  }
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late AppState app;
  late _ListsSource src;

  setUp(() {
    app = AppState();
    src = _ListsSource();
    app.sources.add(src);
  });
  tearDown(() => app.dispose());

  test(
    'editablePlaylists: hides playlists that already contain the track',
    () async {
      final list = await app.editablePlaylists('lists', trackId: 't1');
      expect(list.map((p) => p.id), ['b']);
      expect(src.membershipCalls, ['t1']);
    },
  );

  test(
    'editablePlaylists: keeps the cached list without track context',
    () async {
      final all = await app.editablePlaylists('lists');
      expect(all.map((p) => p.id), ['a', 'b']);

      final filtered = await app.editablePlaylists('lists', trackId: 't1');
      expect(filtered.map((p) => p.id), ['b']);
      expect(
        src.playlistsCalls,
        1,
        reason: 'the filtered call reuses the cached playlists',
      );
    },
  );

  test(
    'editablePlaylists: no filtering when the source has no membership op',
    () async {
      final noMembership = _ListsSource(
        withMembership: false,
        sourceId: 'lists2',
      );
      app.sources.add(noMembership);
      final list = await app.editablePlaylists('lists2', trackId: 't1');
      expect(list.map((p) => p.id), ['a', 'b']);
    },
  );
}
