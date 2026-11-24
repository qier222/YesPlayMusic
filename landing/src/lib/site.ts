// 版本号跟应用保持一致：从 lib/version.dart 读
import dart from '../../../lib/version.dart?raw';
export const version = dart.match(/appVersion\s*=\s*'([^']+)'/)?.[1] ?? '0.0.0';

// Google Analytics 4 measurement ID for the landing page
export const gaMeasurementId = 'G-QNV2Z238M3';

export const repo = 'https://github.com/qier222/YesPlayMusic';
const base = `${repo}/releases/download/v${version}/YesPlayMusic-${version}`;

export const downloads = {
  mac: `${base}-macos.dmg`,
  winSetup: `${base}-windows-x64-setup.exe`,
  winPortable: `${base}-windows-x64-portable.zip`,
  linuxX64: `${base}-linux-x64.tar.gz`,
  linuxArm64: `${base}-linux-arm64.tar.gz`,
};

export const links = {
  repo,
  plugins: `${repo}/blob/main/docs/plugins.md`,
  pluginTopic: 'https://github.com/topics/yesplaymusic-plugin',
  changelog: `${repo}/blob/main/CHANGELOG.md`,
  issues: `${repo}/issues/new/choose`,
};
