import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:yesplaymusic/l10n/l10n.dart';

void main() {
  final d = DateTime(2026, 11, 23);

  // Home date line: must not throw before date data is initialised (it used to throw even for the English fallback),
  // and after initialisation it's formatted for the UI language. The two steps are ordered, so they're in one test.
  test('formatHomeDate', () async {
    expect(formatHomeDate(d, const Locale('zh')), 'Monday, November 23');
    await initializeDateFormatting();
    expect(formatHomeDate(d, const Locale('zh')), contains('11月23日'));
    expect(formatHomeDate(d, const Locale('ja')), contains('11月23日'));
    expect(formatHomeDate(d, const Locale('en')), 'Monday, November 23');
  });
}
