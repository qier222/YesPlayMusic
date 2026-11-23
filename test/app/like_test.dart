import 'dart:async';

import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/data.dart';
import 'package:yesplaymusic/music/models.dart' as m;
import 'package:yesplaymusic/music/source.dart';
import 'package:yesplaymusic/state.dart';

/// When like returns is decided by the test.
class _LikeSource extends Source {
  @override
  final info = const m.SourceInfo(id: 'likes', name: 'Likes');

  @override
  final ops = {Op.like};

  final calls = <bool>[];
  final pending = <Completer<void>>[];

  @override
  Future<void> like(String id, bool on) {
    calls.add(on);
    final c = Completer<void>();
    pending.add(c);
    return c.future;
  }
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late AppState app;
  late _LikeSource src;
  final t = Track.of(
    const m.Track(id: 's1', name: 'Song', source: 'likes', duration: 1000),
  );

  setUp(() {
    app = AppState();
    src = _LikeSource();
    app.sources.add(src);
  });
  tearDown(() => app.dispose());

  test('toggleLike: 请求没回来时再点不理', () async {
    app.toggleLike(t);
    expect(app.liked, contains(t.key));
    app.toggleLike(t);
    app.toggleLike(t);
    expect(src.calls, [true]);
    expect(app.liked, contains(t.key));

    src.pending.single.complete();
    await pumpEventQueue();
    app.toggleLike(t);
    expect(src.calls, [true, false]);
    expect(app.liked, isNot(contains(t.key)));
    src.pending.last.complete();
    await pumpEventQueue();
  });

  test('toggleLike: 失败回滚后可以再点', () async {
    app.toggleLike(t);
    src.pending.single.completeError(SourceError(SourceErrorKind.failed, 'x'));
    await pumpEventQueue();
    expect(app.liked, isNot(contains(t.key)));
    app.toggleLike(t);
    expect(src.calls, [true, true]);
    src.pending.last.complete();
    await pumpEventQueue();
  });
}
