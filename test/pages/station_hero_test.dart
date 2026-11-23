// 首页电台大卡片：放了一个电台再换去放另一个，前一个停在刚才放的那首（封面不能消失、歌不能变）。
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/music/models.dart' as m;
import 'package:yesplaymusic/music/source.dart';
import 'package:yesplaymusic/state.dart';
import 'package:yesplaymusic/ui.dart';

import 'pages_smoke_test.dart' show appFor, prepareEnv;

class _Radio extends Source {
  var _n = 0;

  @override
  final info = const m.SourceInfo(id: 'radio', name: 'Radio');

  @override
  Set<String> get ops => {Op.home, Op.station};

  @override
  Future<m.Browse> home() async => const m.Browse(
    sections: [
      m.Section(
        style: 'modes',
        modes: [
          m.Mode(title: '电台甲', station: 'a'),
          m.Mode(title: '电台乙', station: 'b'),
        ],
      ),
    ],
  );

  @override
  Future<m.TrackPage> station(String id, {String seed = ''}) async {
    _n++;
    return m.TrackPage(
      tracks: [
        for (var i = 0; i < 3; i++)
          m.Track(
            id: '$id$_n-$i',
            name: '$id 第 $_n 批 $i',
            source: 'nosrc',
            duration: 1000,
            album: m.Album(id: 'al', name: 'x', imageUrl: 'cover-$id-$_n-$i'),
          ),
      ],
      more: true,
    );
  }
}

Future<void> _frames(WidgetTester t) async {
  for (var i = 0; i < 10; i++) {
    await t.pump(const Duration(milliseconds: 100));
  }
}

/// 电台卡片上铺的封面（大卡片里宽度最大的那张）。
Iterable<String> _heroCovers(WidgetTester t) => t
    .widgetList<Cover>(find.byType(Cover))
    .where((c) => (c.w ?? 0) > 200)
    .map((c) => c.id);

void main() {
  setUpAll(prepareEnv);

  testWidgets('放过的电台换走以后停在刚才那首', (t) async {
    t.view.physicalSize = const Size(1280, 800);
    t.view.devicePixelRatio = 1;
    addTearDown(t.view.reset);
    final app = AppState()..clearQueue();
    addTearDown(app.dispose);
    app.sources.add(_Radio());
    app.setSource('radio');
    await t.pumpWidget(appFor(app));
    app.open('/home');
    await _frames(t);
    expect(_heroCovers(t).length, 2);

    // 点卡片上的播放：先放甲，再放乙
    await t.tap(find.byType(PlayPill).at(0));
    await _frames(t);
    expect(app.queueName, '电台甲');
    final playedA = app.track.cover, titleA = app.track.title;
    await t.tap(find.byType(PlayPill).at(1));
    await _frames(t);
    expect(app.queueName, '电台乙');
    // 甲不在放了：卡片停在刚才放的那首，封面也是它
    expect(_heroCovers(t).length, 2);
    expect(_heroCovers(t).first, playedA);
    expect(find.text(titleA), findsOneWidget);
    // 再放甲：从那首接着放
    await t.tap(find.byType(PlayPill).at(0));
    await _frames(t);
    expect(app.track.title, titleA);
    expect(t.takeException(), isNull);
    app.clearQueue();
    await _frames(t);
  });
}
