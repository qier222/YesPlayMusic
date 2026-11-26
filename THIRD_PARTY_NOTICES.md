# Third-Party Notices

YesPlayMusic is licensed under the GNU General Public License v3.0 (see
[LICENSE](LICENSE)). It includes or links against the third-party components
listed below, which remain under their own licenses.

## Bundled in this repository

| Component | Location | License |
| --- | --- | --- |
| [QuickJS-ng](https://github.com/quickjs-ng/quickjs) v0.18.0 | `native/quickjs/` | MIT — see [native/quickjs/LICENSE](native/quickjs/LICENSE) |
| [Archivo](https://github.com/Omnibus-Type/Archivo) font family | `assets/fonts/` | SIL Open Font License 1.1 — see [assets/fonts/OFL.txt](assets/fonts/OFL.txt) |

## Downloaded before building

The KGM v3 lookup table `assets/kugou_key.xz` is downloaded from
[`ghtz08/kugou-kgm-decoder` at `20ee463`](https://github.com/ghtz08/kugou-kgm-decoder/blob/20ee463537e241de443166aec326b99f3bd8f534/assets/kugou_key.xz).
The source repository uses the [Anti 996 License Version 1.0 (Draft)](https://github.com/ghtz08/kugou-kgm-decoder/blob/20ee463537e241de443166aec326b99f3bd8f534/LICENSE).

## Linked at build time

| Component | Used for | License |
| --- | --- | --- |
| [Flutter](https://flutter.dev) engine and framework | UI | BSD 3-Clause |
| [media_kit](https://github.com/media-kit/media-kit) | Audio playback | MIT |
| [libmpv](https://mpv.io) (shipped by `media_kit_libs_*`) | Audio decoding and output | LGPL-2.1-or-later |
| [FFmpeg](https://ffmpeg.org) (shipped by `media_kit_libs_*`) | Audio decoding | LGPL-2.1-or-later |
| [pointycastle](https://pub.dev/packages/pointycastle) | Cryptography for plugins | MIT |
| [flutter_svg](https://pub.dev/packages/flutter_svg) | Icons | MIT |
| [qr_flutter](https://pub.dev/packages/qr_flutter) | Sign-in QR codes | BSD 3-Clause |
| [audio_metadata_reader](https://pub.dev/packages/audio_metadata_reader) | Reading tags of local music | MIT |
| [auto_updater](https://pub.dev/packages/auto_updater) | Automatic updates | MIT |
| [Sparkle](https://sparkle-project.org) (macOS) | Automatic updates | MIT |
| [WinSparkle](https://winsparkle.org) (Windows) | Automatic updates | MIT |

The full dependency list with exact versions is in [pubspec.lock](pubspec.lock).

## Trademarks

YesPlayMusic does not include any music service. Names of third-party music
services mentioned in this repository or in plugins are trademarks of their
respective owners and are used only to describe compatibility.
