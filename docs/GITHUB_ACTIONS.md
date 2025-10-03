# GitHub Actions 自动构建说明

本项目使用 GitHub Actions 进行跨平台自动化构建。

## 📋 工作流文件

### 1. `build-newapi.yml` - 新 API 版本构建
专门为使用 `@neteaseapireborn/api` 的 NewApi 分支设计的构建流程。

**触发条件：**
- 推送到 `NewApi` 分支
- 创建 `v*-newapi` 格式的标签（如 `v0.4.9-newapi`）
- 手动触发（workflow_dispatch）
- Pull Request 到 `NewApi` 分支

**支持平台：**
- ✅ macOS (x64, arm64, universal)
- ✅ Windows (x64, portable & installer)
- ✅ Linux (x64, arm64, armv7l - AppImage, deb, rpm, tar.gz)

## 🚀 使用方法

### 自动构建（推送触发）

```bash
# 1. 确保在 NewApi 分支
git checkout NewApi

# 2. 提交并推送代码
git add .
git commit -m "feat: your changes"
git push origin NewApi

# 3. GitHub Actions 会自动开始构建
```

### 手动触发构建

1. 访问 GitHub 仓库页面
2. 点击 **Actions** 标签
3. 选择 **Build with New API** 工作流
4. 点击右侧的 **Run workflow** 按钮
5. 选择分支并点击 **Run workflow**

### 发布 Release

要创建一个正式发布版本：

```bash
# 1. 创建并推送带有版本号的标签
git tag v0.4.9-newapi
git push origin v0.4.9-newapi

# 2. GitHub Actions 会自动：
#    - 构建所有平台的安装包
#    - 创建 Draft Release
#    - 上传所有构建产物

# 3. 在 GitHub Releases 页面：
#    - 检查构建的安装包
#    - 编辑 Release 描述
#    - 发布 Release
```

## 📦 构建产物

构建完成后，产物会以 Artifacts 形式上传：

### macOS 产物
```
YesPlayMusic-NewAPI-macOS-{SHA}/
├── YesPlayMusic-mac-0.4.9-x64.dmg          # Intel 版本
├── YesPlayMusic-mac-0.4.9-arm64.dmg        # Apple Silicon 版本
├── YesPlayMusic-mac-0.4.9-universal.dmg    # 通用版本
├── *.dmg.blockmap                           # 增量更新文件
└── latest-mac.yml                           # 更新配置
```

### Windows 产物
```
YesPlayMusic-NewAPI-Windows-{SHA}/
├── YesPlayMusic-Setup-0.4.9.exe            # 安装版
├── YesPlayMusic-0.4.9-portable.exe         # 便携版
├── *.exe.blockmap                           # 增量更新文件
└── latest.yml                               # 更新配置
```

### Linux 产物
```
YesPlayMusic-NewAPI-Linux-{SHA}/
├── YesPlayMusic-0.4.9-x64.AppImage         # AppImage 通用版
├── YesPlayMusic-0.4.9-amd64.deb            # Debian/Ubuntu
├── YesPlayMusic-0.4.9-x86_64.rpm           # RedHat/Fedora
├── YesPlayMusic-0.4.9-arm64.tar.gz         # ARM64 压缩包
└── latest-linux.yml                         # 更新配置
```

## 🔧 本地验证

在推送到 GitHub 之前，建议先在本地测试构建：

### 测试单平台构建

```bash
# macOS Intel
yarn electron:build-mac

# Windows
yarn electron:build-win

# Linux
yarn electron:build-linux
```

### 测试全平台构建（需要对应操作系统）

```bash
# 在 macOS 上
yarn electron:build -m

# 在 Windows 上  
yarn electron:build -w

# 在 Linux 上
yarn electron:build -l
```

## 📊 构建流程说明

### 1. 环境准备（所有平台）
- 检出代码
- 安装 Node.js 16.20.2
- 配置 yarn 缓存

### 2. 安装依赖
- 安装项目依赖（`yarn install`）
- 安装 netease-api 依赖（`cd netease-api && yarn install --production`）
- 安装平台特定的 UNM 原生模块

### 3. 构建应用
- 使用 electron-builder 构建
- 应用环境变量配置
- 生成平台特定的安装包

### 4. 上传产物
- 上传到 GitHub Artifacts（保留 30 天）
- 如果是 tag 推送，创建 Draft Release

## 🔐 环境变量

构建时使用的环境变量（已在 workflow 中配置）：

```bash
VUE_APP_NETEASE_API_URL=/api
VUE_APP_ELECTRON_API_URL=/api
VUE_APP_ELECTRON_API_URL_DEV=http://127.0.0.1:10754
VUE_APP_LASTFM_API_KEY=09c55292403d961aa517ff7f5e8a3d9c
VUE_APP_LASTFM_API_SHARED_SECRET=307c9fda32b3904e53654baff215cb67
```

## ⚠️ 注意事项

### Node 版本
- **必须使用 Node.js 16**
- 项目的 `package.json` 限制了引擎版本为 `"14 || 16"`
- GitHub Actions 已配置使用 `16.20.2`

### netease-api 依赖
- netease-api 目录需要独立安装依赖
- 使用 `--production` 标志只安装生产依赖
- workflow 已自动处理

### 平台限制
- **macOS 构建只能在 macOS runner 上运行**（用于签名和公证）
- **Windows 构建只能在 Windows runner 上运行**
- **Linux 构建在 Ubuntu 22.04 上运行**

### 构建时间
- macOS: ~15-20 分钟（包含 x64, arm64, universal 三个版本）
- Windows: ~10-15 分钟
- Linux: ~10-15 分钟
- **总计约 35-50 分钟完成全平台构建**

## 🐛 故障排查

### 构建失败常见原因

1. **Node 版本不匹配**
   ```
   error: The engine "node" is incompatible
   ```
   → 检查 workflow 中的 Node 版本配置

2. **依赖安装失败**
   ```
   error: Cannot find module '@neteaseapireborn/api'
   ```
   → 检查 netease-api 目录是否正确提交
   → 检查 package.json 中的依赖配置

3. **esbuild 版本冲突**
   ```
   error: esbuild requires Node.js 18+
   ```
   → 确认已降级到 esbuild@0.17.19

4. **构建产物未找到**
   ```
   Error: No files were found
   ```
   → 检查 vue.config.js 中的构建配置
   → 检查 dist_electron 目录

### 查看构建日志

1. 访问 GitHub 仓库的 **Actions** 页面
2. 点击失败的 workflow 运行
3. 展开失败的步骤查看详细日志
4. 下载日志文件进行本地分析

## 📝 版本发布流程

完整的版本发布流程：

```bash
# 1. 更新版本号
vim package.json  # 修改 version 字段

# 2. 提交版本更新
git add package.json
git commit -m "chore: bump version to 0.4.9-newapi"

# 3. 创建标签
git tag -a v0.4.9-newapi -m "Release v0.4.9 with new API"

# 4. 推送代码和标签
git push origin NewApi
git push origin v0.4.9-newapi

# 5. 等待 GitHub Actions 完成构建（约 35-50 分钟）

# 6. 在 GitHub Releases 页面完成发布：
#    - 检查所有平台的安装包
#    - 编辑 Release Notes
#    - 从 Draft 改为 Published
```

## 🔄 更新现有工作流

如果需要修改构建配置：

1. 编辑 `.github/workflows/build-newapi.yml`
2. 提交并推送更改
3. 下次构建会使用新的配置

常见修改：
- 添加构建步骤
- 修改环境变量
- 调整构建参数
- 更改产物上传路径

## 📚 相关资源

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [electron-builder 文档](https://www.electron.build/)
- [action-electron-builder](https://github.com/samuelmeuli/action-electron-builder)
- [Vue CLI Plugin Electron Builder](https://nklayman.github.io/vue-cli-plugin-electron-builder/)

## 💡 提示

- 建议先在本地测试构建成功后再推送
- Tag 发布会消耗较多 GitHub Actions 配额
- Draft Release 允许在发布前检查和修改
- Artifacts 保留 30 天，足够测试使用
