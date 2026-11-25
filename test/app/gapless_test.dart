import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:path/path.dart' as p;
import 'package:yesplaymusic/cache/requests.dart';
import 'package:yesplaymusic/data.dart';
import 'package:yesplaymusic/mcp/config.dart';
import 'package:yesplaymusic/mcp/resources.dart';
import 'package:yesplaymusic/mcp/tool_registry.dart';
import 'package:yesplaymusic/mcp/tools_core.dart';
import 'package:yesplaymusic/music/eq.dart';
import 'package:yesplaymusic/music/models.dart' as m;
import 'package:yesplaymusic/music/player.dart';
import 'package:yesplaymusic/music/replay_gain.dart';
import 'package:yesplaymusic/music/source.dart';
import 'package:yesplaymusic/state.dart';

import '../music/local_source_test.dart' show wav;

/// Fake local source: every track is a file:// URL.
class _Local extends Source {
  @override
  final m.SourceInfo info = const m.SourceInfo(id: 'local', name: 'local');

  @override
  final Set<String> ops = {Op.stream};

  @override
  Future<m.AudioStream> stream(String id, {String quality = 'high'}) async =>
      m.AudioStream(url: 'file:///music/$id.flac', type: 'flac', gain: -5);
}

/// Fake engine: records opened / queued tracks; [finish] simulates the current track ending.
class _Engine implements PlaybackEngine {
  final opened = <String>[];
  final openedRg = <String>[];
  String? current;
  @override
  String? queuedKey;
  String queuedRg = '';
  double fade = 1;
  EqSettings eq = const EqSettings();
  Duration durationOnOpen = Duration.zero;
  Duration? loadedDuration;
  Duration? sought;

  @override
  Duration duration = Duration.zero;

  @override
  Future<Duration> readDuration() async => loadedDuration ?? duration;

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

  /// The current track ends: move on to the queued one, otherwise everything finished.
  void finish() {
    final q = queuedKey;
    if (q == null) return onCompleted!();
    queuedKey = null;
    current = q;
    onAdvanced!(q);
  }

  /// Reports duration and position (seconds).
  void at(double pos, {double total = 180}) {
    duration = Duration(milliseconds: (total * 1000).round());
    onDuration!(duration);
    onPosition!(Duration(milliseconds: (pos * 1000).round()));
  }

  @override
  Future<void> open(
    m.AudioStream s, {
    required String key,
    bool play = true,
    Duration? start,
    String rg = 'no',
    double gainDb = 0,
  }) async {
    opened.add(key);
    openedRg.add(rg);
    current = key;
    queuedKey = null;
    duration = durationOnOpen;
    onDuration?.call(duration);
  }

  @override
  Future<void> queueNext(
    m.AudioStream s, {
    required String key,
    String rg = 'no',
    double gainDb = 0,
  }) async {
    queuedKey = key;
    queuedRg = rg;
  }

  @override
  Future<void> dropQueued() async => queuedKey = null;
  @override
  Future<void> setReplayGain(String rg, double gainDb) async {}
  @override
  Future<void> setEq(EqSettings s) async => eq = s;
  @override
  Future<void> play() async {}
  @override
  Future<void> pause() async {}
  @override
  Future<void> seek(Duration d) async => sought = d;
  @override
  Future<void> setVolume(double v) async {}
  @override
  Future<void> setFade(double f) async => fade = f;
  @override
  Future<void> stop() async {
    current = null;
    queuedKey = null;
  }

  @override
  Future<void> dispose() async {}
}

Track _t(String id, {int duration = 180000}) => Track.of(
  m.Track(id: id, name: 'Song $id', source: 'local', duration: duration),
);

String _key(String id) => _t(id).key;

Future<void> _tick() => Future<void>.delayed(const Duration(milliseconds: 30));

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late AppState app;
  late _Engine engine;
  setUp(() async {
    engine = _Engine();
    AppState.engineFactory = () => engine;
    app = AppState();
    app.clearQueue();
    if (app.shuffle) app.toggleShuffle();
    if (!app.repeat) app.toggleRepeat();
    app.setGainMode(GainMode.off);
    app.setSleepTimer(null);
    app.sources.add(_Local());
  });
  tearDown(() async {
    await _tick();
    app.dispose();
    AppState.engineFactory = AudioEngine.new;
  });

  Future<void> start(List<String> ids, {String from = ''}) async {
    app.playList([for (final i in ids) _t(i)], from: from);
    await _tick();
    expect(engine.current, _key(ids.first));
  }

  test('rescan refreshes cached and currently playing local lyrics', () async {
    final music = await Directory.systemTemp.createTemp('ypm_rescan_');
    addTearDown(() => music.delete(recursive: true));
    final first = wav(p.join(music.path, 'First.wav'), ms: 180000);
    final second = wav(p.join(music.path, 'Second.wav'), ms: 180000);
    final firstLyrics = File(p.join(music.path, 'First.lrc'))
      ..writeAsStringSync('[00:00.00]First before');
    final secondLyrics = File(p.join(music.path, 'Second.lrc'))
      ..writeAsStringSync('[00:00.00]Second before');

    await app.sources.remove('local');
    app.musicFolders = [music.path];
    expect(await app.loadLibrary(), isTrue);
    app.playList([_t(first.path), _t(second.path)]);
    await _tick();
    engine.at(30);
    expect(app.lyricLines.single.text, 'First before');
    final secondRequest = DataReq.lyrics('local', second.path);
    expect((await app.getData(secondRequest)).lrc, '[00:00.00]Second before');

    firstLyrics.writeAsStringSync('[00:00.00]First after');
    secondLyrics.writeAsStringSync('[00:00.00]Second after');
    await app.rescanLibrary();

    expect(app.lyricLines.single.text, 'First after');
    expect(app.track.key, _key(first.path));
    expect(app.playing, isTrue);
    expect(app.position, 30);
    expect(engine.opened, [_key(first.path)]);
    expect((await app.getData(secondRequest)).lrc, '[00:00.00]Second after');
  });

  test(
    'rescan keeps current lyrics if their folder could not be scanned',
    () async {
      final music = await Directory.systemTemp.createTemp('ypm_rescan_');
      addTearDown(() async {
        await Process.run('chmod', ['700', music.path]);
        await music.delete(recursive: true);
      });
      final song = wav(p.join(music.path, 'Song.wav'));
      final lyrics = File(p.join(music.path, 'Song.lrc'))
        ..writeAsStringSync('[00:00.00]Before');

      await app.sources.remove('local');
      app.musicFolders = [music.path];
      expect(await app.loadLibrary(), isTrue);
      app.playTrack(_t(song.path));
      await _tick();
      expect(app.lyricLines.single.text, 'Before');

      lyrics.writeAsStringSync('[00:00.00]After');
      // Allow reading a known file path, but not listing the folder.
      expect((await Process.run('chmod', ['111', music.path])).exitCode, 0);
      await app.rescanLibrary();
      expect(app.unreadableFolders, [music.path]);
      expect(app.lyricLines.single.text, 'Before');
    },
    skip: Platform.isWindows ? 'needs POSIX permissions' : null,
  );

  test(
    'duration reported during open enables seeking without track metadata',
    () async {
      final track = _t('raw-aac', duration: 0);
      engine.durationOnOpen = const Duration(seconds: 30);
      app.playList([track]);
      await _tick();

      expect(nowPlayingSnapshot(app)['duration'], 30);
      expect(app.track.ref!.duration, 0);
      engine.onPosition!(const Duration(seconds: 6));
      expect(app.progress, closeTo(0.2, 1e-9));
      app.scrub(0.5);
      expect(app.position, 15);
      app.seek(0.5);
      expect(engine.sought, const Duration(seconds: 15));

      final tools = buildCoreTools();
      await tools
          .singleWhere((tool) => tool.name == 'control_playback')
          .handler(
            {'action': 'seek', 'value': 12},
            McpCallContext(
              app: app,
              config: const McpConfig(),
              session: McpSession('test'),
              registry: McpToolRegistry(tools),
            ),
          );
      expect(engine.sought, const Duration(seconds: 12));

      engine.durationOnOpen = Duration.zero;
      app.playList([_t('unknown', duration: 0)]);
      expect(nowPlayingSnapshot(app)['duration'], 0);
      await _tick();
      expect(nowPlayingSnapshot(app)['duration'], 0);

      engine.durationOnOpen = const Duration(seconds: 31);
      app.playList([_t('wav', duration: 30000)]);
      await _tick();
      expect(nowPlayingSnapshot(app)['duration'], 30);
    },
  );

  test('快放完时才排下一首，接上后不重新打开', () async {
    await start(['a', 'b', 'c']);
    engine.at(100);
    await _tick();
    expect(engine.queuedKey, isNull); // 80 seconds left

    engine.at(160);
    await _tick();
    expect(engine.queuedKey, _key('b'));

    engine.finish();
    await _tick();
    expect(app.track.key, _key('b'));
    expect(app.index, 1);
    expect(app.position, 0);
    expect(app.playing, isTrue);
    expect(engine.opened, [_key('a')]); // not opened again
  });

  test('gapless refreshes duration when the stream emits no update', () async {
    app.playList([_t('a'), _t('b', duration: 0), _t('c', duration: 0)]);
    await _tick();
    engine.at(160);
    await _tick();
    expect(engine.queuedKey, _key('b'));

    engine.finish();
    engine.loadedDuration = const Duration(seconds: 180);
    engine.onPosition!(const Duration(seconds: 1));
    await _tick();
    expect(app.playbackDuration, 180);
    app.seekTo(12);
    expect(engine.sought, const Duration(seconds: 12));

    await _tick();
    engine.onPosition!(const Duration(seconds: 160));
    await _tick();
    expect(engine.queuedKey, _key('c'));
    engine.finish();
    engine.loadedDuration = Duration.zero;
    engine.onPosition!(const Duration(seconds: 1));
    await _tick();
    expect(app.playbackDuration, 0);
    expect(engine.opened, [_key('a')]);
  });

  test('排好以后插队：撤掉重排成新的下一首', () async {
    await start(['a', 'b', 'c']);
    engine.at(160);
    await _tick();
    expect(engine.queuedKey, _key('b'));

    app.addNext(_t('x'));
    engine.at(161);
    await _tick();
    expect(engine.queuedKey, _key('x'));

    engine.finish();
    await _tick();
    expect(app.track.key, _key('x'));
    expect(engine.opened, [_key('a')]);
  });

  test('删掉排好的下一首：撤掉，改排后面那首', () async {
    await start(['a', 'b', 'c']);
    engine.at(160);
    await _tick();
    app.removeQueueAt(1);
    engine.at(161);
    await _tick();
    engine.at(162);
    await _tick();
    expect(engine.queuedKey, _key('c'));
  });

  test('最后一首、不循环：不排，放完就停', () async {
    app.toggleRepeat();
    await start(['a', 'b']);
    app.playQueueAt(1);
    await _tick();
    engine.at(170);
    await _tick();
    expect(engine.queuedKey, isNull);
    engine.finish();
    await _tick();
    expect(app.playing, isFalse);
  });

  test('循环：最后一首接回第一首', () async {
    await start(['a', 'b']);
    app.playQueueAt(1);
    await _tick();
    engine.at(170);
    await _tick();
    expect(engine.queuedKey, _key('a'));
    engine.finish();
    await _tick();
    expect(app.index, 0);
  });

  test('睡眠定时「放完这首」：撤掉排好的，放完停在下一首开头', () async {
    await start(['a', 'b', 'c']);
    engine.at(160);
    await _tick();
    expect(engine.queuedKey, _key('b'));

    app.setSleepAfterTrack();
    expect(engine.queuedKey, isNull);
    engine.at(161);
    await _tick();
    expect(engine.queuedKey, isNull); // not queued again

    engine.finish();
    await _tick();
    expect(app.playing, isFalse);
    expect(app.index, 1);
    expect(app.sleepOn, isFalse);
  });

  test('智能音量均衡：专辑顺序用专辑增益；开了随机，下一首改用单曲增益', () async {
    app.setGainMode(GainMode.smart);
    await start(['a', 'b', 'c'], from: 'album:al1');
    expect(engine.openedRg.last, 'album');
    engine.at(160);
    await _tick();
    expect(engine.queuedRg, 'album');

    app.toggleShuffle();
    engine.at(161);
    await _tick();
    engine.at(162);
    await _tick();
    expect(engine.queuedRg, 'track');
  });

  test('睡眠定时：最后 20 秒渐弱，到点暂停并还原音量', () async {
    await start(['a']);
    app.setSleepTimer(const Duration(seconds: 10));
    await Future<void>.delayed(const Duration(milliseconds: 300));
    expect(engine.fade, lessThan(0.3)); // already fading
    app.setSleepTimer(const Duration(milliseconds: 100));
    await Future<void>.delayed(const Duration(milliseconds: 500));
    expect(app.playing, isFalse);
    expect(engine.fade, 1);
  });
}
