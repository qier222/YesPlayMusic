#!/usr/bin/env bash
# 分别构建 Apple Silicon / Intel 应用，并保留各自的产物。
# 用法：scripts/build-macos.sh arm64|x64 [flutter build 的其他参数]
set -euo pipefail

case "${1:-}" in
  arm64) target_arch=arm64; excluded_arch=x86_64; package_arch=arm64 ;;
  x64|x86_64) target_arch=x86_64; excluded_arch=arm64; package_arch=x64 ;;
  *) echo "用法：$0 arm64|x64 [构建参数]" >&2; exit 2 ;;
esac
shift
cd "$(dirname "$0")/.."

# Flutter 会把这些设置同时传给查询配置和实际构建的 xcodebuild。
# 禁用仅 ARM 的全局选项，避免它覆盖此处指定的 Intel 架构。
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
output="build/macos/packages/$package_arch/YesPlayMusic.app"
mkdir -p "$(dirname "$output")"
rm -rf "$output"
ditto "$app" "$output"
echo "已生成 $package_arch 应用：$output"
