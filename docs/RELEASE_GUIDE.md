# 🚀 快速发布指南

本文档提供快速发布新版本的完整步骤。

## ⚡ 快速发布（推荐）

```bash
# 1. 确保在正确的分支
git checkout NewApi
git pull origin NewApi

# 2. 更新版本号
vim package.json  # 修改 "version": "0.4.10-newapi"

# 3. 提交更改
git add package.json
git commit -m "chore: bump version to 0.4.10-newapi"
git push origin NewApi

# 4. 创建并推送标签
git tag v0.4.10-newapi
git push origin v0.4.10-newapi

# 5. 等待 GitHub Actions 完成（约 35-50 分钟）
# 访问: https://github.com/你的用户名/YesPlayMusic/actions

# 6. 发布 Release
# 访问: https://github.com/你的用户名/YesPlayMusic/releases
# 点击 Draft release -> Edit -> Publish
```

## 📋 版本号规范

### 格式
```
v{major}.{minor}.{patch}-newapi
```

### 示例
- `v0.4.9-newapi` - 第一个新 API 版本
- `v0.4.10-newapi` - 补丁版本
- `v0.5.0-newapi` - 小版本更新
- `v1.0.0-newapi` - 大版本更新

### Beta 版本
```bash
git tag v0.4.10-newapi-beta.1
git push origin v0.4.10-newapi-beta.1
```

## 🔍 发布前检查清单

在创建 tag 之前，确保：

- [ ] 本地构建成功（`yarn electron:build-mac`）
- [ ] 代码已提交并推送到远程
- [ ] 版本号已更新且符合规范
- [ ] CHANGELOG 已更新（如果有）
- [ ] 所有测试通过
- [ ] 已在本地测试运行应用

## 📦 下载构建产物

### 方法 1: GitHub Artifacts（无需等待 Release）

```bash
# 1. 访问 Actions 页面
https://github.com/你的用户名/YesPlayMusic/actions

# 2. 点击最新的成功构建

# 3. 滚动到底部的 Artifacts 区域

# 4. 下载需要的平台包：
#    - YesPlayMusic-NewAPI-macOS-{SHA}
#    - YesPlayMusic-NewAPI-Windows-{SHA}
#    - YesPlayMusic-NewAPI-Linux-{SHA}
```

### 方法 2: GitHub Releases（正式发布后）

```bash
https://github.com/你的用户名/YesPlayMusic/releases
```

## 🎯 测试发布（不创建 Release）

如果只想测试构建，不发布 Release：

```bash
# 直接推送代码（不打 tag）
git push origin NewApi

# GitHub Actions 会构建但不创建 Release
# 从 Artifacts 下载测试
```

## 🔄 撤销发布

### 撤销 Git Tag

```bash
# 删除本地标签
git tag -d v0.4.10-newapi

# 删除远程标签
git push origin :refs/tags/v0.4.10-newapi
```

### 删除 GitHub Release

1. 访问 Releases 页面
2. 点击要删除的 Release
3. 点击 "Delete" 按钮

## 🐛 常见问题

### Q: 构建失败怎么办？

**A:** 查看构建日志：
1. 访问 Actions 页面
2. 点击失败的构建
3. 查看红色 ❌ 的步骤
4. 展开日志查看错误信息

常见错误：
- Node 版本不匹配 → 已在 workflow 中固定为 16.20.2
- 依赖安装失败 → 检查 package.json
- 构建超时 → 可能是网络问题，重试

### Q: 如何重新触发构建？

**A:** 有三种方法：

**方法 1: Re-run jobs**
1. 访问失败的构建页面
2. 点击右上角的 "Re-run jobs"
3. 选择 "Re-run failed jobs" 或 "Re-run all jobs"

**方法 2: 推送新提交**
```bash
git commit --allow-empty -m "chore: trigger rebuild"
git push origin NewApi
```

**方法 3: 删除并重新创建 tag**
```bash
git tag -d v0.4.10-newapi
git push origin :refs/tags/v0.4.10-newapi
git tag v0.4.10-newapi
git push origin v0.4.10-newapi
```

### Q: 为什么没有创建 Release？

**A:** 检查：
1. 是否推送了 tag（不是普通提交）
2. Tag 格式是否正确（`v*` 格式）
3. 构建是否全部成功
4. 查看 `create-release` job 的日志

### Q: 如何手动触发构建？

**A:** 
1. 访问 Actions 页面
2. 选择 "Build with New API"
3. 点击 "Run workflow"
4. 选择分支
5. 点击绿色的 "Run workflow" 按钮

### Q: 构建时间太长？

**A:** 正常情况：
- macOS: 15-20 分钟（3 个架构）
- Windows: 10-15 分钟
- Linux: 10-15 分钟
- 总计: 35-50 分钟

优化方法：
- 使用更快的 runner（需付费）
- 减少构建的架构数量
- 使用增量构建（需配置缓存）

## 📊 发布状态监控

### 构建状态徽章

在 README 中添加状态徽章：

```markdown
![Build Status](https://github.com/你的用户名/YesPlayMusic/workflows/Build%20with%20New%20API/badge.svg?branch=NewApi)
```

### 订阅通知

在 GitHub 仓库页面：
1. 点击右上角 "Watch"
2. 选择 "Custom"
3. 勾选 "Actions"

## 🎉 发布成功后

- [ ] 在 Release 页面编辑描述
- [ ] 添加更新日志
- [ ] 通知用户下载新版本
- [ ] 在社交媒体发布（可选）
- [ ] 更新文档版本号

## 📝 Release Notes 模板

```markdown
## 🎵 YesPlayMusic v0.4.10-newapi

### ✨ 新特性
- 新增XXX功能
- 优化XXX性能

### 🐛 修复
- 修复XXX问题
- 解决XXX错误

### 📦 下载

**macOS:**
- Intel (x64): `YesPlayMusic-mac-0.4.10-x64.dmg`
- Apple Silicon (arm64): `YesPlayMusic-mac-0.4.10-arm64.dmg`
- Universal: `YesPlayMusic-mac-0.4.10-universal.dmg`

**Windows:**
- 安装版: `YesPlayMusic-Setup-0.4.10.exe`
- 便携版: `YesPlayMusic-0.4.10-portable.exe`

**Linux:**
- AppImage: `YesPlayMusic-0.4.10.AppImage`
- Debian/Ubuntu: `YesPlayMusic-0.4.10-amd64.deb`
- RedHat/Fedora: `YesPlayMusic-0.4.10-x86_64.rpm`

### 🔧 技术更新
- 使用 @neteaseapireborn/api v4.29.7
- 基于 Electron 13.6.7
- Node.js 16 运行时

### 📚 文档
- [GitHub Actions 构建说明](./docs/GITHUB_ACTIONS.md)
- [快速发布指南](./docs/RELEASE_GUIDE.md)

### 🙏 致谢
感谢所有贡献者和测试者！
```

## 🔗 相关链接

- [完整 GitHub Actions 文档](./GITHUB_ACTIONS.md)
- [项目 README](../README.md)
- [贡献指南](../CONTRIBUTING.md)
- [问题追踪](https://github.com/你的用户名/YesPlayMusic/issues)
