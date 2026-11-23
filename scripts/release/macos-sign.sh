#!/usr/bin/env bash
# 用 Developer ID 给 YesPlayMusic.app 签名（开启 Hardened Runtime），由里到外：
# 先签 Sparkle 的各个组件和其他 framework，最后签整个 app。
#
# 用法：scripts/release/macos-sign.sh <YesPlayMusic.app> "<Developer ID Application: 名字 (TEAMID)>"
set -euo pipefail

APP="$1"
IDENTITY="$2"
ENTITLEMENTS="$(dirname "$0")/../../macos/Runner/Release.entitlements"

sign() { codesign --force --timestamp --options runtime --sign "$IDENTITY" "$@"; }

SPARKLE="$APP/Contents/Frameworks/Sparkle.framework"
if [ -d "$SPARKLE" ]; then
  # 按 Sparkle 文档的顺序：https://sparkle-project.org/documentation/sandboxing/#code-signing
  sign "$SPARKLE/Versions/B/XPCServices/Installer.xpc"
  sign --preserve-metadata=entitlements "$SPARKLE/Versions/B/XPCServices/Downloader.xpc"
  sign "$SPARKLE/Versions/B/Autoupdate"
  sign "$SPARKLE/Versions/B/Updater.app"
  sign "$SPARKLE"
fi

# 其他 framework 和散落的 dylib
find "$APP/Contents/Frameworks" -maxdepth 1 \( -name '*.framework' -o -name '*.dylib' \) \
  ! -name 'Sparkle.framework' -print0 | while IFS= read -r -d '' f; do
  sign "$f"
done

sign --entitlements "$ENTITLEMENTS" "$APP"

codesign --verify --deep --strict --verbose=2 "$APP"
