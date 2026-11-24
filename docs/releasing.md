# 发布流程

## 发一个新版本

`scripts/release/prepare.py` 可以帮忙做前两步：`notes` 从上个标签以来的提交起草更新日志，`bump 3.0.1` 改两处版本号并把 `[Unreleased]` 移到新版本下，`check` 在打标签前检查版本号、更新日志和标签。它只改本地文件。

1. 改 `pubspec.yaml` 的 `version` 和 `lib/version.dart` 的 `appVersion`（`flutter test` 会检查两者一致）。
2. 在 `CHANGELOG.md` 里把 `[Unreleased]` 的内容移到新版本下面。
3. 提交，打标签并推送：

   ```sh
   git tag v3.0.1
   git push origin main v3.0.1
   ```

4. GitHub Actions 的 Release 工作流会构建三个平台的安装包，创建一个**草稿** Release。下载装一下确认没问题，然后在 GitHub 上点 **Publish release**。发布之后已安装的应用才会收到更新（应用读的是 `releases/latest/download/appcast-*.xml`）。

   Release 里的 `latest.yml`、`latest-mac.yml`、`latest-linux.yml` 是给 0.4.x 旧版（Electron）看的：旧版检查到它们就弹窗提示去 Releases 页下载新版，别删。旧版代码在 `1.x` 分支，不再发版；如果哪天要在那里发，记得取消「Set as latest release」，不然 3.x 的自动更新会读错 Release。

## 需要配置的 Secrets 和 Variables

在仓库的 Settings → Secrets and variables → Actions 里添加。全都不配也能出包，只是不签名、不公证、不开自动更新。

### macOS 签名和公证

| 名字 | 类型 | 内容 |
| --- | --- | --- |
| `MACOS_CERTIFICATE_P12` | Secret | 「Developer ID Application」证书连同私钥导出的 .p12，再 `base64 -i cert.p12 \| pbcopy` |
| `MACOS_CERTIFICATE_PASSWORD` | Secret | 导出 .p12 时设的密码 |
| `MACOS_SIGNING_IDENTITY` | Variable | 证书的完整名字，例如 `Developer ID Application: Your Name (ABCDE12345)`，可以用 `security find-identity -v -p codesigning` 查 |
| `APPLE_API_KEY_P8` | Secret | App Store Connect API 密钥（.p8 文件）的 base64 |
| `APPLE_API_KEY_ID` | Secret | 这个密钥的 Key ID |
| `APPLE_API_ISSUER_ID` | Secret | Issuer ID |

获取方法：

1. **Developer ID 证书**：在 Xcode → Settings → Accounts → Manage Certificates 里点 + 选「Developer ID Application」（需要是开发者账号的 Account Holder 或 Admin）。然后在「钥匙串访问」里找到这个证书，连同私钥一起导出为 .p12。
2. **App Store Connect API 密钥**：[App Store Connect](https://appstoreconnect.apple.com/access/integrations/api) → 用户和访问 → 集成 → App Store Connect API，新建一个「Developer」权限的密钥，下载 .p8（只能下载一次），记下 Key ID 和页面上方的 Issuer ID。

### 自动更新的签名密钥

自动更新包用单独的密钥签名，和 Apple 证书无关。**私钥丢了，已安装的应用就再也收不到更新**，请备份好。

| 名字 | 类型 | 内容 |
| --- | --- | --- |
| `SPARKLE_PUBLIC_KEY` | Variable | macOS（Sparkle）EdDSA 公钥 |
| `SPARKLE_PRIVATE_KEY` | Secret | 对应的私钥 |
| `WINDOWS_DSA_PUBLIC_KEY` | Variable | Windows（WinSparkle）DSA 公钥，PEM 全文 |
| `WINDOWS_DSA_PRIVATE_KEY` | Secret | 对应的私钥，PEM 全文 |

生成方法（在 Mac 上，先 `flutter build macos` 一次，让 CocoaPods 装好 Sparkle）：

```sh
# Sparkle：生成后私钥存在登录钥匙串里，-x 导出到文件
macos/Pods/Sparkle/bin/generate_keys            # 打印公钥 → SPARKLE_PUBLIC_KEY
macos/Pods/Sparkle/bin/generate_keys -x sparkle_private.key   # 文件内容 → SPARKLE_PRIVATE_KEY

# WinSparkle：DSA 密钥
openssl dsaparam -genkey 2048 -out dsa_priv.pem  # 文件内容 → WINDOWS_DSA_PRIVATE_KEY
openssl dsa -in dsa_priv.pem -pubout -out dsa_pub.pem  # 文件内容 → WINDOWS_DSA_PUBLIC_KEY
```

配好之后，正式版会带上 `--dart-define=YPM_SPARKLE=true`，macOS 和 Windows 上由 Sparkle / WinSparkle 每天检查一次更新。自己编译的版本和 Linux 版本在 设置 → 关于 里检查 GitHub 上的最新版本。

## 本地出包

```sh
flutter build macos --release     # build/macos/Build/Products/Release/YesPlayMusic.app
flutter build windows --release   # build\windows\x64\runner\Release\
flutter build linux --release     # build/linux/x64/release/bundle/（arm64 机器上是 build/linux/arm64/...）
```

Linux 构建需要：`clang cmake ninja-build pkg-config libgtk-3-dev liblzma-dev libmpv-dev`。
