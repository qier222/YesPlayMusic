import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/state.dart';

void main() {
  test('统计里的页面只有种类，不带 id 和参数', () {
    expect(AppState.pageKind('/album/@demo/12345'), '/album');
    expect(AppState.pageKind('/artist/42'), '/artist');
    expect(AppState.pageKind('/library/albums'), '/library/albums');
    expect(AppState.pageKind('/search?q=周杰伦'), '/search');
    expect(AppState.pageKind('/home'), '/home');
    expect(AppState.pageKind('/'), '/');
  });
}
