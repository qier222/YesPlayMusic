// Site summary for AI agents (llmstxt.org). Generated at build time; version and download links follow lib/version.dart.
import type { APIRoute } from 'astro';
import { downloads, links, repo, version } from '../lib/site';
import { t } from '../i18n';

const raw = (path: string) => `${repo.replace('github.com', 'raw.githubusercontent.com')}/main/${path}`;

export const GET: APIRoute = ({ site }) => {
  const en = t('en');
  const zh = t('zh');
  const page = (p: string) => new URL(p, site).href;
  const body = `# YesPlayMusic

> ${en.description}

YesPlayMusic 3.0 is a free, open-source (GPL-3.0) desktop music player rewritten from scratch in Flutter. It has no built-in streaming service: it plays local files out of the box, and every online source (catalog, playlists, lyrics, comments) comes from sandboxed third-party plugins. A built-in MCP server lets AI agents search, play, and manage the queue and playlists.

中文简介：${zh.description}本身不内置在线音乐服务，在线曲库、歌单、歌词等都由插件提供；内置 MCP 服务，AI 助手可以搜索、播放、管理播放队列和歌单。

- Latest version: ${version}
- Platforms: macOS 12+ (Apple Silicon), Windows 10 / 11 (x64), Linux (x64, needs libmpv: \`sudo apt install libmpv2\`)
- Sources: local files; Jellyfin, Plex, Emby, Subsonic / Navidrome and more via plugins
- License: GPL-3.0

## Download

- [macOS (.dmg)](${downloads.mac})
- [Windows installer (.exe)](${downloads.winSetup}): not code-signed yet; on SmartScreen choose "More info" → "Run anyway"
- [Windows portable (.zip)](${downloads.winPortable})
- [Linux (.tar.gz)](${downloads.linux})
- [All releases](${repo}/releases)

## Docs

- [README (English)](${raw('README.md')}): features, install, plugins, MCP setup, building from source
- [README (简体中文)](${raw('README.zh-CN.md')})
- [Plugin guide](${raw('docs/plugins.md')}): plugin.json manifest, JavaScript module API, permissions and sandbox
- [Changelog](${raw('CHANGELOG.md')})

## Links

- [Website (English)](${page('/en/')})
- [网站（简体中文）](${page('/zh/')})
- [Source code](${repo})
- [Community plugins (GitHub topic yesplaymusic-plugin)](${links.pluginTopic})
- [Report an issue](${links.issues})
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
