# 参与贡献

简体中文 · [English](CONTRIBUTING.en.md)

感谢你参与 YesPlayMusic！从小修复、翻译到新功能，都欢迎提交 Pull Request。

## 开始之前

- **Bug 和小修复**：可以直接提交 Pull Request。有对应的 Issue 时请附上链接。
- **新功能或较大的改动**：先开一个 [Issue](https://github.com/qier222/YesPlayMusic/issues/new/choose)，讨论好做法再动手。
- **音乐源**：应用不内置在线音乐源。接入新服务应在独立仓库里做成插件，不要加到本仓库。见[插件开发指南](docs/plugins.md)。如果插件需要宿主尚未提供的能力，请开一个「Plugin API」Issue。
- **安全问题**：不要公开提交 Issue 或 PR，请私下报告。见 [SECURITY.md](SECURITY.md)。

## 配置开发环境

需要 Flutter 3.50 或更新版本。各平台的要求见[从源码构建](README.zh-CN.md#从源码构建)。

```sh
git clone https://github.com/qier222/YesPlayMusic.git
cd YesPlayMusic
flutter pub get
flutter run -d macos   # or windows / linux
```

## 提交 Pull Request 之前

- `flutter analyze` 和 `flutter test` 都必须通过。CI 会在每个 Pull Request 上运行这两项检查，然后构建 macOS arm64、macOS x64、Windows x64、Linux x64 和 Linux arm64 版本。
- 用 `dart format <files>` 格式化改动的 Dart 文件。不要格式化整个项目，仓库里有些文件尚未格式化，无关改动会增加审阅难度。
- 每个 Pull Request 只做一件事。
- 修改行为时，补充或更新测试。

## 文案和翻译

- 不要硬编码界面文案。在同一改动中，把每个新键加入 `lib/l10n/app_zh.arb`（模板，需要 `@description`）和所有其他 `.arb` 文件，再运行 `flutter gen-l10n`。不要让任何语言静默回退。如果你无法翻译某个语言，用英文文案，并在 PR 里注明，让母语者帮忙审阅。
- `app_zh_Hant.arb` 使用台湾、香港的用词，不要逐字转换简体中文（例如用「影片」不用「視頻」，用「設定」不用「設置」）。
- 德语和俄语文案可能比中文长两到三倍，按钮和菜单需要放得下，或能妥善截断。
- 日期、数字和时长用 `intl` 按当前语言区域格式化，不要拼接字符串。

## 官网

官网在 `landing/`（Astro + React）。使用 Node 24，进入该目录运行 `npm install` 和 `npm run dev`。CI 会运行 `npm test` 和 `npm run build`。文案在 `landing/src/i18n/zh.ts` 和 `en.ts`，请同步修改。

## 提交消息

提交消息和代码注释用英文写，遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

```
type(scope): summary
```

- 类型：`feat` `fix` `docs` `refactor` `perf` `test` `chore` `build` `ci`。
- 范围可省略，建议用模块名：`player`、`plugin`、`music`、`cache`、`net`、`ui`、`l10n`、`mcp`、`landing`。
- 摘要用祈使句，不超过 72 个字符，不加句号。例如：`fix(plugin): handle timeout when source is offline`。
- 原因不明显时，空一行再写正文。Issue 引用放在最后（`Fixes #123`）。
- 破坏性变更用 `!` 标记（`feat(plugin)!: ...`），并加上 `BREAKING CHANGE:` 页脚。

## 协议

YesPlayMusic 按 [GPL-3.0](LICENSE) 发布。提交 Pull Request 即表示你同意按相同协议发布你的贡献。
