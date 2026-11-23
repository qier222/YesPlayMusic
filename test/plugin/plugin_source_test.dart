import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:path/path.dart' as p;
import 'package:yesplaymusic/comments.dart';
import 'package:yesplaymusic/music/models.dart';
import 'package:yesplaymusic/music/source.dart';
import 'package:yesplaymusic/plugin/plugin_source.dart';

import 'fixture.dart';

Matcher sourceError(SourceErrorKind k) =>
    throwsA(isA<SourceError>().having((e) => e.kind, 'kind', k));

void main() {
  late Directory tmp;
  late HttpServer server;
  late String plugins, data;

  setUp(() async {
    tmp = Directory.systemTemp.createTempSync('ypm_psrc_');
    server = await fixtureServer();
    plugins = p.join(tmp.path, 'plugins');
    data = p.join(tmp.path, 'data');
  });
  tearDown(() async {
    await server.close(force: true);
    tmp.deleteSync(recursive: true);
  });

  // Plugins run in their own isolate: search results become models, songs are tagged with the plugin id;
  // settings are written to the data directory and survive restarts; ops not exported have can() false.
  test('plugin as a Source', () async {
    final s = await PluginSource.start(writeFixture(plugins), dataRoot: data);
    addTearDown(s.close);
    expect(s.can(Op.search), isTrue);
    expect(s.can(Op.album), isFalse);
    expect(s.ops, isNot(contains('misc')));
    await expectLater(s.album('x'), sourceError(SourceErrorKind.unsupported));

    await s.setSetting('server', 'http://127.0.0.1:${server.port}');
    final r = await s.search('Hammer', SearchKind.tracks);
    expect(r.tracks.single.name, 'Hammer|1');
    expect(r.tracks.single.key, 'fixture:1');

    final st = await Sources()
        .let((ss) => ss..add(s))
        .stream(r.tracks.single, quality: 'lossless');
    expect(st.url, endsWith('/bin?q=lossless'));
    await expectLater(s.stream('bad'), sourceError(SourceErrorKind.failed));
    expect((await s.stream('own')).url, endsWith('/fixture/index.js'));
    await expectLater(s.lyrics('1'), sourceError(SourceErrorKind.signIn));

    await s.close();
    final again = await PluginSource.start(
      p.join(plugins, 'fixture'),
      dataRoot: data,
    );
    addTearDown(again.close);
    expect(again.setting('server'), 'http://127.0.0.1:${server.port}');
    await expectLater(
      again.close().then((_) => again.home()),
      sourceError(SourceErrorKind.failed),
    );
  });

  // Comments: paged fetching, posting with the replied-to id, likes; CommentFeed reverts when the source errors.
  test('comments', () async {
    final s = await PluginSource.start(writeFixture(plugins), dataRoot: data);
    addTearDown(s.close);
    expect(s.can(Op.comments), isTrue);
    expect(s.can(Op.postComment), isTrue);

    final p1 = await s.comments('t1', sort: 'new');
    expect(p1.total, 3);
    expect(p1.more, isTrue);
    final c = p1.comments.single;
    expect(c.id, 'new-0');
    expect(c.userName, '晚风');
    expect(c.likes, 2);
    expect(c.replyTo?.userName, 'Sea');
    expect(c.replyTo?.text, '隔着一层水');

    final posted = await s.postComment('t1', '你好', replyTo: 'c9');
    expect(posted?.text, 't1:你好:c9');

    final feed = CommentFeed(s, 't1', CommentSort.hot);
    addTearDown(feed.dispose);
    while (feed.loading) {
      await Future<void>.delayed(const Duration(milliseconds: 5));
    }
    expect(feed.items.map((c) => c.id), ['hot-0']);
    await feed.loadMore();
    expect(feed.items.map((c) => c.id), ['hot-0', 'hot-1']);
    expect(feed.more, isFalse);

    await feed.like(feed.items.first);
    expect(feed.items.first.liked, isTrue);
    expect(feed.items.first.likes, 3);

    feed.items.add(const Comment(id: 'bad', text: ''));
    await expectLater(feed.like(feed.items.last), throwsA(anything));
    expect(feed.items.last.liked, isFalse);

    await feed.post('嗨');
    expect(feed.items.first.id, 'new');
    expect(feed.total, 4);
  });

  // Loading the plugin directory: broken plugins and duplicate ids don't affect other plugins, and the reasons are recorded.
  test('startPlugins skips bad ones', () async {
    writeFixture(plugins, id: 'good');
    Directory(p.join(plugins, 'broken')).createSync(recursive: true);
    File(p.join(plugins, 'broken', 'plugin.json')).writeAsStringSync('{');
    writeFixture(plugins, id: 'bad-main');
    File(p.join(plugins, 'bad-main', 'index.js'))
        .writeAsStringSync('export function search( {');
    final failed = <String, String>{};
    final ss = await startPlugins(plugins, dataRoot: data, failed: failed);
    for (final s in ss) {
      addTearDown(s.close);
    }
    expect(ss.map((s) => s.id), ['good']);
    expect(
      failed.keys.map(p.basename),
      unorderedEquals(['broken', 'bad-main']),
    );
    expect(failed[p.join(plugins, 'broken')], contains('不是合法 JSON'));
    expect(failed[p.join(plugins, 'bad-main')], contains('SyntaxError'));
  });

  // A wrong field type in plugin.json fails only that plugin; later ones start as usual.
  test('startPlugins: odd manifest fails alone', () async {
    Directory(p.join(plugins, 'a-odd')).createSync(recursive: true);
    File(p.join(plugins, 'a-odd', 'plugin.json'))
        .writeAsStringSync('{"id": 123, "name": ["x"]}');
    writeFixture(plugins, id: 'good');
    final failed = <String, String>{};
    final ss = await startPlugins(plugins, dataRoot: data, failed: failed);
    for (final s in ss) {
      addTearDown(s.close);
    }
    expect(ss.map((s) => s.id), ['good']);
    expect(failed.keys.map(p.basename), ['a-odd']);
  });

  // A plugin disabled for an infinite loop: the caller gets the reason, onStopped tells the app, and later calls all fail.
  test('runaway plugin reports why it stopped', () async {
    final s = await PluginSource.start(writeFixture(plugins), dataRoot: data);
    addTearDown(s.close);
    final stopped = <String?>[];
    s.onStopped = (x) => stopped.add(x.stopped);
    await expectLater(s.invoke('spin'), throwsA(anything));
    await pumpEventQueue();
    expect(stopped, hasLength(1));
    expect(stopped.single, contains('5'));
    await expectLater(s.invoke('wait', {'ms': 1}), throwsA(anything));
    // Closing on purpose doesn't count as "stopping mid-run"
    await s.close();
    expect(stopped, hasLength(1));
  }, timeout: const Timeout(Duration(seconds: 30)));
}

extension<T> on T {
  R let<R>(R Function(T) f) => f(this);
}
