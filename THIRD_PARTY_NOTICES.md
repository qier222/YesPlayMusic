# 第三方组件声明

简体中文 · [English](THIRD_PARTY_NOTICES.en.md)

YesPlayMusic 按 GNU 通用公共许可证第 3 版发布（见 [LICENSE](LICENSE)）。应用包含或链接到下列第三方组件，它们仍遵循各自的许可证。

## 随仓库提供

| 组件 | 位置 | 许可证 |
| --- | --- | --- |
| [QuickJS-ng](https://github.com/quickjs-ng/quickjs) v0.18.0 | `native/quickjs/` | MIT，见 [native/quickjs/LICENSE](native/quickjs/LICENSE) |
| [Archivo](https://github.com/Omnibus-Type/Archivo) 字体 | `assets/fonts/` | SIL 开放字体许可证 1.1，见 [assets/fonts/OFL.txt](assets/fonts/OFL.txt) |

## 构建时链接

| 组件 | 用途 | 许可证 |
| --- | --- | --- |
| [Flutter](https://flutter.dev) 引擎和框架 | 界面 | BSD 3-Clause |
| [media_kit](https://github.com/media-kit/media-kit) | 音频播放 | MIT |
| [libmpv](https://mpv.io)（macOS 和 Windows 由 `media_kit_libs_*` 提供，Linux 使用系统库） | 音频解码和输出 | LGPL-2.1-or-later |
| [FFmpeg](https://ffmpeg.org)（由 libmpv 使用） | 音频解码 | LGPL-2.1-or-later |
| [pointycastle](https://pub.dev/packages/pointycastle) | 插件加密功能 | MIT |
| [flutter_svg](https://pub.dev/packages/flutter_svg) | 图标 | MIT |
| [qr_flutter](https://pub.dev/packages/qr_flutter) | 登录二维码 | BSD 3-Clause |
| [audio_metadata_reader](https://pub.dev/packages/audio_metadata_reader) | 读取本地音乐标签 | MIT |
| [auto_updater](https://pub.dev/packages/auto_updater) | 自动更新 | MIT |
| [Sparkle](https://sparkle-project.org)（macOS） | 自动更新 | MIT |
| [WinSparkle](https://winsparkle.org)（Windows） | 自动更新 | MIT |

完整的依赖列表及确切版本见 [pubspec.lock](pubspec.lock)。

## 商标

YesPlayMusic 不内置任何音乐服务。本仓库或插件中提到的第三方音乐服务名称是其各自所有者的商标，仅用于说明兼容性。
