#!/usr/bin/env bash
# Store Apple Silicon and Intel builds separately.
# Usage: scripts/build-macos.sh arm64|x64 [flutter build arguments]
set -euo pipefail

case "${1:-}" in
  arm64) target_arch=arm64; excluded_arch=x86_64; package_arch=arm64 ;;
  x64|x86_64) target_arch=x86_64; excluded_arch=arm64; package_arch=x64 ;;
  *) echo "用法：$0 arm64|x64 [构建参数]" >&2; exit 2 ;;
esac
shift
cd "$(dirname "$0")/.."

# Disable Flutter's ARM-only setting so it cannot override an Intel build.
export FLUTTER_MACOS_ARM64_ONLY=false
export FLUTTER_XCODE_ARCHS="$target_arch"
export FLUTTER_XCODE_EXCLUDED_ARCHS="$excluded_arch"
export FLUTTER_XCODE_ONLY_ACTIVE_ARCH=NO
flutter build macos --release "$@"

app=build/macos/Build/Products/Release/YesPlayMusic.app
actual_arch=$(lipo -archs "$app/Contents/MacOS/YesPlayMusic")
if [ "$actual_arch" != "$target_arch" ]; then
  echo "架构不符：期望 $target_arch，实际为 $actual_arch" >&2
  exit 1
fi

find "$app/Contents/Frameworks" -type f -print0 | while IFS= read -r -d '' binary; do
  if [[ "$(file -b "$binary")" == *Mach-O* ]] && ! lipo "$binary" -verify_arch "$target_arch"; then
    echo "原生库缺少 $target_arch 架构：$binary" >&2
    exit 1
  fi
done

output="build/macos/packages/$package_arch/YesPlayMusic.app"
mkdir -p "$(dirname "$output")"
rm -rf "$output"
ditto "$app" "$output"
echo "已生成 $package_arch 应用：$output"
