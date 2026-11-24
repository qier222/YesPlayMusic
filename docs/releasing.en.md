# Releasing

[简体中文](releasing.md) · English

## Publish a new version

`scripts/release/prepare.py` can help with the first two steps: `notes` drafts a changelog from commits since the last tag, `bump <version>` updates both version fields and moves `[Unreleased]` to the new version, and `check` verifies the versions, changelog and tag before tagging. It only changes local files.

1. Update `version` in `pubspec.yaml` and `appVersion` in `lib/version.dart` (`flutter test` checks that they match).
2. Move the contents of `[Unreleased]` in `CHANGELOG.md` under the new version.
3. Commit, tag and push:

   ```sh
   git tag v3.0.1
   git push origin main v3.0.1
   ```

4. The GitHub Actions Release workflow builds packages for macOS (Apple Silicon arm64 and Intel x64), Windows (x64) and Linux (x64 and arm64), then creates a **draft** release. Download and install the packages to check them, then click **Publish release**. Once published and marked latest, apps built with Sparkle or WinSparkle get updates from `releases/latest/download/appcast-*.xml`; other builds show new versions in Settings → About. Apple Silicon keeps `appcast-macos.xml`; Intel uses `appcast-macos-x64.xml`. Each feed points to the ZIP for its architecture.

   The website's download page reads the assets from GitHub's latest stable release. You don't need to redeploy the site for each release.

   The release's `latest.yml`, `latest-mac.yml` and `latest-linux.yml` are for the old 0.4.x Electron app. When it sees them it prompts users to download the new version from Releases, so don't delete them. The old code is on the `1.x` branch. If you publish a release from that branch, clear “Set as latest release” so the 3.x updater doesn't read the wrong release.

## Required secrets and variables

Add these under the repository's Settings → Secrets and variables → Actions. Without them, the workflow can still build packages, but won't sign or notarize them or enable native automatic updates.

### macOS signing and notarization

| Name | Type | Value |
| --- | --- | --- |
| `MACOS_CERTIFICATE_P12` | Secret | Export the “Developer ID Application” certificate and private key as a .p12, then run `base64 -i cert.p12 \| pbcopy` |
| `MACOS_CERTIFICATE_PASSWORD` | Secret | Password set when exporting the .p12 |
| `MACOS_SIGNING_IDENTITY` | Variable | Full certificate name, such as `Developer ID Application: Your Name (ABCDE12345)`. Find it with `security find-identity -v -p codesigning`. |
| `APPLE_API_KEY_P8` | Secret | Base64-encoded App Store Connect API key (.p8) |
| `APPLE_API_KEY_ID` | Secret | Key ID for that key |
| `APPLE_API_ISSUER_ID` | Secret | Issuer ID |

How to get them:

1. **Developer ID certificate**: in Xcode → Settings → Accounts → Manage Certificates, click + and choose “Developer ID Application” (requires the developer account's Account Holder or Admin role). Find the certificate in Keychain Access and export it with its private key as a .p12.
2. **App Store Connect API key**: go to [App Store Connect](https://appstoreconnect.apple.com/access/integrations/api) → Users and Access → Integrations → App Store Connect API, create a key with the Developer role, and download the .p8 (you can only download it once). Note the Key ID and the Issuer ID shown above the list.

### Automatic update signing keys

Update packages are signed with separate keys, unrelated to the Apple certificate. **If you lose the private key, installed apps can no longer receive updates.** Back it up.

| Name | Type | Value |
| --- | --- | --- |
| `SPARKLE_PUBLIC_KEY` | Variable | macOS (Sparkle) EdDSA public key |
| `SPARKLE_PRIVATE_KEY` | Secret | Matching private key |
| `WINDOWS_DSA_PUBLIC_KEY` | Variable | Windows (WinSparkle) DSA public key, full PEM |
| `WINDOWS_DSA_PRIVATE_KEY` | Secret | Matching private key, full PEM |

Generate the keys on a Mac, after running `flutter build macos` once so CocoaPods installs Sparkle:

```sh
# Sparkle: the private key is stored in the login keychain; -x exports it to a file
macos/Pods/Sparkle/bin/generate_keys            # prints the public key → SPARKLE_PUBLIC_KEY
macos/Pods/Sparkle/bin/generate_keys -x sparkle_private.key   # file contents → SPARKLE_PRIVATE_KEY

# WinSparkle: DSA keys
openssl dsaparam -genkey 2048 -out dsa_priv.pem  # file contents → WINDOWS_DSA_PRIVATE_KEY
openssl dsa -in dsa_priv.pem -pubout -out dsa_pub.pem  # file contents → WINDOWS_DSA_PUBLIC_KEY
```

Once configured, release builds use `--dart-define=YPM_SPARKLE=true`. Sparkle and WinSparkle check daily on macOS and Windows. Source builds and Linux builds show the newest GitHub version in Settings → About.

### Automatic website deployment (Cloudflare Workers)

When changes under `landing/` land on `main`, or when you run `.github/workflows/landing.yml` manually, the workflow builds and deploys the website to Cloudflare Workers. Without the following secrets, it builds the site but skips deployment.

| Name | Type | Value |
| --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | Secret | Cloudflare API token (use the “Edit Cloudflare Workers” template and scope it to the appropriate account and domain zone) |
| `CLOUDFLARE_ACCOUNT_ID` | Secret | Account ID shown on the right in Cloudflare Dashboard → Workers & Pages |

## Build packages locally

```sh
scripts/build-macos.sh arm64      # build/macos/packages/arm64/YesPlayMusic.app
scripts/build-macos.sh x64        # build/macos/packages/x64/YesPlayMusic.app
flutter build windows --release   # build\windows\x64\runner\Release\
flutter build linux --release     # build/linux/x64/release/bundle/ (build/linux/arm64/... on arm64 machines)
```

Linux builds require: `clang cmake ninja-build pkg-config libgtk-3-dev liblzma-dev libmpv-dev`. On Linux arm64, install Flutter from its Git tag as in [CI](../.github/workflows/ci.yml).

The macOS architectures are built separately, not as a universal package. The script forwards Flutter build arguments, for example `scripts/build-macos.sh x64 --build-name 3.0.1 --build-number 30001`. It checks that the executable contains only the requested architecture and that the bundled native libraries support it before copying the app to a separate directory. Running `flutter build macos --release` directly defaults to the current Mac's architecture.

The release workflow produces `-macos.dmg` / `-macos.zip` for Apple Silicon and `-macos-x64.dmg` / `-macos-x64.zip` for Intel. Each uses its own update feed (`appcast-macos.xml` or `appcast-macos-x64.xml`), so neither downloads the other architecture's package. CI verifies each build on a runner with the matching architecture.
