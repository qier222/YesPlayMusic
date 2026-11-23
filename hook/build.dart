// 把 QuickJS（native/quickjs，quickjs-ng 合并源码）和我们的 C 封装层
// （native/qjs_shim.c）编译成一个动态库，作为本包的原生资源打进应用。
// Dart 侧用 @Native 按资源 id 'package:yesplaymusic/qjs' 找到它。

import 'dart:io';

import 'package:code_assets/code_assets.dart';
import 'package:hooks/hooks.dart';
import 'package:logging/logging.dart';
import 'package:native_toolchain_c/native_toolchain_c.dart';

void main(List<String> args) async {
  await build(args, (input, output) async {
    if (!input.config.buildCodeAssets) return;
    final os = input.config.code.targetOS;
    await CBuilder.library(
      name: 'ypm_qjs',
      assetName: 'qjs',
      sources: [
        'native/qjs_shim.c',
        'native/quickjs/quickjs-amalgam.c',
        // 热重启时清 mpv 回调，见文件头注释。
        'native/mpv_guard.c',
      ],
      includes: ['native'],
      // MSVC 只认 c11/c17，没有 gnu11
      std: os == OS.windows ? 'c11' : 'gnu11',
      // 不定义 QJS_BUILD_LIBC：插件拿不到 std/os 模块，没有文件和进程能力。
      defines: {
        '_GNU_SOURCE': null,
        // 和 quickjs-ng 自己的 CMakeLists.txt 一致
        if (os == OS.windows) ...{
          'WIN32_LEAN_AND_MEAN': null,
          '_WIN32_WINNT': '0x0601',
        },
      },
      libraries: [if (os == OS.linux || os == OS.android) 'm'],
      // MSVC：quickjs-ng 用 <stdatomic.h>，要显式打开 C11 原子操作；
      // 源码注释是 UTF-8 中文，按 UTF-8 读免得在中文系统上报 C4819。
      flags: os == OS.windows
          ? ['/experimental:c11atomics', '/utf-8']
          : ['-fvisibility=hidden', '-Wno-everything'],
    ).run(
      input: input,
      output: output,
      logger: Logger('')
        ..level = Level.WARNING
        ..onRecord.listen((r) => stderr.writeln(r.message)),
    );
  });
}
