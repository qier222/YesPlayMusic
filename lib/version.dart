/// 应用版本，和 pubspec.yaml 的 version 一致（test/version_test.dart 检查）。
const appVersion = '3.0.0';

/// 比较两个 x.y.z 版本号：a 比 b 新返回正数，相同 0，旧负数。
/// 缺的段当 0，-beta 这类后缀忽略。
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
