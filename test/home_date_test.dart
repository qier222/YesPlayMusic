import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:yesplaymusic/l10n/l10n.dart';

void main() {
  final d = DateTime(2026, 11, 23);

  // 首页日期行：没初始化日期数据时不能抛异常（原来连英文兜底也会抛），
  // 初始化后按界面语言格式化。两步有先后，写在一个测试里。
  test('formatHomeDate', () async {
    expect(formatHomeDate(d, const Locale('zh')), 'Monday, November 23');
    await initializeDateFormatting();
    expect(formatHomeDate(d, const Locale('zh')), contains('11月23日'));
    expect(formatHomeDate(d, const Locale('ja')), contains('11月23日'));
    expect(formatHomeDate(d, const Locale('en')), 'Monday, November 23');
  });
}
