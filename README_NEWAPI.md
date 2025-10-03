# 🎵 YesPlayMusic - NewAPI 分支

[![Build Status](https://github.com/你的用户名/YesPlayMusic/workflows/Build%20with%20New%20API/badge.svg?branch=NewApi)](https://github.com/你的用户名/YesPlayMusic/actions)
[![Node.js Version](https://img.shields.io/badge/node.js-16.x-brightgreen.svg)](https://nodejs.org/)
[![API](https://img.shields.io/badge/API-@neteaseapireborn/api-blue.svg)](https://github.com/neteaseapireborn/api)
[![License](https://img.shields.io/github/license/qier222/YesPlayMusic)](https://github.com/qier222/YesPlayMusic/blob/master/LICENSE)

> 这是使用新版 `@neteaseapireborn/api` 的开发分支

## 🆕 NewAPI 分支特点

### 与主分支的区别

| 特性 | 主分支 | NewAPI 分支 |
|------|--------|-------------|
| API 包 | `NeteaseCloudMusicApi` | `@neteaseapireborn/api` |
| API 版本 | ~4.23.3 | 4.29.7+ |
| Node.js 最低版本 | 14 | 16 |
| API 端口 | 3000 | 10754 |
| 性能 | 标准 | 优化 |
| 维护状态 | 稳定版 | 开发版 |

### ✨ 新特性

- 🚀 **更快的 API 响应** - 优化了请求处理性能
- 📦 **模块化架构** - 更好的代码组织和维护
- 🔧 **改进的错误处理** - 更详细的日志和错误信息
- 🔐 **增强的安全性** - 更新的依赖和安全补丁
- 🌐 **更好的网络支持** - 改进的代理和重试机制

## 🚀 快速开始

### 环境要求

- Node.js 16.x（必须）
- Yarn 1.x
- macOS / Windows / Linux

### 安装和运行

```bash
# 1. 克隆仓库
git clone -b NewApi https://github.com/你的用户名/YesPlayMusic.git
cd YesPlayMusic

# 2. 安装 nvm（如果还没有）
# macOS/Linux:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 3. 使用 Node 16
nvm install 16
nvm use 16

# 4. 安装依赖
yarn install

# 5. 安装 API 依赖
cd netease-api
yarn install --production
cd ..

# 6. 运行开发服务器
yarn electron:serve
```

### 开发模式

```bash
# Web 开发（浏览器）
yarn serve

# Electron 开发
yarn electron:serve

# 代码检查
yarn lint

# 代码格式化
yarn prettier
```

### 构建应用

```bash
# 构建当前平台
yarn electron:build

# 构建 macOS
yarn electron:build-mac

# 构建 Windows
yarn electron:build-win

# 构建 Linux
yarn electron:build-linux

# 构建所有平台
yarn electron:build-all
```

## 📦 下载

### 方法 1: GitHub Releases（推荐）

访问 [Releases 页面](https://github.com/你的用户名/YesPlayMusic/releases) 下载最新版本。

### 方法 2: GitHub Actions Artifacts

1. 访问 [Actions 页面](https://github.com/你的用户名/YesPlayMusic/actions)
2. 选择最新的成功构建
3. 下载对应平台的 Artifacts

## 🛠️ 开发

### 项目结构

```
YesPlayMusic/
├── src/                    # 源代码
│   ├── api/               # API 接口封装
│   ├── components/        # Vue 组件
│   ├── electron/          # Electron 主进程代码
│   ├── store/             # Vuex 状态管理
│   ├── utils/             # 工具函数
│   └── views/             # 页面组件
├── netease-api/           # 网易云 API（@neteaseapireborn/api）
├── public/                # 静态资源
├── build/                 # 构建配置
├── .github/workflows/     # GitHub Actions 配置
│   └── build-newapi.yml  # 新 API 构建流程
└── docs/                  # 文档
    ├── GITHUB_ACTIONS.md # Actions 使用说明
    └── RELEASE_GUIDE.md  # 发布指南
```

### 关键配置文件

- `package.json` - 项目依赖和脚本
- `vue.config.js` - Vue CLI 和 Electron Builder 配置
- `.env` - 环境变量配置
- `src/background.js` - Electron 主进程入口
- `src/electron/services.js` - API 服务管理

### API 配置

#### 开发环境

```javascript
// Electron 模式
VUE_APP_ELECTRON_API_URL_DEV=http://127.0.0.1:10754

// Web 模式（通过代理）
VUE_APP_NETEASE_API_URL=/api
```

#### 生产环境

```javascript
VUE_APP_NETEASE_API_URL=/api
VUE_APP_ELECTRON_API_URL=/api
```

### Cookie 登录测试

使用提供的快速登录脚本：

```javascript
// 1. 获取你的 MUSIC_U Cookie（从浏览器）

// 2. 打开 Electron DevTools (Cmd+Option+I 或 Ctrl+Shift+I)

// 3. 粘贴 test/quick-login.js 的内容到 Console

// 4. 替换 MUSIC_U 值并回车
```

详见 `test/quick-login.js` 文件。

## 🤝 贡献

欢迎提交 Pull Request！

### 开发流程

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

### 代码规范

- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 提交前运行 `yarn lint`

## 📚 文档

- [GitHub Actions 自动构建说明](./docs/GITHUB_ACTIONS.md)
- [快速发布指南](./docs/RELEASE_GUIDE.md)
- [主项目 README](./README.md)

## 🐛 已知问题

### Discord RPC 错误（可忽略）

```
UnhandledPromiseRejectionWarning: Error: Could not connect
```

这是 Discord Rich Presence 功能的警告，不影响应用使用。

### ESLint 警告

代码中存在一些 ESLint 风格警告，不影响功能。计划在后续版本中修复。

### 端口冲突

如果 10754 端口被占用，可以修改 `.env` 文件：

```bash
VUE_APP_ELECTRON_API_URL_DEV=http://127.0.0.1:新端口
```

同时修改 `src/electron/services.js` 中的端口配置。

## 🔄 与主分支同步

定期从上游主分支合并更新：

```bash
# 添加上游仓库
git remote add upstream https://github.com/qier222/YesPlayMusic.git

# 拉取上游更新
git fetch upstream

# 合并主分支
git merge upstream/master

# 解决冲突后推送
git push origin NewApi
```

## 📝 更新日志

### v0.4.9-newapi (2025-10-03)

- ✨ 使用 @neteaseapireborn/api 替换旧 API
- 🔧 修复 Node.js 16 兼容性问题
- 📦 降级 esbuild 到 0.17.19
- 🎯 升级编译目标到 ES2018
- 🔍 添加全面的 API 调用日志
- 🍪 改进 Cookie 处理逻辑
- 🚀 配置 GitHub Actions 自动构建
- 📚 完善文档和使用说明

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

## 🙏 致谢

- 原作者 [@qier222](https://github.com/qier222)
- API 提供 [@neteaseapireborn](https://github.com/neteaseapireborn)
- 所有贡献者和测试者

## 💬 联系方式

- 提交 [Issue](https://github.com/你的用户名/YesPlayMusic/issues)
- 加入 [Telegram 群组](https://t.me/yesplaymusic)

---

⭐ 如果这个项目对你有帮助，请给我们一个 Star！
