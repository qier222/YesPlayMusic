import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/music/models.dart' as m;
import 'package:yesplaymusic/pages/home_sections.dart';

void main() {
  test('只有歌手的 shelf 区块也用横向滑动的卡片行', () {
    const s = m.Section(
      style: 'shelf',
      title: '相似歌手',
      artists: [m.Artist(id: 'a1', name: '歌手')],
    );
    expect(homeSection('src', s), isA<Shelf>());
  });
}
