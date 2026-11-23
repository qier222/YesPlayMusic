// 和操作系统打交道的小工具：用户目录、打开文件夹或网址。

import 'dart:io';

/// 用户主目录（Windows 上没有 HOME，用 USERPROFILE）。
String get homeDir =>
    Platform.environment['HOME'] ?? Platform.environment['USERPROFILE'] ?? '';

/// 用系统默认的程序打开文件夹、文件或 http(s) 网址。
void openExternal(String target) {
  final (cmd, args) = Platform.isMacOS
      ? ('open', [target])
      : Platform.isWindows
      ? ('explorer', [target])
      : ('xdg-open', [target]);
  Process.start(cmd, args, mode: ProcessStartMode.detached).ignore();
}
