# AGENTS.md

- Verify: `flutter analyze` and `flutter test` (both must pass). Format touched files with `dart format <files>` (not every file in the repo is formatted, so don't format the whole tree).
- Build: `flutter build macos|windows|linux --release`. Linux needs `clang cmake ninja-build pkg-config libgtk-3-dev liblzma-dev libmpv-dev`.
- Version lives in both `pubspec.yaml` and `lib/version.dart` (`test/version_test.dart` checks they match).
- The app has no built-in online source: everything online comes from plugins (`docs/plugins.md`). New source ops go in `lib/music/source.dart` (`Op` + `Source`), `lib/plugin/plugin_source.dart` (`_known` + override), models in `lib/music/models.dart`, cached requests in `lib/cache/requests.dart`, and the docs.
- Release process and required secrets: `docs/releasing.md`.
- Write commit messages and code comments in English.
- Commit messages follow Conventional Commits: `type(scope): summary`, e.g. `fix(plugin): handle timeout when source is offline`. Types: `feat` `fix` `docs` `refactor` `perf` `test` `chore` `build` `ci`. The scope is optional; prefer a module name (`player`, `plugin`, `music`, `cache`, `net`, `ui`, `l10n`, `mcp`, `landing`). Write the summary in the imperative mood, at most 72 characters, with no trailing period. Add a body after a blank line when the reason for the change isn't obvious, and put issue references last (`Fixes #123`). Mark breaking changes with `!` (`feat(plugin)!: ...`) plus a `BREAKING CHANGE:` footer.
- No hardcoded UI strings. Add each key to `lib/l10n/app_zh.arb` (the template, with an `@description`) and to every other `.arb` file in the same change, then run `flutter gen-l10n`. Never leave a locale to fall back silently.
- `app_zh_Hant.arb` uses Taiwan/Hong Kong wording, not a character-by-character conversion of Simplified Chinese (e.g. 影片 not 視頻, 設定 not 設置).
- Keep `landing/src/i18n/zh.ts` and `en.ts` in sync: changing copy in one means changing the other.
- Don't size layouts to Chinese text. German and Russian strings can be 2–3× longer, so buttons and menus must fit or truncate cleanly.
- Format dates, numbers and durations with `intl` for the current locale; don't build them by string concatenation.
- Release notes are bilingual (Chinese and English). Reply to issues in the language the reporter used.
- Landing page lives in `landing/` (Astro + React, static). `cd landing && npm install && npm run dev` / `npm run build` (output `landing/dist`). Pages live at `/zh/` and `/en/`; `/` is redirected by `landing/worker/index.js` (cookie `lang`, then `Accept-Language`, default en). Deploy with `npm run deploy` (Cloudflare Worker `yesplaymusic-landing`, static assets, custom domain yesplaymusic.0xtangerine.com; needs `wrangler login`). Copy is in `landing/src/i18n/{zh,en}.ts`; the version and download links come from `lib/version.dart` via `landing/src/lib/site.ts`.
