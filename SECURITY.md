# 安全说明 / Security

## 报告漏洞

请不要在公开 Issue 里报告安全问题。请在仓库的 **Security → Report a vulnerability** 里私下提交，写清楚受影响的版本、复现步骤和可能的影响。收到后会尽快回复。

Please do not report security issues in public issues. Use **Security → Report a vulnerability** on this repository to send a private report with the affected version, steps to reproduce and impact.

只有最新发布的版本会收到安全修复。

## 插件的信任模型

YesPlayMusic 本身不带任何在线音乐服务，在线功能都来自第三方插件。**安装插件就是在本机运行别人写的代码**，请只安装你信任的插件。

应用对插件做了这些限制：

| 能力 | 限制 |
| --- | --- |
| 运行环境 | 插件跑在内置的 QuickJS 引擎里，每个插件一个独立线程，没有 Node.js，也没有 QuickJS 的 `std` / `os` 模块，不能直接读写文件或启动进程。内存上限 128 MB，单次调用有超时，死循环会被停止。 |
| 代码 | 只能加载插件自己目录里的模块，不能 `import` 目录以外的文件（包括通过软链接）。 |
| 网络 | 只能访问 `plugin.json` 的 `permissions.network` 里列出的主机，重定向到列表外的主机也会被拦下。请求走系统代理。 |
| 存储 | 只能读写自己的 `storage.json`（通过 `host.storage`）和设置值，看不到其他插件的数据。 |
| 播放地址 | 只能是 http(s) 地址，或插件自己目录 / 数据目录里的文件。 |
| 本机程序 | 只能启动 `permissions.process` 里列出的程序，并且用户要在设置里对这个插件单独打开「允许运行本机程序」（默认关闭）。程序以当前用户的权限运行，**打开后插件实际上拥有和你一样的权限**。 |
| 网页登录 | `host.webSignIn` 在独立、不落盘的浏览器窗口里打开登录页，只把 `permissions.network` 里主机的 Cookie 交给插件。 |

需要注意的地方：

- `permissions.network` 写 `*` 的插件可以访问任意网站，包括你局域网里的服务。
- 插件保存的登录状态（Cookie、Token）和你在插件设置里填的密码，以明文存在插件数据目录的 `storage.json`、`settings.json` 里，和本机其他应用的数据一样，依赖操作系统的用户隔离保护。
- 插件不经过任何审核，应用也不会自动下载或更新插件。

## 应用本身

- macOS 版本使用 Developer ID 签名并经过 Apple 公证。为了读取你选择的任意音乐文件夹、让插件访问各自的网站，应用没有启用 App Sandbox。
- 自动更新只从本仓库的 GitHub Releases 下载，macOS / Windows 的更新包用 EdDSA 签名校验。
- 应用会发送匿名使用统计，可以在 设置 → 关于 里关闭。
