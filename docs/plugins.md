# 插件开发指南

YesPlayMusic 本身不带任何在线音乐服务。除了本地音乐，所有音乐源都由插件提供：一个插件就是一个文件夹，里面有一份 `plugin.json` 和一个 JavaScript 模块。应用在内置的 QuickJS 引擎里运行插件，插件导出哪些函数，应用就显示哪些功能。

插件协议沿用 MyGo Music 的字段名，已有的 MyGo 插件改动很少就能移植。

> 安全提示：插件可以访问它声明的网站、读写自己的数据目录，经用户允许后还能启动本机程序。只安装你信任的插件。详见 [SECURITY.md](../SECURITY.md)。

## 目录

- [快速开始](#快速开始)
- [插件放在哪里](#插件放在哪里)
- [安装插件](#安装插件)
  - [更新插件](#更新插件)
- [plugin.json](#pluginjson)
- [运行环境](#运行环境)
- [host API](#host-api)
- [导出的函数](#导出的函数)
- [数据结构](#数据结构)
- [错误](#错误)
- [限制](#限制)
- [调试](#调试)

## 快速开始

新建一个文件夹 `hello`，放两个文件：

`plugin.json`

```json
{
  "id": "yourname.hello",
  "name": "Hello",
  "version": "0.1.0",
  "minAppVersion": "3.0.0",
  "main": "index.js",
  "permissions": { "network": ["example.com"] }
}
```

`index.js`

```js
const tracks = [
  {
    id: "1",
    name: "Hello World",
    artists: [{ id: "a1", name: "Example Artist" }],
    album: { id: "al1", name: "Example Album", imageUrl: "https://example.com/cover.jpg" },
    duration: 180000,
  },
];

export async function search({ query }) {
  return { tracks: tracks.filter((t) => t.name.toLowerCase().includes(query.toLowerCase())) };
}

export async function stream({ id }) {
  return { url: `https://example.com/audio/${id}.mp3`, type: "mp3" };
}
```

把文件夹放进插件目录（见下一节；设置 → 插件 →「打开插件目录」可以直接打开它），点「重新加载」，再在设置 → 插件 →「音乐来源」里选中它（或者点侧边栏左下角的头像切换），就能在搜索页搜到这首歌并播放。

## 插件放在哪里

| 系统 | 插件目录 | 插件数据 |
| --- | --- | --- |
| macOS | `~/Library/Application Support/YesPlayMusic/plugins/<id>/` | `~/Library/Application Support/YesPlayMusic/plugin-data/<id>/` |
| Windows | `%APPDATA%\YesPlayMusic\plugins\<id>\` | `%APPDATA%\YesPlayMusic\plugin-data\<id>\` |
| Linux | `$XDG_DATA_HOME/YesPlayMusic/plugins/<id>/`（默认 `~/.local/share/...`） | `$XDG_DATA_HOME/YesPlayMusic/plugin-data/<id>/` |

开发时可以把插件目录软链接过去。插件目录里以 `.` 开头的文件夹会被忽略。

## 安装插件

设置 → 插件 →「安装插件」，粘贴下面任意一种链接：

| 链接 | 装什么 |
| --- | --- |
| `github.com/作者/仓库`，或 `作者/仓库` | 最新 Release 里的 `.zip` 附件；没有附件就用 Release 的源码包；没有 Release 就用默认分支的代码 |
| `github.com/作者/仓库/releases/tag/v1.2.0` | 这个 Release |
| `github.com/作者/仓库/tree/分支/子目录` | 这个分支（或 tag、commit）下的这个目录 |
| `github.com/作者/仓库/blob/分支/.../plugin.json` | 这份 `plugin.json` 所在的目录 |
| 以 `.zip` 结尾的链接 | 下载解压，用里面最浅的那份 `plugin.json` |
| 以 `plugin.json` 结尾的链接 | 下载它和 `main` 指向的模块，以及模块里用相对路径 `import` 的文件 |

也可以点「从本地文件夹安装…」，选一个有 `plugin.json` 的文件夹，应用会把它复制进插件目录。

安装前应用会列出插件要的权限（`permissions`）和提供的能力。能力是从源码里的 `export` 语句读出来的，确认安装之前不会运行插件的任何代码。`minAppVersion` 比当前应用新时不能安装。已经装了同一个 id、来自同一个地方（同一个 GitHub 仓库，或者同一个链接）的插件时，按钮变成「更新」，旧版本会被替换，设置和登录状态保留。id 相同但来源不同（或者已装的那个来源不明，比如手动放进目录的）时，安装弹窗会给出警告，按钮变成「替换」：替换会清除旧插件的设置、登录状态和已授予的权限，当成全新安装。

### 更新插件

从 GitHub 仓库或 Release 链接装的插件，以及在 `plugin.json` 里写了 GitHub 仓库地址（`repository`）的插件，都可以检查更新：应用会拿仓库最新 Release 的 tag（去掉开头的 `v`）和已装插件 `plugin.json` 里的 `version` 比较，新的就算有更新。如果插件是通过链接安装的，优先使用安装时记下来的来源；没有记录来源（如本地文件夹安装或手动放进插件目录）时，才使用 `repository`。指定了分支（`/tree/...`、`/blob/...`）、`.zip`、`plugin.json` 链接或未声明 `repository` 的本地插件不支持检查更新，要更新就重新安装一次。

- 每次启动后第一次打开设置里的插件页时，会把所有能检查的插件查一遍。有更新的插件卡片上显示「更新」，点了会打开安装弹窗，确认后替换，设置和登录状态保留。
- 插件卡片的 ⋯ 菜单里有「检查更新」，立即查这一个插件。
- 插件设置弹窗的「更新」一栏可以打开「自动更新」（默认关闭）。打开后应用启动约 10 秒后查一次，之后每 6 小时查一次，有新版本就在后台下载安装。这几种情况不会自动装，仍然只在卡片上显示「更新」，等你手动确认：新版本要了旧版本没有的网络、程序或本机应用权限、要求更新的应用版本（`minAppVersion`）、插件 id 变了，或者正在播放这个插件的歌。

发布新版本时，先改 `plugin.json` 的 `version`，再发一个 tag 和它一致的 GitHub Release（`v1.2.0` 或 `1.2.0` 都行）。

插件卡片的 ⋯ 菜单里可以停用插件：停用的插件不运行，设置和数据都还在，卡片上点「启用」就能恢复。提供音乐库或搜索的插件才会出现在「音乐来源」里。卸载会删除插件目录和它的插件数据。

插件数据目录里有：

- `storage.json`：`host.storage` 存的东西。
- `settings.json`：用户在插件设置弹窗里填的设置。
- `files/`：`host.files` 写的文件。

## plugin.json

```json
{
  "id": "example.example",
  "name": "Example",
  "version": "1.0.0",
  "description": "一个示例插件。",
  "author": "Example",
  "icon": "icon.png",
  "minAppVersion": "3.0.0",
  "main": "index.js",
  "playback": "stream",
  "permissions": {
    "network": ["api.example.com", "*.example-cdn.net", "{setting:server}"],
    "process": ["yt-dlp"]
  },
  "settings": [
    { "key": "server", "label": "服务器地址", "help": "例如 http://127.0.0.1:4533" },
    { "key": "token", "label": "Token", "type": "password", "link": "https://example.com/token" },
    { "key": "hq", "label": "高音质", "type": "boolean" },
    {
      "key": "quality",
      "label": "音质",
      "type": "select",
      "options": [
        { "value": "", "label": "跟随播放器" },
        { "value": "lossless", "label": "无损" }
      ]
    }
  ],
  "navigation": [{ "builtin": "home" }, { "builtin": "liked" }, { "title": "排行榜", "page": "charts" }]
}
```

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id` | 是 | 小写字母、数字和 `. _ -`，最长 64 个字符。`local` 是保留的。用 `<作者>.<名字>` 的形式，比如 `alice.radio`，避免和别人的插件重复。发布以后不要改：设置、登录状态和已授予的权限都按 id 保存。 |
| `name` | 是 | 显示给用户的名字。 |
| `version` | | 插件自己的版本。检查更新时拿它和最新 Release 的 tag 比较，见[更新插件](#更新插件)。 |
| `description` | | 一两句介绍，显示在插件卡片和安装弹窗里。 |
| `author` | | 作者，字符串或 `{ "name": "..." }`。 |
| `repository` | | 可选的 GitHub 仓库地址（字符串或 `{ "url": "..." }`），如 `https://github.com/owner/repo`。未记录安装来源（本地安装或手动放入目录）时，用于检查更新和自动更新。 |
| `icon` | | 插件目录里的图标，`.png`、`.jpg` 或 `.webp`（不支持 SVG），建议 256×256 的正方形。显示在插件卡片和侧边栏头像上；不写就用名字首字母。 |
| `minAppVersion` | | 需要的最低应用版本，例如 `3.0.0`。应用版本更旧时插件不会加载，设置页会显示原因。 |
| `main` | | 入口模块，插件目录里的 `.js` 或 `.mjs` 文件，默认 `index.js`。 |
| `playback` | | `stream`（默认）：应用自己播放 `stream` 给的地址。`remote`：在别处播放，应用只做遥控（预留）。 |
| `permissions.network` | | `fetch` 能访问的主机，见下表。不写就不能联网。 |
| `permissions.process` | | `host.spawn` 能启动的程序，见 [host.spawn](#hostspawncommand-args)。`true` 等于 `["*"]`。 |
| `permissions.ipc` | | `host.ipc` 能连的本机通道名字，见 [host.ipc](#hostipcconnectname)。 |
| `settings` | | 插件卡片上点「设置」打开的弹窗里显示的设置项。值始终是字符串（`boolean` 是 `"true"` / `""`）。`type` 可以是 `text`（默认）、`password`、`boolean`、`select`。`help` 是说明，`link` 是一个「去获取」链接。 |
| `navigation` | | 侧边栏条目：`{ "builtin": "home" \| "liked" \| "savedAlbums" \| "stations" \| "shows" }`，或 `{ "title", "page", "icon" }` 打开插件的 `browse(page)`。 |

`permissions.network` 的写法：

| 写法 | 匹配 |
| --- | --- |
| `api.example.com` | 只匹配这个主机 |
| `*.example.com` | 只匹配子域名（不含 `example.com` 本身） |
| `{setting:server}` | 设置项 `server` 里填的地址的主机，适合自建服务器 |
| `*` | 任意主机（请尽量不要用） |

重定向到列表外的主机会失败。

## 运行环境

- 插件跑在 [QuickJS-ng](https://github.com/quickjs-ng/quickjs) 里，支持 ES2023 和 ES 模块。入口模块可以 `import` 插件目录里的其他文件，不能读插件目录以外的文件。
- 没有 Node.js、DOM，也没有 `std` / `os` 模块，插件不能直接读写文件或启动进程。
- 每个插件跑在自己的线程里，互不影响；一个插件卡死或崩溃不会拖垮应用。

可用的全局对象：

| 名字 | 说明 |
| --- | --- |
| `fetch`、`Headers`、`Response` | 和浏览器的基本一致。`Response` 支持 `text()`、`json()`、`bytes()`、`arrayBuffer()`，不支持 `clone()` 和流式读取。`headers.getSetCookie()` 可以拿到所有 `Set-Cookie`。请求会走系统代理。跳转到别的域名（协议、主机或端口不同）时，`Authorization`、`Cookie` 和 `Proxy-Authorization` 请求头不会带过去。 |
| `URL`、`URLSearchParams` | |
| `TextEncoder`、`TextDecoder` | 只支持 UTF-8。 |
| `AbortController`、`AbortSignal` | 包括 `AbortSignal.timeout(ms)`，可以传给 `fetch`。 |
| `setTimeout`、`setInterval`、`clearTimeout`、`clearInterval` | |
| `console.log/info/warn/error/debug` | 见 [调试](#调试)。 |
| `atob`、`btoa` | |
| `host` | 应用提供的能力，见下一节。 |

## host API

| 名字 | 说明 |
| --- | --- |
| `host.platform` | `darwin`、`windows`、`linux`。 |
| `host.arch` | `arm64`、`amd64` 等。 |
| `host.dir` | 插件目录的绝对路径。 |
| `host.dataDir` | 插件数据目录的绝对路径。 |
| `host.pid` | 应用的进程 id。 |
| `host.storage.get(key)` / `.set(key, value)` / `.remove(key)` | 同步的键值存储，值是任意 JSON。存在 `storage.json`（整个最多 8 MB），适合放登录状态、缓存。 |
| `host.files.write(name, data)` | 把 `data`（字符串按 UTF-8 存，或 `Uint8Array` / `ArrayBuffer`）写进插件数据目录下的 `files/<name>`，返回它的 `file://` 地址，可以直接当 `imageUrl` 或 `AudioStream.url` 用。`name` 是相对路径，可以带子目录（`covers/1.jpg`），不能有 `..`、`:`、空段或开头的 `/`。单个文件最大 32 MB。适合存封面和放不进 `storage` 的大块数据。3.1.0 起可用。 |
| `host.files.read(name)` / `.readText(name)` | 读 `files/<name>`，返回 `Uint8Array` / 字符串，没有这个文件返回 `null`。 |
| `host.files.url(name)` | 文件存在时返回它的 `file://` 地址，否则 `null`。 |
| `host.files.remove(name)` | 删掉这个文件，不存在也不报错。 |
| `host.setting(key)` | 读用户在设置页填的值（字符串，没填是 `""`）。用户改设置后马上生效，不用重新加载。 |
| `host.language()` | 应用的界面语言，例如 `zh-CN`、`zh-TW`、`en`、`ja`。 |
| `host.t(text)` | 用插件目录里 `locales/<语言>.json` 翻译一句话（支持按前缀回退，例如 `zh-CN` → `zh`、`zh-TW` → `zh-Hant`、`en` → `en-US`），没有翻译时原样返回。同一份翻译表也会用于翻译 `plugin.json` 里的 `name`、`description`、`settings`（`label`、`help`、`options[].label`）和 `navigation[].title`。 |
| `host.openURL(url)` | 用系统浏览器打开一个 http(s) 地址。 |
| `host.crypto.md5(text)` | 返回十六进制字符串。 |
| `host.crypto.aesEcbEncrypt(key, text)` | AES-128-ECB + PKCS7，返回十六进制字符串。 |
| `host.signInPrompt({ qr, text })` | 在应用的登录弹窗里显示二维码（`qr` 是要编码的内容）和一句说明。在 `signIn` 里反复调用来更新状态（比如「已扫码，请在手机上确认」）。 |
| `host.webSignIn({ url, cookiesOf, until, userAgent })` | 在一个独立的小浏览器窗口里打开服务自己的登录页。等 `until` 里列的 Cookie 都出现后关窗，返回 `{ cookie }`（访问 `cookiesOf` 时会带的 `Cookie` 请求头）。`cookiesOf` 必须在 `permissions.network` 里。窗口用不落盘的独立存储。用户关掉窗口时抛错。目前只有 macOS 支持，其他系统会抛错，请准备二维码或手动填 Cookie 的方案。 |
| `host.spawn(command, args)` | 见下文。 |
| `host.ipc.connect(name)` | 见下文。 |

### host.spawn(command, args)

启动本机程序，比如用 `yt-dlp` 取播放地址。需要同时满足：

1. `command` 在 `permissions.process` 里。列表项可以是程序名（在 PATH 和 Homebrew 等常见目录里找）、路径（含 `/`，相对插件目录或绝对路径），可以用 `*` 在一层目录内通配。
2. 用户在 设置 → 插件 里这个插件的菜单中勾选了「允许运行本机程序」（默认不允许）。

返回一个进程对象：

| 成员 | 说明 |
| --- | --- |
| `pid` | 进程 id。 |
| `write(text)` / `closeStdin()` | 写标准输入。 |
| `readLine()` | 读一行标准输出，返回 Promise；读完返回 `null`。 |
| `wait()` | 等进程结束，返回 Promise，值是退出码。 |
| `errorOutput()` | 到目前为止的标准错误输出。 |
| `kill()` | 结束进程。 |

子进程继承系统代理（`HTTPS_PROXY` 等）。插件停止时，它启动的程序会一起结束。同时最多 16 个。

### host.ipc.connect(name)

连本机其他应用开的本地通道，比如 Discord 的 `discord-ipc-0`。macOS 和 Linux 上是 Unix 套接字，依次在 `$XDG_RUNTIME_DIR`、`$TMPDIR`、`$TMP`、`$TEMP`、`/tmp` 里找 `name`；Windows 上是命名管道 `\\.\pipe\name`。

`name` 必须在 `permissions.ipc` 里，列表项可以用 `*` 在一层目录内通配，例如 `"discord-ipc-*"`、`"snap.discord/discord-ipc-*"`（Windows 上没有子目录）。安装时会把列表显示给用户。

返回 Promise，值是一个连接对象：

| 成员 | 说明 |
| --- | --- |
| `write(bytes)` | 写入 `Uint8Array` / `ArrayBuffer`，返回 Promise。 |
| `read()` | 读下一段数据，返回 Promise，值是 `Uint8Array`；对方关闭时是 `null`。数据怎么分段由系统决定，请自己拼帧。 |
| `close()` | 关闭连接。 |

读写按调用顺序一个个完成（Windows 的管道上，读着的时候写不进去），所以请在需要回复时才 `read()`。每个插件同时最多 4 个连接，插件停止时会一起关闭。

## 导出的函数

插件用 ES 模块的 `export` 导出函数，函数名就是操作名。应用只调用插件导出了的函数，没导出的功能界面上不显示。每个函数收到一个参数对象（没有参数时是 `{}`），可以是 `async` 的，返回值必须能转成 JSON。

### 账号

| 函数 | 参数 | 返回 | 说明 |
| --- | --- | --- | --- |
| `account` | | `Account \| null` | 当前登录的账号，没登录返回 `null`。应用启动和加载插件时调用。 |
| `signIn` | | `Account \| null` | 登录。最长可以等 10 分钟（等用户扫码或在网页里操作）。 |
| `signOut` | | | 退出登录，清掉保存的登录状态。 |
| `testConnection` | `{ settings }` | `string` 或 `{ message }` | 插件设置弹窗里的「测试连接」。`settings` 是弹窗里还没保存的设置（键值都是字符串），请用它们而不是 `host.setting()`。成功返回一句显示给用户的话（可以为空，显示「连接成功」），失败抛错。调用期间 `{setting:key}` 权限也放行 `settings` 里的地址。3.1.0 起可用。 |
| `profile` | | `Profile` | 登录账号的个人主页（点侧边栏左下角头像打开）。 |

### 发现

| 函数 | 参数 | 返回 | 说明 |
| --- | --- | --- | --- |
| `home` | | `Browse` | 首页。不提供时侧边栏不显示「首页」。 |
| `browse` | `{ page }` | `Browse` | 发现页（`page` 为空）和插件自己的其他页面（`page` 是你在 `Link`、`Choice`、`navigation` 里给的字符串）。不提供时侧边栏不显示「发现」。 |
| `search` | `{ query, kind, offset }` | `SearchResult` | `kind` 是 `tracks`、`albums`、`artists`、`playlists`、`shows`。`offset` 是已经拿到的条数，用于翻页；还有下一页时返回 `more: true`。 |
| `suggest` | `{ query }` | `string[]` | 搜索联想。 |
| `hotSearches` | | `(string \| { word, hint })[]` | 搜索框空着时显示的热门搜索。 |

### 音乐库

| 函数 | 参数 | 返回 | 说明 |
| --- | --- | --- | --- |
| `library` | `{ kind, offset }` | `SearchResult` | 整个曲库（自建服务器这类「曲库就是用户的」源）。`kind` 是 `tracks`、`albums`、`artists`、`playlists`，分页同 `search`。有它时音乐库页用它，否则用 `liked`、`savedAlbums`、`playlists`。 |
| `liked` | `{ offset }` | `TrackPage` | 喜欢的歌。 |
| `isLiked` | `{ ids }` | `{ [id]: boolean }` 或与 `ids` 一一对应的 `boolean[]` | |
| `like` | `{ id, on }` | | 喜欢 / 取消喜欢。 |
| `savedAlbums` | `{ offset }` | `Album[]` 或 `{ albums, more }` | 收藏的专辑。 |
| `saveAlbum` | `{ id, on }` | | |
| `followArtist` | `{ id, on }` | | |
| `recent` | | `Track[]` | 最近播放。 |
| `played` | `{ id }` | | 自己的一首歌听够了（规则同 [听歌上报](#听歌上报)），可以用来记服务自己的播放记录。只有歌曲所属的源会收到。出错会被忽略。 |

### 专辑、歌手、歌单

| 函数 | 参数 | 返回 |
| --- | --- | --- |
| `album` | `{ id }` | `{ album: Album, tracks: Track[] }` |
| `artist` | `{ id }` | `{ artist: Artist, tracks: Track[], albums: Album[], related: Artist[] }` |
| `playlists` | | `Playlist[]`（自己创建的和收藏的） |
| `playlist` | `{ id }` | `Playlist`（带 `tracks`） |
| `savePlaylist` | `{ id, on }` | |
| `createPlaylist` | `{ name }` | `Playlist` |
| `renamePlaylist` | `{ id, name }` | |
| `deletePlaylist` | `{ id }` | |
| `addToPlaylist` | `{ id, trackIds }` | |
| `removeFromPlaylist` | `{ id, trackIds }` | |
| `movePlaylistTrack` | `{ id, from, to }` | |

导出 `savePlaylist` 的插件，宿主会在其他用户歌单页的「更多」菜单里显示「收藏歌单 / 取消收藏歌单」；`Playlist.saved` 决定显示哪一个，收藏后 `saved` 应为 `true`。

### 播放

| 函数 | 参数 | 返回 | 说明 |
| --- | --- | --- | --- |
| `stream` | `{ id, quality }` | `AudioStream` | 播放地址。`quality` 是 `standard`、`high`、`lossless` 之一，按你有的返回最接近的。最长等 60 秒。 |
| `lyrics` | `{ id }` | `Lyrics` | |
| `similar` | `{ id }` | `Track[]` | 正在播放页的「相似歌曲」。 |
| `station` | `{ id, seed }` | `TrackPage` | 电台的下一批歌。`id` 来自 `Mode.station` 或 `menuAction`；`seed` 是接着哪首歌放，可以为空。 |
| `dislike` | `{ id, station }` | | 不喜欢这首歌（以后少推荐）。 |

### 评论

| 函数 | 参数 | 返回 |
| --- | --- | --- |
| `comments` | `{ id, sort, offset }` | `CommentPage`。`sort` 是 `hot` 或 `new`。 |
| `postComment` | `{ id, text, replyTo }` | 发出去的 `Comment`，拿不到就返回 `null`。 |
| `likeComment` | `{ id, commentId, on }` | |

### 歌曲右键菜单

| 函数 | 参数 | 返回 | 说明 |
| --- | --- | --- | --- |
| `trackMenu` | `{ track, playlist }` | `MenuEntry[]` 或 `{ items: MenuEntry[], hide: string[] }` | 给这首歌的右键菜单加条目、藏起自带条目。菜单打开时会等它（最多 2 秒），请只看歌曲数据决定，不要联网。`hide` 可以是 `play`、`next`、`queue`、`like`、`addToPlaylist`、`album`、`artist`、`similar`、`dislike`、`remove`。 |
| `menuAction` | `{ id, track, playlist }` | `MenuResult` | 用户点了你加的条目。 |

### 听歌上报

| 函数 | 参数 | 返回 | 说明 |
| --- | --- | --- | --- |
| `nowPlaying` | `{ track }` | | 一首歌开始播放。 |
| `scrobble` | `{ track, startedAt, played }` | | 一首歌听够了，应该记进听歌记录。`startedAt` 是开始播放的时刻（UTC 的 ISO 8601），`played` 是实际听了多久（毫秒）。 |
| `playback` | `{ track, playing, position }` | | 播放状态变了：换歌、播放 / 暂停、拖进度、停止。`track` 为 `null` 表示什么都没在放，`position` 是此刻的进度（毫秒）。连续的变化只发最后一次。适合用来显示 Discord 这类「正在听」状态。 |

和其他函数不同，这三个函数**不管歌来自哪个源都会调用**：本地音乐、其他插件的歌都算，只要插件启用着、导出了它们就会收到。所以只做听歌上报、不提供任何音乐的插件也可以，它不会出现在「音乐来源」里。`track.source` 是歌曲所属的源（`local` 是本地音乐）。

什么时候算「听够了」沿用 Last.fm 的规则：短于 30 秒的歌不上报；实际听了一半或 4 分钟（先到哪个算哪个）就上报，拖进度条跳过的部分不算。一首歌每放一遍最多上报一次。

调用失败会被忽略，用户看不到。网络不好时要不要缓存起来稍后补报，由插件自己用 `host.storage` 实现。

下面是一个对接 [ListenBrainz](https://listenbrainz.org) 的最小插件（官方的 [ListenBrainz 插件](https://github.com/qier222/ypm-plugin-listenbrainz) 在此基础上加了自建服务和断网补报），用户在设置里填上 [User token](https://listenbrainz.org/settings/) 就能用：

`plugin.json`

```json
{
  "id": "listenbrainz",
  "name": "ListenBrainz",
  "version": "1.0.0",
  "permissions": { "network": ["api.listenbrainz.org"] },
  "settings": [
    { "key": "token", "label": "User token", "type": "password", "link": "https://listenbrainz.org/settings/" }
  ]
}
```

`index.js`

```js
async function submit(type, track, listenedAt) {
  const token = host.setting("token");
  if (!token) return;
  const listen = {
    track_metadata: {
      artist_name: (track.artists ?? []).map((a) => a.name).join(", "),
      track_name: track.name,
      release_name: track.album?.name || undefined,
      additional_info: {
        duration_ms: track.duration || undefined,
        submission_client: "YesPlayMusic",
      },
    },
  };
  if (listenedAt) listen.listened_at = listenedAt;
  const r = await fetch("https://api.listenbrainz.org/1/submit-listens", {
    method: "POST",
    headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ listen_type: type, payload: [listen] }),
  });
  if (!r.ok) throw new Error(`ListenBrainz ${r.status}: ${await r.text()}`);
}

export const nowPlaying = ({ track }) => submit("playing_now", track);
export const scrobble = ({ track, startedAt }) =>
  submit("single", track, Math.floor(Date.parse(startedAt) / 1000));
```

对接 Last.fm 时：从 2026 年 12 月 1 日起，Last.fm 的 API key 要求持有者订阅 Last.fm Pro，费用由**插件作者**（key 的持有者）承担，用户不需要 Pro。签名用的 `api_sig` 可以用 `host.crypto.md5` 算。官方的 [Last.fm 插件](https://github.com/qier222/ypm-plugin-lastfm) 让用户填自己的 API key，可以参考。

## 数据结构

所有字段都可以不填，应用会用空值。时间长度一律是毫秒，日期用 ISO 8601 字符串。id 只需要在你的插件里唯一。

```ts
type Artist = { id: string; name: string; imageUrl?: string; following?: boolean };

type Album = {
  id: string; name: string; imageUrl?: string; artists?: Artist[];
  released?: string;          // "2024-03-01" 或 "2024"
  kind?: "album" | "single" | "ep" | "compilation";
  trackCount?: number; saved?: boolean;
  added?: string;             // 加进音乐库的时间
  copyright?: string;         // 版权行，原样显示在专辑页底部，例如 "℗ 2024 XX Records"
};

type Track = {
  id: string; name: string; artists?: Artist[]; album?: Album;
  duration?: number;          // 毫秒
  url?: string;               // 歌曲在服务上的网页，用于分享
  unavailable?: boolean;      // 放不了（版权、VIP…）：显示成灰色、不能双击播放
  added?: string;
};

type Playlist = {
  id: string; name: string; imageUrl?: string; description?: string;
  owner?: string; subtitle?: string; trackCount?: number; plays?: number;
  mine?: boolean;             // 自己创建的
  saved?: boolean;            // 收藏的别人的
  fixed?: boolean;            // 自己的但不能改（比如「我喜欢的音乐」）
  tracks?: Track[];
};

type Account = { id: string; name: string; imageUrl?: string };

type SearchResult = {
  tracks?: Track[]; albums?: Album[]; artists?: Artist[]; playlists?: Playlist[];
  more?: boolean; total?: number;
};

type TrackPage = { tracks: Track[]; more?: boolean };

type AudioStream = {
  url: string;                // http(s)://，或插件目录 / 数据目录里的 file://
  type?: string;              // mp3、flac、m4a…
  quality?: string; bitRate?: number; size?: number;
  headers?: Record<string, string>;  // 播放器请求音频时带的请求头
  // ReplayGain，给「音量均衡」用。增益是 dB，峰值是线性值（1 = 0 dBFS）。
  // 文件自己带 ReplayGain 标签时以标签为准；服务器转码会丢标签，这时用这几个。
  // 没有就不填，应用不做调整。比如 OpenSubsonic 歌曲信息里的 replayGain。
  gain?: number; peak?: number;           // 单曲
  albumGain?: number; albumPeak?: number; // 专辑
};

type Lyrics = {
  lrc?: string;               // LRC 文本
  translation?: string;       // 翻译的 LRC 文本
  lines?: { start: number; end?: number; text?: string; translation?: string;
            words?: { start: number; end: number; text: string }[] }[];  // 有 lines 时优先用它，可以逐字
};

type Browse = {
  title?: string; subtitle?: string; imageUrl?: string; description?: string;
  sections: Section[];
  tabs?: Choice[];            // 顶部一排 tab，点了用它的 page 调 browse
  filters?: Choice[][];       // tab 下面的标签行
};

type Choice = { title: string; page?: string; selected?: boolean;
                groups?: { title: string; options: Choice[] }[]; images?: string[] };

type Section = {
  title?: string; subtitle?: string;
  style?: "modes" | "shelf" | "songs" | "charts" | "grid";
  tracks?: Track[]; albums?: Album[]; artists?: Artist[]; playlists?: Playlist[];
  modes?: Mode[];
  links?: { title: string; page: string; subtitle?: string; imageUrl?: string }[];
  morePage?: string;          // 「查看全部」打开的 browse 页
  empty?: string;             // 没有内容时的提示
};

type Mode = {                 // 首页顶部的特殊模式卡片（每日推荐、私人电台…）
  title: string; subtitle?: string; note?: string; imageUrl?: string;
  tracks?: Track[];           // 一组歌
  playlist?: string;          // 或者一个歌单 id
  station?: string;           // 或者一个电台 id，交给 station() 一批批取歌
};

type Profile = {
  name: string; imageUrl?: string; signature?: string;
  badges?: string[];                          // 名字旁边的小标签，例如 "Lv.9"
  facts?: { label: string; value: string }[]; // 例如 { label: "关注", value: "32" }
  stats?: { label: string; value: number; unit?: string;
            link?: "songs" | "albums" | "playlists" | "artists" }[];  // 统计卡片，最多三张
  topArtists?: { artist: Artist; plays: number }[];
  topTracks?: { title?: string; tracks: (Track & { plays?: number })[] };
  playlists?: Playlist[];                     // 自己创建的歌单
};

type Comment = { id: string; text: string; user?: { id?: string; name?: string; imageUrl?: string };
                 time?: number; likes?: number; liked?: boolean;
                 replyTo?: { id?: string; user?: { name: string }; text: string } };
type CommentPage = { comments: Comment[]; total?: number; more?: boolean };

type MenuEntry = { id: string; title: string; icon?: string; danger?: boolean };
type MenuResult = {
  toast?: string;                             // 提示一句话
  copy?: string;                              // 复制到剪贴板
  open?: { kind: "album" | "artist" | "playlist"; id: string };
  tracks?: Track[]; name?: string;            // 播放这些歌
  station?: { id: string; seed?: string };    // 放这个电台
};
```

`Section.style` 决定首页怎么排：

| style | 显示 |
| --- | --- |
| `modes` | 特殊模式卡片，前两个是大卡片，其余是小行 |
| `shelf` | 卡片（歌单、专辑、歌曲；歌手是圆头像），多了排两行、横向滚动 |
| `songs` | 歌曲翻页网格（3 列 × 4 行） |
| `charts` | 排行榜卡片，歌单的 `tracks` 是前几名 |
| `grid` | 卡片铺满一行、往下排 |
| 空 | 普通列表和卡片 |

## 错误

抛出带 `code` 的对象或 `Error`，应用会按 `code` 处理，`message` 直接显示给用户：

```js
const e = new Error("请先登录");
e.code = "signIn";
throw e;
```

| code | 含义 | 应用的处理 |
| --- | --- | --- |
| `signIn` | 需要先登录 | 提示登录 |
| `setup` | 缺少必要的设置（服务器地址、Token…） | 提示去设置 |
| `unavailable` | 这首歌放不了 | 提示并跳过 |
| `unsupported` | 不支持这个操作 | 当作没有这个功能 |
| 其他 / 不写 | 其他失败 | 显示 `message`，可以重试 |

## 缓存

应用会缓存插件返回的数据，下次打开先显示旧数据、后台再取新的：首页 5 分钟、专辑 1 天、歌手 1 小时、歌单 10 分钟、歌词很久、搜索 5 分钟（不存盘）；喜欢的歌、自己的歌单、音乐库和个人主页每次打开都重取。换账号后缓存会分开。插件自己不需要做页面级的缓存。

## 限制

| 项 | 限制 |
| --- | --- |
| 一次调用 | 30 秒（`stream` 60 秒，`signIn` 10 分钟） |
| 加载入口模块 | 有超时，请不要在模块顶层做网络请求 |
| 内存 | 128 MB |
| 连接超时 | 15 秒；读响应 60 秒没有数据就断开 |
| 重定向 | 最多 10 次 |
| 响应体 | 32 MB |
| 同时存在的定时器 | 1000 个 |
| 同时运行的程序 | 16 个 |

插件陷入死循环时会被停止，设置页会显示原因。

## 调试

- `console.*` 的输出带着插件 id 打印在应用的标准输出里。从终端启动应用就能看到：
  - macOS：`/Applications/YesPlayMusic.app/Contents/MacOS/YesPlayMusic`
  - Windows：在 PowerShell 里运行 `YesPlayMusic.exe`
  - Linux：在终端运行 `yesplaymusic`
- 改了插件代码后，在 设置 → 插件 里点「重新加载」。
- 插件加载失败（`plugin.json` 写错、入口模块语法错误、`minAppVersion` 不满足等）的原因会显示在设置页的插件卡片上。
