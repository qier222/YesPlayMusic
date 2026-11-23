/// App version, same as version in pubspec.yaml (checked by test/version_test.dart).
const appVersion = '3.0.0';

/// Compares two x.y.z versions: positive if a is newer than b, 0 if equal, negative if older.
/// Missing segments count as 0; suffixes like -beta are ignored.
int compareVersions(String a, String b) {
  List<int> parts(String v) => [
    for (final s
        in v
            .trim()
            .replaceFirst(RegExp(r'^v'), '')
            .split(RegExp(r'[-+]'))
            .first
            .split('.'))
      int.tryParse(s) ?? 0,
  ];
  final x = parts(a), y = parts(b);
  for (var i = 0; i < 3; i++) {
    final d = (i < x.length ? x[i] : 0) - (i < y.length ? y[i] : 0);
    if (d != 0) return d;
  }
  return 0;
}
