<!-- Thanks to https://zhconvert.org's Chinese (China) converter ! -->

<img src="https://user-images.githubusercontent.com/26399680/47980314-0e3f1700-e102-11e8-8857-e3436ecc8beb.png" alt="logo" width="140" height="140" align="right">

# UnblockNeteaseMusic

解锁网易云音乐客户端变灰歌曲

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FUnblockNeteaseMusic%2Fserver.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FUnblockNeteaseMusic%2Fserver?ref=badge_shield)

## 特性

- 支援多个音源，替换变灰歌曲链接
    - 支援的完整音源清单可以见下方〈音源清单〉处。
- 为请求增加 `X-Real-IP` 参数解锁海外限制，支持指定网易云服务器 IP，支持设置上游 HTTP / HTTPS 代理
- 完整的流量代理功能 (HTTP / HTTPS)，可直接作为系统代理 (同时支持 PAC)

## 运行

### 直接打开可运行文件

去右侧的 Releases 找到最新版本，然后在下方的 Assets 找到符合你系统架构的可运行文件。下载回来后点两下即可使用。

> macOS 因为签名问题，暂时不提供可运行文件。请先按照其他做法使用。

### NPM 安装

#### 安装成依赖

```bash
npm install @unblockneteasemusic/server
yarn add @unblockneteasemusic/server # for Yarn users
```

#### 用 NPX 运行

```bash
npx -p @unblockneteasemusic/server unblockneteasemusic
```

### 注册成 Windows 服务

#### 安装服务

直接 `clone` 或下载本项目，在项目根目录运行 `node ./nw.js`。会有弹窗，直接确定即可。如果有安全管家等软件可能会阻止，直接允许即可。运行成功后可在电脑服务中看到该服务。

#### 配置

http 代理使用 `127.0.0.1`，端口默认使用 `8080`。

如果想要添加启动参数和环境变量，请在项目根目录中的 `nw.js` 中配置 `scriptOptions` 和 `env`。

> 如果想要卸载已安装的服务，请再次运行 `node ./nw.js`。
>
> 安装服务后，会在项目根目录生成 `daemon` 文件夹。可在这里查看日志。

### Docker 作法

#### Docker Hub

见 [pan93412/unblock-netease-music-enhanced](https://hub.docker.com/r/pan93412/unblock-netease-music-enhanced)
。`latest` 是从 `enhanced` 组建的最新版本；`release` 是最新 tag 的版本。

直接运行 `pan93412/unblock-netease-music-enhanced` 的命令如下：

```bash
docker run pan93412/unblock-netease-music-enhanced
```

若要更新 UnblockNeteaseMusic，请运行以下命令后重新 `run`：

```
docker pull pan93412/unblock-netease-music-enhanced
```

若要指定环境变量，您可以往 `docker run` 传入 `-e`，就像这样：

```bash
docker run -e JSON_LOG=true -e LOG_LEVEL=debug pan93412/unblock-netease-music-enhanced
```

若要传入配置参数，只要在 `docker run` 的 image 之后传入参数即可：

```bash
docker run pan93412/unblock-netease-music-enhanced -o kuwo -p 1234
```

#### 自行编译

```bash
git clone https://github.com/UnblockNeteaseMusic/server.git UnblockNeteaseMusic
cd UnblockNeteaseMusic
docker-compose up
```

### 直接使用 Repo 最新版本

```bash
git clone https://github.com/UnblockNeteaseMusic/server.git UnblockNeteaseMusic
cd UnblockNeteaseMusic
node app.js # 建议使用 screen / tmux 把 app.js 挂后台
```

更新：

```
git pull
```

#### 编译最新的 package

```bash
yarn
yarn build
node app.js # 即可使用 repo 的最新开发内容
```

#### 采用（而不编译）最新的 package

```bash
yarn
DEVELOPMENT=true yarn node app.js
```

### BetterNCM 一键安装器

请移步至 [RevivedUnblockInstaller](https://github.com/ReviveUnblockNCMInstaller/RevivedUnblockInstaller)。

### Android Xposed 模块

请移步至 [杜比大喇叭 β 版](https://github.com/nining377/dolby_beta)。

### OpenWrt LuCI 插件

请移步至 [luci-app-unblockneteasemusic](https://github.com/UnblockNeteaseMusic/luci-app-unblockneteasemusic)。

### 配置参数

```bash
$ unblockneteasemusic -h
usage: unblockneteasemusic [-v] [-p http[:https]] [-a address] [-u url] [-f host]
                           [-o source [source ...]] [-t token] [-e url] [-s]
                           [-h]

optional arguments:
  -v, --version                   output the version number
  -p port, --port http[:https]    specify server port
  -a address, --address address   specify server host
  -u url, --proxy-url url         request through upstream proxy
  -f host, --force-host host      force the netease server ip
  -o source [source ...], --match-order source [source ...]
                                  set priority of sources
  -t token, --token token         set up proxy authentication
  -e url, --endpoint url          replace virtual endpoint with public host
  -s, --strict                    enable proxy limitation
  -c, --cnrelay host:port         Mainland China relay to get music url
  -h, --help                      output usage information
```

### 音源清单

将有兴趣的音源代号用 `-o` 传入 UNM 即可使用，像这样：

```bash
node app.js -o bilibili ytdlp
```

| 名称                        | 代号        | 默认启用 | 注意事项                                                                       |
| --------------------------- | ----------- | -------- | ------------------------------------------------------------------------------ |
| QQ 音乐                     | `qq`        |          | 需要准备自己的 `QQ_COOKIE`（请参阅下方〈环境变量〉处）。必须使用 QQ 登录。     |
| 酷狗音乐                    | `kugou`     | ✅       |                                                                                |
| 酷我音乐                    | `kuwo`      |          |                                                                                |
| 波点音乐                    | `bodian`    | ✅       |                                                                                |
| 咪咕音乐                    | `migu`      | ✅       | 需要准备自己的 `MIGU_COOKIE`（请参阅下方〈环境变量〉处）。                     |
| JOOX                        | `joox`      |          | 需要准备自己的 `JOOX_COOKIE`（请参阅下方〈环境变量〉处）。似乎有严格地区限制。 |
| YouTube（纯 JS 解析方式）   | `youtube`   |          | 需要 Google 认定的**非中国大陆区域** IP 地址。                                 |
| YouTube（通过 `youtube-dl`) | `youtubedl` |          | 需要自行安装 `youtube-dl`。                                                    |
| YouTube（通过 `yt-dlp`)     | `ytdlp`     | ✅       | 需要自行安装 `yt-dlp`（`youtube-dl` 仍在活跃维护的 fork）。                    |
| B 站音乐                    | `bilibili`  |          |                                                                                |
| B 站音乐                    | `bilivideo` |          | 在大陆地区外的IP地址可能查询不到某些版权视频（如索尼音乐上传的MV等）           |
| 第三方网易云 API            | `pyncmd`    |          |                                                                                |

- 支持 `pyncmd` 的 API 服务由 GD studio <https://music.gdstudio.xyz> 提供。

### 环境变量

| 变量名称              | 类型 | 描述                                                                                                    | 示例                                                             |
| --------------------- | ---- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| ENABLE_FLAC           | bool | 激活无损音质获取                                                                                        | `ENABLE_FLAC=true`                                               |
| ENABLE_LOCAL_VIP      | str  | 激活本地黑胶 VIP，可选值：`true`（等同于 CVIP）、`cvip` 和 `svip`                                       | `ENABLE_LOCAL_VIP=svip`                                          |
| LOCAL_VIP_UID         | str  | 仅对这些 UID 激活本地黑胶 VIP，默认为对全部用户生效                                                     | `LOCAL_VIP_UID=123456789,1234,123456`                            |
| ENABLE_HTTPDNS        | bool | 激活故障的 Netease HTTPDNS 查询（不建议）                                                               | `ENABLE_HTTPDNS=true`                                            |
| BLOCK_ADS             | bool | 屏蔽应用内部分广告                                                                                      | `BLOCK_ADS=true`                                                 |
| DISABLE_UPGRADE_CHECK | bool | 禁用更新检测                                                                                            | `DISABLE_UPGRADE_CHECK=true`                                     |
| DEVELOPMENT           | bool | 激活开发模式。需要自己用 `yarn` 安装依赖 (dependencies)                                                 | `DEVELOPMENT=true`                                               |
| FOLLOW_SOURCE_ORDER   | bool | 严格按照配置音源的顺序进行查询                                                                          | `FOLLOW_SOURCE_ORDER=true`                                       |
| JSON_LOG              | bool | 输出机器可读的 JSON 记录格式                                                                            | `JSON_LOG=true`                                                  |
| NO_CACHE              | bool | 停用 cache                                                                                              | `NO_CACHE=true`                                                  |
| MIN_BR                | int  | 允许的最低源音质，小于该值将被替换                                                                      | `MIN_BR=320000`                                                  |
| SELECT_MAX_BR         | bool | 选择所有音源中的最高码率替换音频                                                                        | `SELECT_MAX_BR=true`                                             |
| LOG_LEVEL             | str  | 日志输出等级。请见〈日志等级〉部分。                                                                    | `LOG_LEVEL=debug`                                                |
| LOG_FILE              | str  | 从 Pino 端设置日志输出的文件位置。也可以用 `*sh` 的输出重导向功能 (`node app.js >> app.log`) 代替       | `LOG_FILE=app.log`                                               |
| JOOX_COOKIE           | str  | JOOX 音源的 wmid 和 session_key cookie                                                                  | `JOOX_COOKIE="wmid=<your_wmid>; session_key=<your_session_key>"` |
| MIGU_COOKIE           | str  | 咪咕音源的 aversionid cookie                                                                            | `MIGU_COOKIE="<your_aversionid>"`                                |
| QQ_COOKIE             | str  | QQ 音源的 uin 和 qm_keyst cookie                                                                        | `QQ_COOKIE="uin=<your_uin>; qm_keyst=<your_qm_keyst>"`           |
| YOUTUBE_KEY           | str  | Youtube 音源的 Data API v3 Key                                                                          | `YOUTUBE_KEY="<your_data_api_key>"`                              |
| SIGN_CERT             | path | 自定义证书文件                                                                                          | `SIGN_CERT="./server.crt"`                                       |
| SIGN_KEY              | path | 自定义密钥文件                                                                                          | `SIGN_KEY="./server.key"`                                        |
| SEARCH_ALBUM          | bool | 在其他音源搜索歌曲时携带专辑名称（默认搜索条件 `歌曲名 - 歌手`，启用后搜索条件 `歌曲名 - 歌手 专辑名`） | `SEARCH_ALBUM=true`                                              |
| NETEASE_COOKIE        | str  | 网易云 Cookie                                                                                           | `MUSIC_U=007554xxx`                                              |

#### 日志等级 (`LOG_LEVEL`)

这些是常用的值：

- `debug`: 输出所有记录（调试用）
- `info`: 只输出一般资讯（默认值）
- `error`: 只在出严重问题时输出

详细请参见 [Pino 对此的说明](https://github.com/pinojs/pino/blob/master/docs/api.md#level-string)。

## 使用

**警告**：本项目不提供在线 demo，请不要轻易信任使用他人提供的公开代理服务，以免发生安全问题

**若将服务部署到公网，强烈建议使用严格模式 (此模式下仅放行网易云音乐所属域名的请求) `-s` 限制代理范围 (需使用 PAC 或 hosts)，~~或激活 Proxy Authentication `-t <name>:<password>` 设置代理用户名密码~~ (目前密码认证在 Windows 客户端设置和 macOS 系统设置都无法生效，请不要使用)，以防代理被他人滥用**

支持 Windows 客户端，UWP 客户端，Android 客户端，Linux 客户端 (1.2 版本以上需要自签证书 MITM，启动客户端需要增加 `--ignore-certificate-errors` 参数)，macOS 客户端 (726 版本以上需要自签证书)，iOS 客户端 (配置 https endpoint 或使用自签证书) 和网页版 (需要自签证书，需要脚本配合)

目前除 UWP 外其它客户端均优先请求 HTTPS 接口，~~默认配置下本代理对网易云所有 HTTPS API 连接返回空数据，促使客户端降级使用 HTTP 接口~~ (新版 Linux 客户端和 macOS 客户端已无法降级)

因 UWP 应用存在网络隔离，限制流量发送到本机，若使用的代理在 localhost，或修改的 hosts 指向 localhost，需为 "网易云音乐 UWP" 手工开启 loopback 才能使用，请以**管理员身份**运行命令

```powershell
checknetisolation loopbackexempt -a -n="1F8B0F94.122165AE053F_j2p0p5q0044a6"
```

### 方法 1. 修改 hosts

向 hosts 文件添加几条规则

```hosts
<Server IP> music.163.com
<Server IP> interface.music.163.com
<Server IP> interface3.music.163.com
<Server IP> interface.music.163.com.163jiasu.com
<Server IP> interface3.music.163.com.163jiasu.com
```

> 使用此方法必须监听 80 端口 `-p 80`
>
> **若在本机运行程序**，请指定网易云服务器 IP `-f xxx.xxx.xxx.xxx` (可在修改 hosts 前通过 `ping music.163.com` 获得) **或** 使用代理 `-u http(s)://xxx.xxx.xxx.xxx:xxx`，以防请求死循环
>
> **Android 客户端下修改 hosts 无法直接使用**，原因和解决方法详见[云音乐安卓又搞事啦](https://jixun.moe/post/netease-android-hosts-bypass/)，[安卓免 root 绕过网易云音乐 IP 限制](https://jixun.moe/post/android-block-netease-without-root/)

### 方法 2. 设置代理

PAC 自动代理脚本地址 `http://<Server Name:PORT>/proxy.pac`

全局代理地址填写服务器地址和端口号即可

| 平台    | 基础设置                              |
| :------ | :------------------------------------ |
| Windows | 设置 > 工具 > 自定义代理 (客户端内)   |
| UWP     | Windows 设置 > 网络和 Internet > 代理 |
| Linux   | 系统设置 > 网络 > 网络代理            |
| macOS   | 系统偏好设置 > 网络 > 高级 > 代理     |
| Android | WLAN > 修改网络 > 高级选项 > 代理     |
| iOS     | 无线局域网 > HTTP 代理 > 配置代理     |

> 代理工具和方法有很多请自行探索，欢迎在 issues 讨论

### ✳ 方法 3. 调用接口

作为依赖库使用

```javascript
const match = require('@unblockneteasemusic/server');

/**
 * Set proxy or hosts if needed
 */
global.proxy = require('url').parse('http://127.0.0.1:1080');
global.hosts = { 'i.y.qq.com': '59.37.96.220' };

/**
 * Find matching song from other platforms
 * @param {Number} id netease song id
 * @param {Array<String>||undefined} source support qq, xiami, baidu, kugou, kuwo, migu, joox
 * @return {Promise<Object>}
 */
match(418602084, ['qq', 'kuwo', 'migu']).then(console.log);
```

### 設定 HTTPS 憑證

新版的 NeteaseMusic 需要 HTTPS 才能使用。证书的设置教学可参阅[《安裝 UNM 的 HTTPS 憑證》](https://github.com/UnblockNeteaseMusic/server/discussions/426)一文。

## 效果

### Windows 客户端

<img alt="Windows 客户端" src="https://user-images.githubusercontent.com/26399680/60316017-87de8a80-999b-11e9-9381-16d40efbe7f6.png" width="100%">

### UWP 客户端

<img alt="UWP 客户端" src="https://user-images.githubusercontent.com/26399680/52215123-5a028780-28ce-11e9-8491-08c4c5dac3b4.png" width="100%">

### Linux 客户端

<img alt="Linux 客户端" src="https://user-images.githubusercontent.com/26399680/60316169-18b56600-999c-11e9-8ae5-5cd168b0edae.png" width="100%">

### macOS 客户端

<img alt="macOS 客户端" src="https://user-images.githubusercontent.com/26399680/52196035-51418f80-2895-11e9-8f33-78a631cdf151.png" width="100%">

### Android 客户端

<img alt="Android 客户端" src="https://user-images.githubusercontent.com/26399680/57972549-eabd2900-79ce-11e9-8fef-95cb60906298.png" width="50%">

### iOS 客户端

<img alt="iOS 客户端" src="https://user-images.githubusercontent.com/26399680/57972440-f90a4580-79cc-11e9-8dbf-6150ee299b9c.jpg" width="50%">

## 致谢

感谢大佬们为逆向 eapi 所做的努力

使用的其它平台音源 API 出自

[trazyn/ieaseMusic](https://github.com/trazyn/ieaseMusic)

[listen1/listen1_chrome_extension](https://github.com/listen1/listen1_chrome_extension)

向所有同类项目致敬

[EraserKing/CloudMusicGear](https://github.com/EraserKing/CloudMusicGear)

[EraserKing/Unblock163MusicClient](https://github.com/EraserKing/Unblock163MusicClient)

[ITJesse/UnblockNeteaseMusic](https://github.com/ITJesse/UnblockNeteaseMusic/)

[bin456789/Unblock163MusicClient-Xposed](https://github.com/bin456789/Unblock163MusicClient-Xposed)

[YiuChoi/Unlock163Music](https://github.com/YiuChoi/Unlock163Music)

[yi-ji/NeteaseMusicAbroad](https://github.com/yi-ji/NeteaseMusicAbroad)

[stomakun/NeteaseReverseLadder](https://github.com/stomakun/NeteaseReverseLadder/)

[fengjueming/unblock-NetEaseMusic](https://github.com/fengjueming/unblock-NetEaseMusic)

[acgotaku/NetEaseMusicWorld](https://github.com/acgotaku/NetEaseMusicWorld)

[mengskysama/163-Cloud-Music-Unlock](https://github.com/mengskysama/163-Cloud-Music-Unlock)

[azureplus/163-music-unlock](https://github.com/azureplus/163-music-unlock)

[typcn/163music-mac-client-unlock](https://github.com/typcn/163music-mac-client-unlock)

## 许可

(Original project) [nondanee/UnblockNeteaseMusic](https://github.com/nondanee/UnblockNeteaseMusic): [MIT](https://github.com/nondanee/UnblockNeteaseMusic/blob/master/LICENSE)

(This project) [UnblockNeteaseMusic/server](https://github.com/UnblockNeteaseMusic/server): [LGPL-3.0-only](https://spdx.org/licenses/LGPL-3.0-only.html)

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FUnblockNeteaseMusic%2Fserver.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2FUnblockNeteaseMusic%2Fserver?ref=badge_large)
