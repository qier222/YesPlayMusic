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
- 📺 MV 播放
- 📃 支持歌词显示
- 🚫🤝 无任何社交功能
- 🌎️ 海外用户可直接播放（需要登录网易云账号）
- 🔐 支持 [UnblockNeteaseMusic](https://github.com/nondanee/UnblockNeteaseMusic)，自动使用 QQ/酷狗/酷我音源替换变灰歌曲链接 （网页版不支持）
- ⏭️ 支持 MediaSession API，可以使用系统快捷键操作上一首下一首
- ✔️ 每日自动签到（手机端和电脑端同时签到）
- 🌚 Light/Dark Mode 自动切换
- 👆 支持 Touch Bar
- 🖥️ 支持 PWA，可在 Chrome/Edge 里点击地址栏右边的 ➕ 安装到电脑
- 🙉 支持显示歌曲和专辑的 Explicit 标志
- 🛠 更多特性开发中

## 📦️ 安装

Electron 版本由 [@hawtim](https://github.com/hawtim) 和 [@qier222](https://github.com/qier222) 适配并维护，支持 macOS、Windows、Linux。

访问本项目的 [Releases](https://github.com/qier222/YesPlayMusic/releases) 页面下载安装包，或者访问 [镜像下载站 (大陆访问更快)](https://dl.qier222.com/YesPlayMusic/) 下载。

## ⚙️ 部署至服务器

除了下载安装包使用，你还可以将本项目部署到你的服务器上。

1. 部署网易云 API，详情参见 [Binaryify/NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)

2. 克隆本仓库

```sh
git clone https://github.com/qier222/YesPlayMusic.git
```

3. 安装依赖

```sh
yarn install
```

4. 复制 `/.env.example` 文件为 `/.env`，修改里面 `VUE_APP_NETEASE_API_URL` 的值为网易云 API 地址。本地开发的话可以填写 API 地址为 `http://localhost:3000`，YesPlayMusic 地址为 `http://localhost:8080`

```
VUE_APP_NETEASE_API_URL=http://localhost:3000
```

5. 编译打包

```sh
yarn run build
```

6. 将 `/dist` 目录下的文件上传到你的 Web 服务器

## ☑️ Todo

查看 Todo 请访问本项目的 [Projects](https://github.com/qier222/YesPlayMusic/projects/1)

欢迎提 Issue 和 Pull request。

## 📜 开源许可

本项目仅供个人学习研究使用，禁止用于商业及非法用途。

基于 [MIT license](https://opensource.org/licenses/MIT) 许可进行开源。

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
