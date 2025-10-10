# Touch Bar 歌词实时显示功能

## 📝 功能描述

为 macOS 版本添加 Touch Bar 歌词实时显示功能，让用户无需切换到歌词页面即可在 Touch Bar 上查看当前播放歌曲的歌词。

## ✨ 功能特性

- ✅ **实时同步**：歌词随播放进度自动滚动更新（50ms 刷新间隔）
- ✅ **全局可用**：无需打开歌词页面，在任何页面都能显示歌词
- ✅ **优化布局**：简洁的 Touch Bar 设计，歌词居中显示，最大化显示空间
- ✅ **默认文本**：无歌词时显示 "♪ YesPlayMusic"
- ✅ **格式美化**：歌词前添加音符符号 ♪
- ✅ **性能优化**：仅在歌词索引变化时发送 IPC 消息，避免不必要的性能开销

## 🎨 Touch Bar 布局

### 优化后的布局设计

```
[上一首] [播放/暂停] [下一首]  [=========弹性空间=========]  ♪ 歌词居中显示  [=========弹性空间=========]  [❤️]
```

### 设计理念

- **左侧**：核心播放控制按钮（上一首、播放/暂停、下一首）
- **中间**：歌词显示区域，使用弹性空间实现居中和最大化
- **右侧**：爱心按钮（喜欢/收藏功能）

移除了不常用的前进/后退/搜索/播放列表按钮，聚焦核心功能，为歌词显示腾出更多空间。

## 📁 修改文件

### 1. `src/electron/touchBar.js`

**主要修改**：
- 导入 `TouchBarLabel` 组件
- 创建歌词显示标签 `lyricLabel`
- 添加 `updateLyric` IPC 事件监听器
- 优化 Touch Bar 布局，移除不常用按钮
- 添加调试日志便于开发调试

**代码量**：+30 行，-21 行

### 2. `src/views/lyrics.vue`

**主要修改**：
- 引入 Electron IPC 通信模块
- 在歌词高亮变化时通过 IPC 发送当前歌词到主进程
- 在 Electron 环境下始终运行歌词定时器（不仅在歌词页面）
- 优化滚动逻辑：仅在显示歌词页面时才滚动 DOM
- 添加调试日志便于开发调试

**代码量**：+25 行，-5 行

## 🔧 技术实现

### 数据流程

```
播放进度更新（每 50ms）
    ↓
lyrics.vue 定时器检测当前歌词索引
    ↓
highlightLyricIndex 变化
    ↓
ipcRenderer.send('updateLyric', { lyric: '当前歌词文本' })
    ↓
touchBar.js 监听 updateLyric 事件
    ↓
更新 lyricLabel.label = '♪ 当前歌词'
    ↓
Touch Bar 实时显示歌词
```

### 关键技术点

1. **IPC 通信**：使用 Electron 的 `ipcRenderer` 和 `ipcMain` 进行渲染进程和主进程通信
2. **定时器优化**：在 Electron 环境下始终运行歌词定时器，但仅在歌词页面时才滚动 DOM
3. **性能优化**：只在歌词索引变化时才发送消息，避免重复发送
4. **环境判断**：通过 `process.env.IS_ELECTRON` 判断是否在 Electron 环境

## 🧪 测试建议

### 测试场景

1. **基础功能测试**
   - 播放有歌词的歌曲，观察 Touch Bar 是否显示歌词
   - 检查歌词是否随播放进度同步更新
   - 测试播放无歌词的歌曲，应显示默认文本

2. **跨页面测试**
   - 在首页、专辑页、播放列表页等不同页面播放歌曲
   - 确认 Touch Bar 歌词在所有页面都能正常显示

3. **边界情况测试**
   - 快速切歌，检查歌词是否能及时更新
   - 手动拖动进度条，检查歌词是否跳转到对应位置
   - 测试纯音乐、无歌词、单行歌词等特殊情况

4. **性能测试**
   - 长时间播放，观察是否有内存泄漏
   - 检查 CPU 占用是否正常

### 测试步骤

```bash
# 1. 安装依赖
yarn install

# 2. 运行开发版本
yarn electron:serve

# 3. 打开开发者工具查看控制台日志
# 应该看到：
# [Touch Bar] 发送歌词: xxx
# [Touch Bar] 收到歌词更新: xxx

# 4. 构建生产版本测试
yarn electron:build
```

## 📸 效果截图

Touch Bar 歌词显示效果：

```
[⏮] [⏯] [⏭]        ♪ 当前播放的歌词内容实时显示在这里        [❤️]
```

## 🔍 代码质量

- ✅ 通过 ESLint 检查（0 个错误）
- ✅ 符合项目代码风格规范
- ✅ 添加了详细的中文注释
- ✅ 最小化修改原则，不影响现有功能

## 🐛 已知限制

1. **仅支持 macOS**：Touch Bar 是 macOS 特有硬件，此功能仅在支持 Touch Bar 的 Mac 设备上可用
2. **需要 Electron 环境**：此功能仅在桌面客户端中生效，Web 版本不受影响
3. **歌词显示长度**：Touch Bar 空间有限，仅显示第一行歌词（原文），不显示翻译

## 🎯 未来优化方向

1. **可配置性**：在设置中添加开关，允许用户选择是否启用 Touch Bar 歌词
2. **样式自定义**：支持用户自定义歌词字体大小、颜色等
3. **滚动效果**：对于过长的歌词，可以添加滚动或跑马灯效果
4. **歌词翻译**：可选显示翻译歌词或原文歌词

## 📚 参考资料

- [Electron Touch Bar API](https://www.electronjs.org/docs/latest/api/touch-bar)
- [Apple Touch Bar Design Guidelines](https://developer.apple.com/design/human-interface-guidelines/macos/touch-bar/touch-bar-overview/)

## 👨‍💻 开发者信息

- **实现者**：[@KawakazeNotFound](https://github.com/KawakazeNotFound)
- **测试环境**：macOS 14+ / Electron 13+
- **开发时间**：2025-10-10

## 🙏 致谢

感谢 YesPlayMusic 项目的所有贡献者，以及参考的 Touchbar-Lyrics 分支的设计思路。

---

## 📋 Checklist

提交前请确认：

- [x] 代码通过 ESLint 检查
- [x] 功能在本地测试通过
- [x] 不影响现有功能
- [x] 添加了必要的注释
- [x] 遵循项目代码风格
- [x] 最小化修改，只改动必要的文件

