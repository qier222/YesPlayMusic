import 'dart:ffi';

import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/updater.dart';

void main() {
  test('Intel 与 Apple Silicon 使用独立更新源，保留原 ARM 更新地址', () {
    expect(appcastFileName(Abi.macosX64), 'appcast-macos-x64.xml');
    expect(appcastFileName(Abi.macosArm64), 'appcast-macos.xml');
    expect(appcastFileName(Abi.windowsX64), 'appcast-windows.xml');
  });
}
