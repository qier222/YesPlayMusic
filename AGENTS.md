# AGENTS.md

- Verify: `flutter analyze` and `flutter test` (both must pass). Format touched files with `dart format <files>` (not every file in the repo is formatted, so don't format the whole tree).
- Build: `flutter build macos|windows|linux --release`. Linux needs `clang cmake ninja-build pkg-config libgtk-3-dev liblzma-dev libmpv-dev`.
- Version lives in both `pubspec.yaml` and `lib/version.dart` (`test/version_test.dart` checks they match).
- The app has no built-in online source: everything online comes from plugins (`docs/plugins.md`). New source ops go in `lib/music/source.dart` (`Op` + `Source`), `lib/plugin/plugin_source.dart` (`_known` + override), models in `lib/music/models.dart`, cached requests in `lib/cache/requests.dart`, and the docs.
- Release process and required secrets: `docs/releasing.md`. The project does not accept pull requests from forks.
- UI strings and code comments are in Chinese.
- Landing page lives in `landing/` (Astro + React, static). `cd landing && npm install && npm run dev` / `npm run build` (output `landing/dist`). Deploy with `npm run deploy` (Cloudflare Worker `yesplaymusic-landing`, static assets, custom domain yesplaymusic.0xtangerine.com; needs `wrangler login`). Copy is in `landing/src/i18n/{zh,en}.ts`; the version and download links come from `lib/version.dart` via `landing/src/lib/site.ts`.
