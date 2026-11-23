import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/state.dart';

void main() {
  test('flutter test 下数据目录在临时目录里，不碰用户真实数据', () {
    final dir = AppState.supportDir();
    expect(dir, startsWith(Directory.systemTemp.path));
    expect(dir, isNot(contains('Application Support')));
  });
}
