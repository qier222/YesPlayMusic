<br />
<p align="center">
  <a href="https://music.bluepill.one" target="blank">
    <img src="images/logo.png" alt="Logo" width="156" height="156">
  </a>
  <h2 align="center" style="font-weight: 600">YesPlayMusic</h2>

  <p align="center">
    高颜值的第三方网易云播放器
    <br />
    <a href="https://music.bluepill.one" target="blank"><strong>⏩️ 访问 DEMO ⏪</strong></a>
    <br />
    <br />
  </p>
</p>

[![Library][library-screenshot]](https://music.bluepill.one)

## ✨ 特性

- ✅ 使用 Vue.js 全家桶开发
- ⭐ 简洁美观的 UI
- 🔴 网易云账号登录
- ⏭️ 支持 MediaSession API，可以使用系统快捷键操作上一首下一首
- 😾 不能播放的歌曲会显示为灰色
- 🖥️ 支持 PWA，可在 Chrome/Edge 里点击地址栏右边的 ➕ 安装到电脑
- 🙉 支持显示歌曲和专辑的 Explicit 标志
- 📺 MV 播放
- 🚫🤝 无任何社交功能
- 🛠 更多特性开发中

## ⚙️ 部署

1. 部署网易云 API，详情参见 [Binaryify/NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)
2. 克隆本仓库

```sh
git clone https://github.com/qier222/YesPlayMusic.git
```

3. 安装依赖

```sh
npm install
```

4. 替换 `/src/config/request.js` 里面 `baseURL` 的值为网易云 API 地址

```JS
baseURL: "http://example.com",
```

5. 编译打包

```sh
npm run build
```

6. 将 `/dist` 目录下的文件上传到你的 Web 服务器

## ☑️ Todo

- 中文支持
- Dark Mode
- 私人 FM
- 播放记录
- 无限播放模式（播放完列表后自动播放相似歌曲）

欢迎提 issue 和 pull request。

## 📜 开源许可

基于 [MIT license](https://opensource.org/licenses/MIT) 许可进行开源。

## 🖼️ 截图

[![artist][artist-screenshot]](https://music.bluepill.one)
[![album][album-screenshot]](https://music.bluepill.one)
[![playlist][playlist-screenshot]](https://music.bluepill.one)
[![explore][explore-screenshot]](https://music.bluepill.one)
[![search][search-screenshot]](https://music.bluepill.one)
[![home][home-screenshot]](https://music.bluepill.one)

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[album-screenshot]: images/album.png
[artist-screenshot]: images/artist.png
[explore-screenshot]: images/explore.png
[home-screenshot]: images/home.png
[library-screenshot]: images/library.png
[playlist-screenshot]: images/playlist.png
[search-screenshot]: images/search.png
