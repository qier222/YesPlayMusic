import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fetchLatestRelease, links, repo } from '../src/lib/site.ts';

test('plugin guide links match the landing page language', () => {
  assert.equal(links.plugins.en, `${repo}/blob/main/docs/plugins.md`);
  assert.equal(links.plugins.zh, `${repo}/blob/main/docs/plugins.zh-CN.md`);
});

function asset(version, suffix) {
  const name = `YesPlayMusic-${version}-${suffix}`;
  return { name, browser_download_url: `${repo}/releases/download/v${version}/${name}` };
}

test('the latest release provides its version and the packages for each architecture', async () => {
  const mac = asset('3.2.1', 'macos.dmg');
  const macIntel = asset('3.2.1', 'macos-x64.dmg');
  const winSetup = asset('3.2.1', 'windows-x64-setup.exe');
  const winPortable = asset('3.2.1', 'windows-x64-portable.zip');
  const linuxX64 = asset('3.2.1', 'linux-x64.tar.gz');
  const linuxArm64 = asset('3.2.1', 'linux-arm64.tar.gz');
  const release = await fetchLatestRelease(async url => {
    assert.equal(url, 'https://api.github.com/repos/qier222/YesPlayMusic/releases/latest');
    return Response.json({ tag_name: 'v3.2.1', assets: [mac, macIntel, winSetup, winPortable, linuxX64, linuxArm64] });
  });
  assert.deepEqual(release, {
    version: '3.2.1',
    downloads: {
      mac: mac.browser_download_url,
      macIntel: macIntel.browser_download_url,
      winSetup: winSetup.browser_download_url,
      winPortable: winPortable.browser_download_url,
      linuxX64: linuxX64.browser_download_url,
      linuxArm64: linuxArm64.browser_download_url,
    },
  });
});

test('unpublished installers and untrusted URLs are omitted', async () => {
  const mac = asset('3.0.0', 'macos.dmg');
  const winSetup = asset('3.0.0', 'windows-x64-setup.exe');
  winSetup.browser_download_url = 'https://example.com/installer.exe';
  const release = await fetchLatestRelease(async () => Response.json({ assets: [mac, winSetup] }));
  assert.deepEqual(release?.downloads, { mac: mac.browser_download_url });
});

test('a rate-limited or failed request allows fallback to the latest release page', async () => {
  assert.equal(await fetchLatestRelease(async () => new Response(null, { status: 403 })), null);
  assert.equal(await fetchLatestRelease(async () => { throw new Error('offline'); }), null);
  assert.equal(links.latestRelease, `${repo}/releases/latest`);
});
