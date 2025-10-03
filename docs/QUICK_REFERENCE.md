# 🎯 NewAPI 快速参考

## 常用命令

```bash
# 环境切换
nvm use 16                    # 切换到 Node 16

# 安装依赖
yarn install                  # 安装项目依赖
cd netease-api && yarn install --production  # 安装 API 依赖

# 开发
yarn serve                    # Web 开发模式
yarn electron:serve           # Electron 开发模式

# 构建
yarn electron:build-mac       # 构建 macOS
yarn electron:build-win       # 构建 Windows  
yarn electron:build-linux     # 构建 Linux

# 代码质量
yarn lint                     # 代码检查
yarn prettier                 # 代码格式化

# 发布
git tag v0.4.10-newapi       # 创建标签
git push origin v0.4.10-newapi  # 推送标签（触发构建）
```

## 端口配置

| 用途 | 端口 |
|------|------|
| API 服务器 | 10754 |
| Web 开发服务器 | 8080 |
| Electron 开发服务器 | 20201 |
| Express 代理 | 27232 |

## 关键文件路径

```
配置文件：
├── package.json              # 依赖和脚本
├── vue.config.js            # 构建配置
├── .env                     # 环境变量
└── .github/workflows/build-newapi.yml  # CI/CD

源代码：
├── src/background.js        # Electron 主进程
├── src/electron/services.js # API 服务管理
├── src/utils/request.js     # API 请求封装
├── src/ncmModDef.js         # API 模块定义
└── test/quick-login.js      # 快速登录脚本

API：
└── netease-api/             # @neteaseapireborn/api
```

## 环境变量

```bash
# .env 文件
VUE_APP_NETEASE_API_URL=/api
VUE_APP_ELECTRON_API_URL=/api
VUE_APP_ELECTRON_API_URL_DEV=http://127.0.0.1:10754
```

## 问题排查

### Node 版本错误
```bash
# 症状：error: The engine "node" is incompatible
# 解决：nvm use 16
```

### esbuild 版本冲突
```bash
# 症状：esbuild requires Node.js 18+
# 解决：已降级到 0.17.19，重新 yarn install
```

### 端口占用
```bash
# 检查端口：lsof -i :10754
# 杀死进程：kill -9 <PID>
```

### API 未启动
```bash
# 查看日志：应该看到 "Server started successfully @ http://localhost:10754"
# 重启应用：关闭 Electron 窗口，重新 yarn electron:serve
```

### 代理错误
```bash
# 症状：Proxy error: Could not proxy request to localhost:3000
# 解决：vue.config.js 中的代理已改为 10754，重启开发服务器
```

## GitHub Actions

### 手动触发
1. Actions → Build with New API → Run workflow

### 自动触发
- 推送到 NewApi 分支：`git push origin NewApi`
- 推送标签：`git push origin v0.4.10-newapi`

### 构建时间
- macOS: 15-20 分钟
- Windows: 10-15 分钟
- Linux: 10-15 分钟
- **总计: 35-50 分钟**

### 下载产物
1. Actions 页面 → 点击构建
2. 滚动到底部 Artifacts
3. 下载对应平台的包

## API 差异

| 特性 | 旧 API | 新 API |
|------|--------|--------|
| 包名 | NeteaseCloudMusicApi | @neteaseapireborn/api |
| 版本 | 4.23.3 | 4.29.7 |
| Node 要求 | 14+ | 16+ |
| 默认端口 | 3000 | 10754 |
| 安装方式 | npm package | local file dependency |

## 常见路径

```bash
# 构建输出
dist_electron/

# 日志位置
~/Library/Logs/yesplaymusic/  (macOS)
%APPDATA%/yesplaymusic/logs/  (Windows)
~/.config/yesplaymusic/logs/  (Linux)

# 配置位置
~/Library/Application Support/yesplaymusic/  (macOS)
%APPDATA%/yesplaymusic/                      (Windows)
~/.config/yesplaymusic/                      (Linux)
```

## 测试 Cookie 登录

```javascript
// 1. 打开 DevTools (Cmd+Option+I)
// 2. 复制 test/quick-login.js 内容到 Console
// 3. 替换 MUSIC_U 值
// 4. 回车执行
// 5. 等待 3 秒自动刷新
```

## 发布检查清单

- [ ] Node 16 环境
- [ ] 本地构建成功
- [ ] 代码已推送
- [ ] 版本号已更新
- [ ] 创建并推送 tag
- [ ] GitHub Actions 构建成功
- [ ] 下载测试安装包
- [ ] 发布 Release

## 快速链接

- [GitHub Actions 详细文档](./GITHUB_ACTIONS.md)
- [发布指南](./RELEASE_GUIDE.md)
- [NewAPI README](./README_NEWAPI.md)
- [原项目 README](./README.md)

## 紧急联系

- GitHub Issues: https://github.com/你的用户名/YesPlayMusic/issues
- Telegram: https://t.me/yesplaymusic

---

💡 提示：将此文件添加到书签，方便随时查阅！
