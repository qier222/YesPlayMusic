# Contributing to YesPlayMusic

[简体中文](CONTRIBUTING.md) · English

Thanks for helping out. Pull requests are welcome, from small fixes and translations to new features.

## Before you start

- **Bugs and small fixes**: open a pull request directly. If there's an issue for it, link it.
- **New features or larger changes**: open an [issue](https://github.com/qier222/YesPlayMusic/issues/new/choose) first so we can agree on the approach before you spend time on it.
- **Music sources**: the app has no built-in online source. Support for a new service belongs in a plugin in its own repository, not in this one. See [docs/plugins.en.md](docs/plugins.en.md). If a plugin needs something the host doesn't provide yet, open a "Plugin API" issue.
- **Security issues**: don't open a public issue or PR. Report them privately; see [SECURITY.en.md](SECURITY.en.md).

## Setting up

You need Flutter 3.50 or later. Platform requirements are listed under [Building from source](README.en.md#building-from-source).

```sh
git clone https://github.com/qier222/YesPlayMusic.git
cd YesPlayMusic
flutter pub get
flutter run -d macos   # or windows / linux
```

## Before opening a pull request

- `flutter analyze` and `flutter test` must both pass. CI runs them on every pull request, then builds for macOS arm64, macOS x64, Windows x64, Linux x64 and Linux arm64.
- Format the Dart files you changed with `dart format <files>`. Please don't reformat the whole tree; not every file is formatted yet, and unrelated changes make the diff hard to review.
- Keep each pull request focused on one change.
- Add or update tests when you change behavior.

## Text and translations

- Don't hardcode UI strings. Add each new key to `lib/l10n/app_zh.arb` (the template, with an `@description`) and to every other `.arb` file in the same change, then run `flutter gen-l10n`. Don't leave a locale to fall back silently. If you can't translate a language, use the English text and say so in the PR so a native speaker can review it.
- `app_zh_Hant.arb` uses Taiwan/Hong Kong wording, not a character-by-character conversion of Simplified Chinese (for example 影片, not 視頻; 設定, not 設置).
- German and Russian strings can be two to three times longer than Chinese ones. Make sure buttons and menus still fit or truncate cleanly.
- Format dates, numbers and durations with `intl` for the current locale instead of building them by string concatenation.

## Landing page

The website lives in `landing/` (Astro + React). Use Node 24 and run `npm install` and `npm run dev` there. CI runs `npm test` and `npm run build`. The copy is in `landing/src/i18n/zh.ts` and `en.ts`; change both together.

## Commit messages

Write commit messages and code comments in English, following [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): summary
```

- Types: `feat` `fix` `docs` `refactor` `perf` `test` `chore` `build` `ci`.
- The scope is optional. Prefer a module name: `player`, `plugin`, `music`, `cache`, `net`, `ui`, `l10n`, `mcp`, `landing`.
- Write the summary in the imperative mood, at most 72 characters, with no trailing period. For example: `fix(plugin): handle timeout when source is offline`.
- Add a body after a blank line when the reason for the change isn't obvious. Put issue references last (`Fixes #123`).
- Mark breaking changes with `!` (`feat(plugin)!: ...`) and a `BREAKING CHANGE:` footer.

## License

YesPlayMusic is licensed under [GPL-3.0](LICENSE). By submitting a pull request, you agree that your contribution is released under the same license.
