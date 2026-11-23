import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/version.dart';

void main() {
  test('appVersion 和 pubspec.yaml 一致', () {
    final m = RegExp(
      r'^version:\s*([0-9.]+)',
      multiLine: true,
    ).firstMatch(File('pubspec.yaml').readAsStringSync());
    expect(m?.group(1), appVersion);
  });

  test('compareVersions', () {
    expect(compareVersions('3.0.0', '3.0.0'), 0);
    expect(compareVersions('3.0.1', '3.0.0'), greaterThan(0));
    expect(compareVersions('v3.1', '3.0.9'), greaterThan(0));
    expect(compareVersions('2.9.9', '3.0'), lessThan(0));
    expect(compareVersions('3.0.0-beta.1', '3.0.0'), 0);
  });
}
