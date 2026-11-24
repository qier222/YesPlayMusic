# Security

[简体中文](SECURITY.md) · English

## Reporting a vulnerability

Please do not report security issues in public issues. Use **Security → Report a vulnerability** on this repository to send a private report with the affected version, steps to reproduce and impact. We'll reply as soon as we can.

Only the latest release receives security fixes.

## Plugin trust model

YesPlayMusic comes with no online music service. Separately installed plugins provide online music sources. **Installing a plugin runs someone else's code on your computer**, so only install plugins you trust.

The app limits what plugins can do:

| Capability | Restrictions |
| --- | --- |
| Runtime | Each plugin runs in its own thread in the built-in QuickJS engine. There is no Node.js or QuickJS `std` / `os` module, and plugins can't access files or start processes directly. Memory is limited to 128 MB, calls time out, and infinite loops are stopped. |
| Code | A plugin can only load modules inside its own directory. It can't `import` files outside it, even through symlinks. |
| Network | A plugin can only access hosts listed in `permissions.network` in `plugin.json`; redirects outside the list are blocked. Requests use the system proxy. |
| Storage | A plugin can access its own `storage.json` through `host.storage`, read its own settings through `host.setting`, and read or write its own data directory's `files/` through `host.files`. |
| Playback URLs | Only HTTP(S) URLs and files in the plugin's own directory or data directory are allowed. |
| Local programs | A plugin can start only programs listed in `permissions.process`, and the user must separately turn on “Allow running local programs” for that plugin in Settings (off by default). Programs run with your account's permissions. **Enabling this effectively gives the plugin the same permissions as you.** |
| Local app channels | `host.ipc` can only connect to channels listed in `permissions.ipc`. The app lists these permissions at installation. |
| Web sign-in | `host.webSignIn` opens a separate browser window that doesn't persist data to disk. It only gives the plugin cookies for hosts allowed by `permissions.network`. |

Keep in mind:

- A plugin with `*` in `permissions.network` can access any website, including services on your local network.
- A plugin's login state (cookies and tokens) and passwords entered in its settings are stored in plain text in its data directory's `storage.json` and `settings.json`. Like other local app data, they rely on the operating system's isolation between users.
- Being installable does not mean a plugin passed a security review. Automatic updates are off by default and can be enabled per plugin. New versions that ask for more permissions still require confirmation. See [Updating plugins](docs/plugins.en.md#updating-plugins).

## The app

- When signing and notarization credentials are configured, macOS release packages are signed with Developer ID and notarized by Apple. The app doesn't use App Sandbox so it can read music folders you select and let plugins access their websites.
- Automatic updates only download from this repository's GitHub Releases. Sparkle on macOS verifies EdDSA signatures; WinSparkle on Windows verifies DSA signatures.
- Release builds send usage statistics to Google Analytics, including device and UI settings, plugin IDs and versions, page categories, playback sources and MCP tool usage. They don't include songs, accounts, search terms or file paths. The app uses a randomly generated local ID. You can turn this off in Settings → About; that toggle doesn't affect Google Analytics on the website.
