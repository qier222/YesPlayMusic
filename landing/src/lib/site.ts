// Google Analytics 4 measurement ID for the landing page
export const gaMeasurementId = 'G-QNV2Z238M3';

const repository = 'qier222/YesPlayMusic';
export const repo = `https://github.com/${repository}`;

const suffixes = {
  mac: '-macos.dmg',
  macIntel: '-macos-x64.dmg',
  winSetup: '-windows-x64-setup.exe',
  winPortable: '-windows-x64-portable.zip',
  linuxX64: '-linux-x64.tar.gz',
  linuxArm64: '-linux-arm64.tar.gz',
};
export type DownloadPackage = keyof typeof suffixes;
export type LatestRelease = { version?: string; downloads: Partial<Record<DownloadPackage, string>> };

export async function fetchLatestRelease(request: typeof fetch = fetch): Promise<LatestRelease | null> {
  try {
    const response = await request(`https://api.github.com/repos/${repository}/releases/latest`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const { assets, tag_name } = await response.json();
    if (!Array.isArray(assets)) return null;

    const downloads: LatestRelease['downloads'] = {};
    for (const key of Object.keys(suffixes) as DownloadPackage[]) {
      const asset = assets.find(a =>
        typeof a?.name === 'string' && a.name.startsWith('YesPlayMusic-') &&
        a.name.endsWith(suffixes[key]) && typeof a.browser_download_url === 'string' &&
        a.browser_download_url.startsWith(`${repo}/releases/download/`),
      );
      if (asset) downloads[key] = asset.browser_download_url;
    }
    return { version: typeof tag_name === 'string' ? tag_name.replace(/^v/, '') : undefined, downloads };
  } catch {
    return null;
  }
}

export const links = {
  repo,
  latestRelease: `${repo}/releases/latest`,
  plugins: `${repo}/blob/main/docs/plugins.md`,
  pluginTopic: 'https://github.com/topics/yesplaymusic-plugin',
  changelog: `${repo}/blob/main/CHANGELOG.md`,
  issues: `${repo}/issues/new/choose`,
};
