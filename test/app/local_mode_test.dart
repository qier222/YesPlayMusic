import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/data.dart';
import 'package:yesplaymusic/music/models.dart' as m;
import 'package:yesplaymusic/music/source.dart';
import 'package:yesplaymusic/state.dart';

class _Remote extends Source {
  _Remote(String id, this.ops) : info = m.SourceInfo(id: id, name: id);

  @override
  final m.SourceInfo info;

  @override
  final Set<String> ops;
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late AppState app;
  setUp(() {
    app = AppState();
    app.sources.add(_Remote('remote', {Op.home, Op.browse}));
    app.sources.add(_Remote('homeOnly', {Op.home}));
    app.sources.add(_Remote('bare', {}));
    app.pluginsLoaded = true;
  });
  tearDown(() => app.dispose());

  test('本地模式：没有首页和发现，⌘1～4 只对应音乐库和搜索', () {
    app.setSource('local');
    expect(app.localMode, isTrue);
    expect(app.visibleTabs, [2, 3]);
    app.goTab(0);
    expect(app.path, '/library/albums');
    app.goTab(1);
    expect(app.path, '/library/albums');
  });

  test('换成本地时停在首页：换到音乐库', () {
    app.setSource('remote');
    expect(app.localMode, isFalse);
    expect(app.visibleTabs, [0, 1, 2, 3]);
    app.goTab(0);
    expect(app.path, '/home');
    app.setSource('local');
    expect(app.path, '/library/albums');
  });

  test('插件不提供 browse：没有发现，换过去回到首页', () {
    app.setSource('remote');
    app.goTab(1);
    expect(app.path, '/discover');
    app.setSource('homeOnly');
    expect(app.hasHome, isTrue);
    expect(app.hasDiscover, isFalse);
    expect(app.visibleTabs, [0, 2, 3]);
    expect(app.path, '/home');
    app.goTab(1);
    expect(app.path, '/library/albums');
  });

  test('换源时回到新源的起始页，清掉历史', () {
    app.setSource('remote');
    expect(app.path, '/home');
    app.go('/album/x');
    app.setSource('bare');
    expect(app.path, '/library/albums');
    expect(app.canBack, isFalse);
    expect(app.canForward, isFalse);
  });

  test('在设置里换源：留在设置，后退回到起始页', () {
    app.setSource('bare');
    app.go('/settings');
    app.setSource('remote');
    expect(app.path, '/settings');
    app.back();
    expect(app.path, '/home');
    expect(app.canBack, isFalse);
  });

  test('插件两个都不提供：和本地模式一样', () {
    app.setSource('bare');
    expect(app.visibleTabs, [2, 3]);
  });

  test('插件还没加载完：先当作有首页和发现', () {
    app.pluginsLoaded = false;
    app.setSource('notLoaded');
    expect(app.hasHome, isTrue);
    expect(app.hasDiscover, isTrue);
  });

  test('换源时清空播放队列，关掉正在播放', () async {
    app.setSource('remote');
    app.playList([
      Track.of(
        const m.Track(id: '1', name: 'A', source: 'nosrc', duration: 1000),
      ),
    ]);
    app.openNowPlaying();
    expect(app.queue, isNotEmpty);
    app.setSource('homeOnly');
    expect(app.queue, isEmpty);
    expect(app.npOpen, isFalse);
    expect(app.queueFrom, '');
    // 等 _sync 取地址失败，再 dispose
    await Future<void>.delayed(const Duration(milliseconds: 350));
  });
}
