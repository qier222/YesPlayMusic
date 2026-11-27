import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/data.dart';
import 'package:yesplaymusic/media_session.dart';
import 'package:yesplaymusic/music/eq.dart';
import 'package:yesplaymusic/music/models.dart' as m;
import 'package:yesplaymusic/music/player.dart';
import 'package:yesplaymusic/music/source.dart';
import 'package:yesplaymusic/state.dart';

class _StubSource extends Source {
  @override
  final m.SourceInfo info = const m.SourceInfo(id: 'local', name: 'local');

  @override
  final Set<String> ops = {Op.stream};

  @override
  Future<m.AudioStream> stream(String id, {String quality = 'high'}) async =>
      m.AudioStream(url: 'file:///music/$id.flac', type: 'flac');
}

class _StubEngine implements PlaybackEngine {
  @override
  void Function(Duration)? onPosition, onDuration;
  @override
  void Function(bool)? onPlaying;
  @override
  void Function()? onCompleted;
  @override
  void Function(String)? onError;
  @override
  void Function(String key)? onAdvanced;

  @override
  String? get queuedKey => null;

  @override
  Duration duration = const Duration(seconds: 180);

  Duration? sought;

  @override
  Future<Duration> readDuration() async => duration;

  @override
  Future<void> open(
    m.AudioStream s, {
    required String key,
    bool play = true,
    Duration? start,
    String rg = 'no',
    double gainDb = 0,
  }) async {}

  @override
  Future<void> queueNext(
    m.AudioStream s, {
    required String key,
    String rg = 'no',
    double gainDb = 0,
  }) async {}

  @override
  Future<void> dropQueued() async {}

  @override
  Future<void> setReplayGain(String rg, double gainDb) async {}

  @override
  Future<void> setEq(EqSettings s) async {}

  @override
  Future<void> play() async {}

  @override
  Future<void> pause() async {}

  @override
  Future<void> seek(Duration d) async => sought = d;

  @override
  Future<void> setVolume(double v) async {}

  @override
  Future<void> setFade(double f) async {}

  @override
  Future<void> stop() async {}

  @override
  Future<void> dispose() async {}
}

Track _track(String id) => Track.of(
  m.Track(
    id: id,
    name: 'Song $id',
    source: 'local',
    duration: 180000,
    artists: const [m.Artist(id: 'a1', name: 'Artist')],
    album: const m.Album(id: 'al1', name: 'Album'),
  ),
);

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late AppState app;
  late MediaSession session;
  late MethodChannel channel;
  late List<MethodCall> outgoing;
  late PlaybackEngine Function() prevFactory;

  setUp(() {
    prevFactory = AppState.engineFactory;
    AppState.engineFactory = _StubEngine.new;
    app = AppState();
    app.sources.add(_StubSource());
    app.clearQueue();
    if (app.shuffle) app.toggleShuffle();
    if (!app.repeat) app.toggleRepeat();

    outgoing = [];
    channel = const MethodChannel('yesplaymusic/media_test');
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(channel, (call) async {
          outgoing.add(call);
          return null;
        });
    session = MediaSession(
      app,
      channel: channel,
      isWindows: true,
      isMacOS: false,
    );
  });

  tearDown(() {
    session.detach();
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(channel, null);
    app.dispose();
    AppState.engineFactory = prevFactory;
  });

  Future<void> dispatch(String method, [Object? arguments]) async {
    final data = const StandardMethodCodec().encodeMethodCall(
      MethodCall(method, arguments),
    );
    await TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .handlePlatformMessage(channel.name, data, (_) {});
  }

  test('syncs shuffle, repeat, liked, and clear state changes', () async {
    session.attach();
    outgoing.clear();

    app.playList([_track('1'), _track('2')]);
    await pumpEventQueue();

    final updates = outgoing.where((c) => c.method == 'update').toList();
    expect(updates, isNotEmpty);
    final initial = Map<Object?, Object?>.from(updates.last.arguments as Map);
    expect(initial['title'], 'Song 1');
    expect(initial['artist'], 'Artist');
    expect(initial['album'], 'Album');
    expect(initial['playing'], isTrue);
    expect(initial['shuffle'], isFalse);
    expect(initial['repeat'], isTrue);
    expect(initial['liked'], isFalse);

    outgoing.clear();
    app.toggleShuffle();
    expect(outgoing.single.method, 'update');
    expect((outgoing.single.arguments as Map)['shuffle'], isTrue);

    outgoing.clear();
    app.toggleRepeat();
    expect(outgoing.single.method, 'update');
    expect((outgoing.single.arguments as Map)['repeat'], isFalse);

    outgoing.clear();
    app.toggleLike();
    expect(outgoing.single.method, 'update');
    expect((outgoing.single.arguments as Map)['liked'], isTrue);

    outgoing.clear();
    app.clearQueue();
    expect(outgoing.single.method, 'clear');
  });

  test('handles playback, shuffle, repeat, stop, and like commands', () async {
    session.attach();
    app.playList([_track('1'), _track('2')]);
    await pumpEventQueue();
    app.seekTo(42);

    await dispatch('pause');
    expect(app.playing, isFalse);

    await dispatch('play');
    expect(app.playing, isTrue);

    await dispatch('stop');
    expect(app.playing, isFalse);
    expect(app.position, 0);
    expect(app.queue, hasLength(2));

    await dispatch('shuffle', true);
    expect(app.shuffle, isTrue);
    await dispatch('shuffle', true);
    expect(app.shuffle, isTrue);
    await dispatch('shuffle');
    expect(app.shuffle, isFalse);

    await dispatch('repeat', false);
    expect(app.repeat, isFalse);
    await dispatch('repeat');
    expect(app.repeat, isTrue);

    await dispatch('like');
    expect(app.isLiked, isTrue);
    await dispatch('like');
    expect(app.isLiked, isFalse);

    await dispatch('seek', 25.5);
    expect(app.position, 25.5);

    await dispatch('next');
    expect(app.track.ref?.id, '2');

    app.seekTo(0);
    await dispatch('previous');
    expect(app.track.ref?.id, '1');

    await dispatch('openNowPlaying');
    expect(app.npOpen, isTrue);
  });

  test('ignores like command when queue is empty', () async {
    session.attach();
    await dispatch('like');
    expect(app.liked, isEmpty);
  });
}
