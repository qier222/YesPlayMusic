<br />
<p align="center">
  <a href="https://music.qier222.com" target="blank">
    <img src="images/logo.png" alt="Logo" width="156" height="156">
  </a>
  <h2 align="center" style="font-weight: 600">YesPlayMusic</h2>

  <p align="center">
    高颜值的第三方网易云播放器
    <br />
    <a href="https://music.qier222.com" target="blank"><strong>🌎 访问DEMO</strong></a>&nbsp;&nbsp;|&nbsp;&nbsp;
    <a href="#%EF%B8%8F-安装" target="blank"><strong>📦️ 下载安装包</strong></a>
    <br />
    <br />
  </p>
</p>

[![Library][library-screenshot]](https://music.qier222.com)

## ✨ 特性

- ✅ 使用 Vue.js 全家桶开发
- 🔴 网易云账号登录
- 📺 支持 MV 播放
- 📃 支持歌词显示
- 📻 支持私人 FM
- 🚫🤝 无任何社交功能
- 🌎️ 海外用户可直接播放（需要登录网易云账号）
- 🔐 支持 [UnblockNeteaseMusic](https://github.com/nondanee/UnblockNeteaseMusic)，自动使用 QQ/酷狗/酷我音源替换变灰歌曲链接 （网页版不支持）
- ⏭️ 支持 MediaSession API，可以使用系统快捷键操作上一首下一首
- ✔️ 每日自动签到（手机端和电脑端同时签到）
- 🌚 Light/Dark Mode 自动切换
- 👆 支持 Touch Bar
- 🖥️ 支持 PWA，可在 Chrome/Edge 里点击地址栏右边的 ➕ 安装到电脑
- 🙉 支持显示歌曲和专辑的 Explicit 标志
- 🟥 支持 Last.fm Scrobble
- 🛠 更多特性开发中

## 📦️ 安装

Electron 版本由 [@hawtim](https://github.com/hawtim) 和 [@qier222](https://github.com/qier222) 适配并维护，支持 macOS、Windows、Linux。

访问本项目的 [Releases](https://github.com/qier222/YesPlayMusic/releases)
页面下载安装包，或者访问 [镜像下载站 (大陆访问更快)](https://dl.qier222.com/YesPlayMusic/) 下载。

macOS 用户也可以通过 `brew install --cask yesplaymusic` 来安装。

## ⚙️ 部署至 Vercel

除了下载安装包使用，你还可以将本项目部署到 Vercel 或你的服务器上。下面是部署到 Vercel 的方法

1. 部署网易云 API，详情参见 [Binaryify/NeteaseCloudMusicApi](https://neteasecloudmusicapi.vercel.app/#/?id=%e5%ae%89%e8%a3%85)
   。你也可以将 API 部署到 Vercel。

2. 点击本仓库右上角的 Fork，复制本仓库到你的 GitHub 账号。

3. 打开 [Vercel.com](https://vercel.com)，使用 GitHub 登录。

4. 点击 Import Git Repository 并选择你刚刚复制的仓库并点击 Import。

5. 点击 PERSONAL ACCOUNT 旁边的 Select。

6. 点击 Environment Variables，填写 Name 为 `VUE_APP_NETEASE_API_URL`，Value 为你刚刚部署的网易云 API 地址，点击 Add。最后点击底部的 Deploy 就可以部署到
   Vercel 了。

## 👷‍♂️ 打包客户端

如果在 Release 页面没有找到适合你的设备的安装包的话，你可以根据下面的步骤来打包自己的客户端。

1. 打包 Electron 需要用到 Node.js 和 Yarn。可前往 [Node.js 官网](https://nodejs.org/zh-cn/) 下载安装包。安装 Node.js
   后可在终端里执行 `npm install -g yarn` 来安装 Yarn。

2. 使用 `git clone https://github.com/qier222/YesPlayMusic.git` 克隆本仓库到本地。

3. 使用 `yarn install` 安装项目依赖。

4. 复制 `/.env.example` 文件为 `/.env` 。

5. 选择下列表格的命令来打包适合的你的安装包，打包出来的文件在 `/dist_electron` 目录下。了解更多信息可访问 [electron-builder 文档](https://www.electron.build/cli)

| 命令                                       | 说明                      |
| ------------------------------------------ | ------------------------- |
| `yarn electron:build --windows nsis:ia32`  | Windows 32 位             |
| `yarn electron:build --windows nsis:arm64` | Windows ARM               |
| `yarn electron:build --linux deb:armv7l`   | Debian armv7l（树莓派等） |
| `yarn electron:build --macos dir:arm64`    | macOS ARM                 |

## :computer: 配置开发环境

本项目由 [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi) 提供 API，已经包含在本项目的`netease_api`目录。

运行本项目

```shell
# 安装依赖
yarn

# 创建本地环境变量
cp .env.example .env

# 运行（网页端）
yarn serve

# 运行（electron）
yarn electron:serve
```

本地运行 NeteaseCloudMusicApi，或者将 API [部署至 Vercel](#%EF%B8%8F-部署至-vercel)

```shell
# 安装依赖
yarn netease_api:install

# 运行 API （默认 3000 端口）
yarn netease_api:run
```

## ☑️ Todo

查看 Todo 请访问本项目的 [Projects](https://github.com/qier222/YesPlayMusic/projects/1)

欢迎提 Issue 和 Pull request。

## 📜 开源许可

本项目仅供个人学习研究使用，禁止用于商业及非法用途。

基于 [MIT license](https://opensource.org/licenses/MIT) 许可进行开源。

## 灵感来源

API 源代码来自 [Binaryify/NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)

- [Apple Music](https://music.apple.com)
- [YouTube Music](https://music.youtube.com)
- [Spotify](https://www.spotify.com)
- [网易云音乐](https://music.163.com)

## 🖼️ 截图

[![artist][artist-screenshot]](https://music.qier222.com)
[![album][album-screenshot]](https://music.qier222.com)
[![playlist][playlist-screenshot]](https://music.qier222.com)
[![explore][explore-screenshot]](https://music.qier222.com)
[![search][search-screenshot]](https://music.qier222.com)
[![home][home-screenshot]](https://music.qier222.com)

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[album-screenshot]: images/album.png
[artist-screenshot]: images/artist.png
[explore-screenshot]: images/explore.png
[home-screenshot]: images/home.png
[library-screenshot]: images/library.png
[playlist-screenshot]: images/playlist.png
[search-screenshot]: images/search.png
