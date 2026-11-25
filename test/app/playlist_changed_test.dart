import 'dart:convert';
import 'dart:io';

import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:path/path.dart' as p;
import 'package:yesplaymusic/data.dart';
import 'package:yesplaymusic/l10n/l10n.dart';
import 'package:yesplaymusic/menus.dart';
import 'package:yesplaymusic/music/models.dart' as m;
import 'package:yesplaymusic/music/source.dart';
import 'package:yesplaymusic/state.dart';

/// A streaming-style source whose library is liked songs, saved albums and playlists. Counts every fetch.
class _ListsSource extends Source {
  @override
  final info = const m.SourceInfo(id: 'lists', name: 'Lists');

  @override
  final ops = {Op.liked, Op.savedAlbums, Op.playlists, Op.addToPlaylist};

  var likedCalls = 0, albumsCalls = 0, playlistsCalls = 0;
  var count = 1;
  var failPlaylists = false;
  final added = <String>[];

  @override
  Future<m.TrackPage> liked({int offset = 0}) async {
    likedCalls += 1;
    return const m.TrackPage(
      tracks: [m.Track(id: 's1', name: 'Song', duration: 1000)],
    );
  }

  @override
  Future<List<m.Album>> savedAlbums({int offset = 0}) async {
    albumsCalls += 1;
    return const [];
  }

  @override
  Future<List<m.Playlist>> playlists() async {
    playlistsCalls += 1;
    if (failPlaylists) throw SourceError(SourceErrorKind.failed, 'offline');
    return [
      m.Playlist(id: 'a', name: 'A', mine: true, trackCount: count),
      const m.Playlist(id: 'b', name: 'B', mine: true),
    ];
  }

  @override
  Future<void> addToPlaylist(String id, List<String> trackIds) async {
    added.add(id);
    count += trackIds.length;
  }
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  final prefsFile = File(p.join(AppState.supportDir(), 'prefs.json'));
  late bool hadPrefs;
  late bool hadSource;
  late AppState app;
  late _ListsSource src;
  final song = Track.of(
    const m.Track(id: 's1', name: 'Song', source: 'lists', duration: 1000),
  );

  setUp(() {
    hadPrefs = prefsFile.existsSync();
    hadSource =
        hadPrefs &&
        (jsonDecode(prefsFile.readAsStringSync()) as Map).containsKey('source');
    app = AppState();
    src = _ListsSource();
    app.sources.add(src);
  });

  tearDown(() {
    app.dispose();
    // setSource writes the current source to prefs: remove what this test wrote.
    if (!prefsFile.existsSync()) return;
    if (!hadPrefs) {
      prefsFile.deleteSync();
    } else if (!hadSource) {
      final j = (jsonDecode(prefsFile.readAsStringSync()) as Map)
        ..remove('source');
      prefsFile.writeAsStringSync(jsonEncode(j));
    }
  });

  Future<SourceLibrary> loadLibrary() async {
    app.setSource('lists');
    final lib = app.library!;
    await pumpEventQueue();
    expect(lib.loading, isEmpty);
    expect(lib.playlists.first.trackCount, 1);
    expect((src.likedCalls, src.albumsCalls, src.playlistsCalls), (1, 1, 1));
    return lib;
  }

  test(
    'addToPlaylist: refetches only the library playlists, not tracks or albums',
    () async {
      final lib = await loadLibrary();
      final tracks = lib.tracks, albums = lib.albums, artists = lib.artists;

      await app.addToPlaylist(song, lib.playlists.first);
      await pumpEventQueue();

      expect(src.added, ['a']);
      expect(identical(app.library, lib), isTrue);
      expect(lib.playlists.first.trackCount, 2);
      expect(src.playlistsCalls, 2);
      expect(src.likedCalls, 1);
      expect(src.albumsCalls, 1);
      expect(identical(lib.tracks, tracks), isTrue);
      expect(identical(lib.albums, albums), isTrue);
      expect(identical(lib.artists, artists), isTrue);
    },
  );

  test('addToPlaylist: a failed playlists refetch keeps the cards', () async {
    final lib = await loadLibrary();
    final before = lib.playlists;

    src.failPlaylists = true;
    await app.addToPlaylist(song, before.first);
    await pumpEventQueue();

    expect(src.playlistsCalls, 2);
    expect(identical(lib.playlists, before), isTrue);
    expect(lib.errors, isEmpty);
  });

  testWidgets('Add to playlist submenu leaves out the playlist it was opened '
      'from', (tester) async {
    late BuildContext ctx;
    await tester.pumpWidget(
      WidgetsApp(
        color: const Color(0xFF000000),
        locale: const Locale('en'),
        supportedLocales: AppLocalizations.supportedLocales,
        localizationsDelegates: const [
          AppLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
        ],
        builder: (context, _) => AppScope(
          state: app,
          child: Builder(
            builder: (context) {
              ctx = context;
              return const SizedBox();
            },
          ),
        ),
      ),
    );

    Future<List<String>> submenu(String playlist) async {
      final spec = trackMenu(ctx, song, playlist: playlist);
      final add = spec.groups
          .expand((g) => g)
          .singleWhere((i) => i.id == 'addToPlaylist');
      final items = await tester.runAsync(add.subLoad!);
      return [for (final i in items!) i.label];
    }

    expect(await submenu(''), ['A', 'B']);
    expect(await submenu('a'), ['B']);
  });
}
