// Small helpers for dealing with the OS: user directories, opening folders or URLs.

import 'dart:io';

/// The user's home directory (Windows has no HOME, so USERPROFILE is used).
String get homeDir =>
    Platform.environment['HOME'] ?? Platform.environment['USERPROFILE'] ?? '';

/// Opens a folder, file or http(s) URL with the system default program.
void openExternal(String target) {
  final (cmd, args) = Platform.isMacOS
      ? ('open', [target])
      : Platform.isWindows
      ? ('explorer', [target])
      : ('xdg-open', [target]);
  Process.start(cmd, args, mode: ProcessStartMode.detached).ignore();
}
