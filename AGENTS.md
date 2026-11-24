# AGENTS.md

简体中文 · [English](AGENTS.en.md)

- 验证：`flutter analyze` 和 `flutter test` 都必须通过。用 `dart format <files>` 格式化改动的 Dart 文件（仓库里有些文件尚未格式化，不要格式化整个项目）。
- 构建：使用 Flutter 3.50 或更新版本，运行 `flutter build macos|windows|linux --release`。Linux 需要 `clang cmake ninja-build pkg-config libgtk-3-dev liblzma-dev libmpv-dev`。Linux arm64 上按 `.github/workflows/ci.yml` 的做法从 Git 标签安装 Flutter。
- 版本号同时写在 `pubspec.yaml` 和 `lib/version.dart`（`test/version_test.dart` 会检查两处是否一致）。
- 应用不内置在线音乐源：所有在线音乐源都由插件提供（见[插件开发指南](docs/plugins.md)）。新增源操作时，更新 `lib/music/source.dart`（`Op` 和 `Source`）、`lib/plugin/plugin_source.dart`（`_known` 和对应的 override），以及 `lib/music/models.dart` 中的模型、`lib/cache/requests.dart` 中的缓存请求和文档。
- 发布流程和所需的 Secrets 见[发布流程](docs/releasing.md)。
- 保持提交历史线性，不创建合并提交。更新分支时用 `git rebase main`，不要用 `git merge main`；合入 `main` 时用 `git merge --ff-only <branch>`（失败则先变基）。拉取用 `git pull --rebase`。
- 提交消息和代码注释用英文写。
- 提交消息遵循 Conventional Commits：`type(scope): summary`，例如 `fix(plugin): handle timeout when source is offline`。类型：`feat` `fix` `docs` `refactor` `perf` `test` `chore` `build` `ci`。范围可省略；建议用模块名（`player`、`plugin`、`music`、`cache`、`net`、`ui`、`l10n`、`mcp`、`landing`）。摘要用祈使句，不超过 72 个字符，不加句号。原因不明显时，空一行写正文，Issue 引用放在最后（`Fixes #123`）。破坏性变更用 `!` 标记（`feat(plugin)!: ...`），并加上 `BREAKING CHANGE:` 页脚。
- 不要硬编码界面文案。在同一改动中，把每个键加入 `lib/l10n/app_zh.arb`（模板，需要 `@description`）和所有其他 `.arb` 文件，再运行 `flutter gen-l10n`。不要让任何语言静默回退。
- `app_zh_Hant.arb` 使用台湾、香港的用词，不要逐字转换简体中文（例如用「影片」不用「視頻」，用「設定」不用「設置」）。
- `landing/src/i18n/zh.ts` 与 `en.ts` 保持同步，改一份时也要改另一份。
- 布局不要按中文长度定死。德语和俄语文案可能长两到三倍，按钮和菜单需要放得下，或能妥善截断。
- 日期、数字和时长用 `intl` 按当前语言区域格式化，不要拼接字符串。
- 发布说明用中英文写；用报告者使用的语言回复 Issue。
- 官网在 `landing/`（Astro + React，静态站点）。使用 Node 24：运行 `cd landing && npm install && npm run dev`，用 `npm test` 测试，用 `npm run build` 构建（输出到 `landing/dist`）。页面在 `/zh/` 和 `/en/`；`/` 由 `landing/worker/index.js` 重定向（先看 `lang` Cookie，再看 `Accept-Language`，默认 en）。用 `npm run deploy` 部署（Cloudflare Worker `yesplaymusic-landing`，静态资源，自定义域名 yesplaymusic.0xtangerine.com；需要 `wrangler login`）。文案在 `landing/src/i18n/{zh,en}.ts`；下载链接由 `landing/src/lib/site.ts` 从 GitHub 最新正式版获取。
