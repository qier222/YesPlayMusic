# Plugin development guide

English | [简体中文](plugins.zh-CN.md)

YesPlayMusic ships with no online music service. Apart from local music, all music sources come from plugins. A plugin is a folder with a `plugin.json` manifest and a JavaScript module. The app runs plugins in its built-in QuickJS engine and shows the features provided by their exported functions.

The plugin protocol uses MyGo Music's field names, so existing MyGo plugins need few changes to port.

> Security: plugins can access declared websites and local app channels, read and write their own data directory, and start local programs if the user allows it. Only install plugins you trust. See [SECURITY.md](../SECURITY.md).

This guide follows `main`. Unreleased interfaces include `host.pid`, `host.ipc`, `host.files`, `testConnection`, scrobbling and playback-state callbacks, and the ReplayGain fields on `AudioStream`. When targeting 3.0.0, see the [3.0.0 plugin guide](https://github.com/qier222/YesPlayMusic/blob/v3.0.0/docs/plugins.md) (in Chinese).

## Contents

- [Quick start](#quick-start)
- [Plugin locations](#plugin-locations)
- [Installing plugins](#installing-plugins)
  - [Updating plugins](#updating-plugins)
- [plugin.json](#pluginjson)
- [Runtime](#runtime)
- [Host API](#host-api)
- [Exported functions](#exported-functions)
- [Data structures](#data-structures)
- [Errors](#errors)
- [Caching](#caching)
- [Limits](#limits)
- [Debugging](#debugging)

## Quick start

Create a folder named `hello` with these two files:

`plugin.json`

```json
{
  "id": "yourname.hello",
  "name": "Hello",
  "version": "0.1.0",
  "minAppVersion": "3.0.0",
  "main": "index.js",
  "permissions": { "network": ["example.com"] }
}
```

`index.js`

```js
const tracks = [
  {
    id: "1",
    name: "Hello World",
    artists: [{ id: "a1", name: "Example Artist" }],
    album: { id: "al1", name: "Example Album", imageUrl: "https://example.com/cover.jpg" },
    duration: 180000,
  },
];

export async function search({ query }) {
  return { tracks: tracks.filter((t) => t.name.toLowerCase().includes(query.toLowerCase())) };
}

export async function stream({ id }) {
  return { url: `https://example.com/audio/${id}.mp3`, type: "mp3" };
}
```

Put the folder in the plugin directory (see the next section; Settings → Plugins → Open Plugin Folder opens it for you). Click Reload, then select the plugin under Settings → Plugins → Music Source or use the avatar at the bottom of the sidebar. You can now find the sample song in Search and play it.

## Plugin locations

| System | Plugin directory | Plugin data |
| --- | --- | --- |
| macOS | `~/Library/Application Support/YesPlayMusic/plugins/<id>/` | `~/Library/Application Support/YesPlayMusic/plugin-data/<id>/` |
| Windows | `%APPDATA%\YesPlayMusic\plugins\<id>\` | `%APPDATA%\YesPlayMusic\plugin-data\<id>\` |
| Linux | `$XDG_DATA_HOME/YesPlayMusic/plugins/<id>/` (defaults to `~/.local/share/...`) | `$XDG_DATA_HOME/YesPlayMusic/plugin-data/<id>/` |

You can symlink the plugin folder into place during development. Folders whose names start with `.` are ignored.

## Installing plugins

Under Settings → Plugins → Install Plugin, paste any of these links:

| Link | What gets installed |
| --- | --- |
| `github.com/owner/repo` or `owner/repo` | The latest release's `.zip` asset; if there isn't one, the release source archive; if there is no release, the default branch |
| `github.com/owner/repo/releases/tag/v1.2.0` | That release |
| `github.com/owner/repo/tree/branch/subdir` | That folder at the given branch, tag or commit |
| `github.com/owner/repo/blob/branch/.../plugin.json` | The folder containing that manifest |
| Link ending in `.zip` | The archive is downloaded and unpacked; the shallowest `plugin.json` is used |
| Link ending in `plugin.json` | The manifest, the module named by `main`, and the files it imports using relative paths |

You can also choose Install from Local Folder and select a folder containing `plugin.json`. The app copies it into the plugin directory without following symlinks inside it.

Before installation, the app lists the plugin's requested permissions and capabilities. It reads capabilities from `export` statements without running any plugin code before confirmation. If `minAppVersion` is higher than the current app version, installation is blocked. If an installed plugin has the same ID and origin (the same GitHub repository or link), the button changes to Update. The new version replaces the old one but keeps settings and login state. If the ID matches but the origin differs or is unknown (for example, a manually copied plugin), the dialog warns you and offers Replace. Replacing clears settings, login state and granted permissions, treating it as a fresh install.

### Updating plugins

Plugins installed from a GitHub repository or release link, or with a GitHub repository in their manifest's `repository` field, can check for updates. The app compares the latest release tag (without its leading `v`) with the installed manifest's `version`. For link installs, the recorded origin takes precedence. Without a recorded origin, as with local or manually copied plugins, the app uses `repository`. Installs from a specific branch (`/tree/...` or `/blob/...`), direct `.zip` or `plugin.json` links, and local plugins without a `repository` don't support update checks. Reinstall these to update them.

- The first time you open the Plugins page after launch, the app checks all eligible plugins if it hasn't already checked in the background. Plugins with an update show Update on their card. Clicking it opens the install dialog; confirming keeps settings and login state.
- Choose Check for Updates from a plugin card's ⋯ menu to check that plugin immediately.
- You can turn on Update Automatically under Updates in the plugin settings dialog (off by default). About 10 seconds after launch and every six hours thereafter, the app checks and installs eligible updates in the background. Manual confirmation is still required if a new version adds network, program or local app permissions, requires a newer app (`minAppVersion`), changes its ID, or if a song from that plugin is playing.

To publish a new version, update `version` in `plugin.json` and create a GitHub release with a matching tag (`v1.2.0` or `1.2.0`).

Disable a plugin from the card's ⋯ menu. Disabled plugins don't run, but retain their settings and data. Click Enable on the card to bring one back. Only plugins that provide a library or search show up in Music Source. Uninstalling deletes the plugin directory and its data.

The plugin data directory contains:

- `storage.json`: data saved through `host.storage`.
- `settings.json`: values the user entered in the plugin settings dialog.
- `files/`: files written through `host.files`.

## plugin.json

```json
{
  "id": "example.example",
  "name": "Example",
  "version": "1.0.0",
  "description": "An example plugin.",
  "author": "Example",
  "icon": "icon.png",
  "minAppVersion": "3.0.0",
  "main": "index.js",
  "playback": "stream",
  "permissions": {
    "network": ["api.example.com", "*.example-cdn.net", "{setting:server}"],
    "process": ["yt-dlp"]
  },
  "settings": [
    { "key": "server", "label": "Server address", "help": "e.g. http://127.0.0.1:4533" },
    { "key": "token", "label": "Token", "type": "password", "link": "https://example.com/token" },
    { "key": "hq", "label": "High quality", "type": "boolean" },
    {
      "key": "quality",
      "label": "Quality",
      "type": "select",
      "options": [
        { "value": "", "label": "Follow player" },
        { "value": "lossless", "label": "Lossless" }
      ]
    }
  ],
  "navigation": [{ "builtin": "home" }, { "builtin": "liked" }, { "title": "Charts", "page": "charts" }]
}
```

| Field | Required | Description |
| --- | --- | --- |
| `id` | Yes | Lowercase letters, digits, and `. _ -`, up to 64 characters. `local` is reserved. Use `<author>.<name>` (e.g. `alice.radio`) to avoid collisions. Don't change it after release: settings, login state and granted permissions are stored by ID. |
| `name` | Yes | Name shown to users. |
| `version` | | Plugin version. Update checks compare it with the latest release tag; see [Updating plugins](#updating-plugins). |
| `description` | | A short description shown on the card and in the install dialog. |
| `author` | | Author, as a string or `{ "name": "..." }`. |
| `repository` | | Optional GitHub repository as a string or `{ "url": "..." }`, e.g. `https://github.com/owner/repo`. Used for update checks and auto-updates when the app has no recorded install origin (local or manual installs). |
| `icon` | | Icon from the plugin folder: `.png`, `.jpg` or `.webp` (not SVG), preferably 256 × 256. Shown on the plugin card and sidebar avatar; falls back to the first letter of the name. |
| `minAppVersion` | | Minimum app version, e.g. `3.0.0`. On an older app the plugin won't load, and Settings shows why. |
| `main` | | Entry module: a `.js` or `.mjs` file in the plugin folder. Defaults to `index.js`. |
| `playback` | | `stream` (default): the app plays the URL returned by `stream`. `remote`: playback elsewhere, with the app acting as a remote (reserved). |
| `permissions.network` | | Hosts `fetch` can access; see below. Without it, no network access is allowed. |
| `permissions.process` | | Programs `host.spawn` can start; see [host.spawn](#hostspawncommand-args). `true` is equivalent to `["*"]`. |
| `permissions.ipc` | | Local channels `host.ipc` can connect to; see [host.ipc](#hostipcconnectname). |
| `settings` | | Fields shown when Settings is opened from the plugin card. Values are always strings (`"true"` / `""` for `boolean`). Types are `text` (default), `password`, `boolean`, and `select`. `help` is explanatory text and `link` is a link for getting the value. |
| `navigation` | | Sidebar entries: `{ "builtin": "home" \| "liked" \| "savedAlbums" \| "stations" \| "shows" }`, or `{ "title", "page", "icon" }` to open the plugin's `browse(page)`. |

Patterns for `permissions.network`:

| Pattern | Matches |
| --- | --- |
| `api.example.com` | Only that host |
| `*.example.com` | Subdomains only (not `example.com` itself) |
| `{setting:server}` | The host of the address entered in the `server` setting, useful for self-hosted servers |
| `*` | Any host (avoid when possible) |

Redirects to hosts outside the list fail.

## Runtime

- The [QuickJS-ng](https://github.com/quickjs-ng/quickjs) runtime supports ES2023 and ES modules. The entry module can import files in the plugin directory, not files outside it.
- There is no Node.js, DOM, or `std` / `os` module. Plugins cannot read or write files or start processes directly.
- Each plugin runs on its own thread so a stalled or crashed plugin doesn't take down the app.

Available globals:

| Name | Description |
| --- | --- |
| `fetch`, `Headers`, `Response` | Mostly browser-compatible. `Response` supports `text()`, `json()`, `bytes()` and `arrayBuffer()`, but not `clone()` or streaming reads. `headers.getSetCookie()` returns every `Set-Cookie`. Requests use the system proxy. On a redirect to a different origin (scheme, host or port), `Authorization`, `Cookie` and `Proxy-Authorization` are not forwarded. |
| `URL`, `URLSearchParams` | |
| `TextEncoder`, `TextDecoder` | UTF-8 only. |
| `AbortController`, `AbortSignal` | Includes `AbortSignal.timeout(ms)`. Can be passed to `fetch`. |
| `setTimeout`, `setInterval`, `clearTimeout`, `clearInterval` | |
| `console.log/info/warn/error/debug` | See [Debugging](#debugging). |
| `atob`, `btoa` | |
| `host` | App-provided capabilities; see below. |

## Host API

| Name | Description |
| --- | --- |
| `host.platform` | `darwin`, `windows` or `linux`. |
| `host.arch` | `arm64`, `amd64`, etc. |
| `host.dir` | Absolute plugin directory path. |
| `host.dataDir` | Absolute plugin data directory path. |
| `host.pid` | The app's process ID. |
| `host.storage.get(key)` / `.set(key, value)` / `.remove(key)` | Synchronous key-value store for JSON values, saved in `storage.json` (8 MB total). Useful for login state and cached data. |
| `host.files.write(name, data)` | Writes `data` (a UTF-8 string, `Uint8Array` or `ArrayBuffer`) to `files/<name>` under the plugin data directory, returning a `file://` URL for use as an `imageUrl` or `AudioStream.url`. Use a relative `name`; subdirectories are allowed (e.g. `covers/1.jpg`), but not `..`, `:`, empty segments or a leading `/`. Maximum 32 MB per file. Useful for cover art and data too large for `storage`. |
| `host.files.read(name)` / `.readText(name)` | Reads `files/<name>` as a `Uint8Array` or string, or returns `null` if missing. |
| `host.files.url(name)` | Returns the file's `file://` URL if it exists, otherwise `null`. |
| `host.files.remove(name)` | Deletes the file. Doesn't error if it is missing. |
| `host.setting(key)` | Reads the user's setting (a string, or `""` if unset). Changes take effect without reloading the plugin. |
| `host.language()` | UI language, e.g. `zh-CN`, `zh-TW`, `en` or `ja`. |
| `host.t(text)` | Translates using `locales/<language>.json` with locale fallbacks (e.g. `zh-CN` → `zh`, `zh-TW` → `zh-Hant`, `en` → `en-US`). Returns the original if untranslated. The same table translates `name`, `description`, `settings` (`label`, `help`, `options[].label`) and `navigation[].title` in `plugin.json`. |
| `host.openURL(url)` | Opens an HTTP(S) URL in the system browser. |
| `host.crypto.md5(text)` | Returns a hexadecimal string. |
| `host.crypto.aesEcbEncrypt(key, text)` | AES-128-ECB + PKCS7, returning a hexadecimal string. |
| `host.signInPrompt({ qr, text })` | Shows a QR code (encoding `qr`) and a message in the app's sign-in dialog. Call repeatedly from `signIn` to update the status (e.g. “Code scanned. Confirm on your phone”). |
| `host.webSignIn({ url, cookiesOf, until, userAgent })` | Opens the service's sign-in page in a separate browser window. Once all cookies in `until` are present, it closes the window and returns `{ cookie }` (the `Cookie` header for requests to `cookiesOf`). `cookiesOf` must be allowed by `permissions.network`. The window uses separate, non-persistent storage. Throws if the user closes the window. Only macOS supports it; provide a QR-code or manual cookie option on other systems, where it throws. |
| `host.spawn(command, args)` | See below. |
| `host.ipc.connect(name)` | See below. |

### host.spawn(command, args)

Starts a local program, for example `yt-dlp` to get a playback URL. Both conditions must be met:

1. `command` is in `permissions.process`. Entries may be program names (looked up in PATH and common directories such as Homebrew's) or paths (containing `/`, absolute or relative to the plugin directory). `*` can match within one directory level.
2. The user has selected Allow Running Local Programs in that plugin's menu under Settings → Plugins (off by default).

Returns a process object:

| Member | Description |
| --- | --- |
| `pid` | Process ID. |
| `write(text)` / `closeStdin()` | Write to standard input. |
| `readLine()` | Read a line of stdout as a Promise; returns `null` at EOF. |
| `wait()` | Wait for exit and return the exit code as a Promise. |
| `errorOutput()` | Standard error output collected so far. |
| `kill()` | Stop the process. |

Child processes inherit the system proxy (`HTTPS_PROXY`, etc.). When the plugin stops, so do its child processes. At most 16 can run at once.

### host.ipc.connect(name)

Connect to a local channel opened by another app, such as Discord's `discord-ipc-0`. On macOS and Linux, this is a Unix socket. The app looks for `name` in `$XDG_RUNTIME_DIR`, `$TMPDIR`, `$TMP`, `$TEMP` and `/tmp`, in that order. On Windows it is a named pipe at `\\.\pipe\name`.

`name` must be allowed by `permissions.ipc`. Entries can use `*` within one directory level, e.g. `"discord-ipc-*"` or `"snap.discord/discord-ipc-*"` (Windows doesn't have subdirectories). The list is shown during installation.

Returns a Promise for a connection:

| Member | Description |
| --- | --- |
| `write(bytes)` | Writes a `Uint8Array` or `ArrayBuffer`, returning a Promise. |
| `read()` | Reads the next chunk as a Promise for a `Uint8Array`, or `null` when the other end closes. Chunk boundaries are up to the OS; reassemble frames yourself. |
| `close()` | Closes the connection. |

Reads and writes complete in order, one at a time. Windows pipes can't write during a pending read, so only `read()` when you expect a reply. Each plugin can have at most four open connections; they all close when it stops.

## Exported functions

Use ES module `export` to expose functions by operation name. The app only calls exported functions and doesn't show features that aren't provided. Each function takes an argument object (`{}` if there are no parameters), can be `async`, and returns a JSON-serializable value.

### Account

| Function | Parameters | Returns | Description |
| --- | --- | --- | --- |
| `account` | | `Account \| null` | Current account, or `null` if not signed in. Called at app startup and when the plugin loads. |
| `signIn` | | `Account \| null` | Sign in. Can take up to 10 minutes for the user to scan a QR code or use the web sign-in window. |
| `signOut` | | | Sign out and clear saved login state. |
| `testConnection` | `{ settings }` | `string` or `{ message }` | The Test Connection button in the plugin settings dialog. Use the unsaved `settings` from the dialog (string keys and values), not `host.setting()`. On success return a message, or leave it empty for “Connection successful”; throw on failure. The `{setting:key}` permissions also allow the addresses in `settings` during this call. |
| `profile` | | `Profile` | Profile for the signed-in account, opened through the avatar at the bottom of the sidebar. |

### Discovery

| Function | Parameters | Returns | Description |
| --- | --- | --- | --- |
| `home` | | `Browse` | Home. If omitted, the sidebar has no Home entry. |
| `browse` | `{ page }` | `Browse` | Explore (empty `page`) and other plugin pages (`page` is the string supplied in a `Link`, `Choice` or `navigation`). If omitted, the sidebar has no Explore entry. |
| `search` | `{ query, kind, offset }` | `SearchResult` | `kind`: `tracks`, `albums`, `artists`, `playlists` or `shows`. `offset` is the number already fetched. Return `more: true` if another page is available. |
| `suggest` | `{ query }` | `string[]` | Search suggestions. |
| `hotSearches` | | `(string \| { word, hint })[]` | Popular searches shown when the search box is empty. |

### Library

| Function | Parameters | Returns | Description |
| --- | --- | --- | --- |
| `library` | `{ kind, offset }` | `SearchResult` | Full library for sources where the catalog is the user's library, such as a self-hosted server. `kind`: `tracks`, `albums`, `artists` or `playlists`; pagination matches `search`. The Library page uses this if provided; otherwise it uses `liked`, `savedAlbums` and `playlists`. |
| `liked` | `{ offset }` | `TrackPage` | Liked songs. |
| `isLiked` | `{ ids }` | `{ [id]: boolean }` or a `boolean[]` in the same order as `ids` | |
| `like` | `{ id, on }` | | Like or unlike a track. |
| `savedAlbums` | `{ offset }` | `Album[]` or `{ albums, more }` | Saved albums. |
| `saveAlbum` | `{ id, on }` | | |
| `followArtist` | `{ id, on }` | | |
| `recent` | | `Track[]` | Recently played tracks. |
| `played` | `{ id }` | | A track from this source has been listened to long enough (see [Scrobbling](#scrobbling)). Use it to record plays on the source's service. Only the source that owns the track receives it. Errors are ignored. |

### Albums, artists and playlists

| Function | Parameters | Returns |
| --- | --- | --- |
| `album` | `{ id }` | `{ album: Album, tracks: Track[] }` |
| `artist` | `{ id }` | `{ artist: Artist, tracks: Track[], albums: Album[], related: Artist[] }` |
| `playlists` | | `Playlist[]` (created and saved playlists) |
| `playlist` | `{ id }` | `Playlist` (with `tracks`) |
| `savePlaylist` | `{ id, on }` | |
| `createPlaylist` | `{ name }` | `Playlist` |
| `renamePlaylist` | `{ id, name }` | |
| `deletePlaylist` | `{ id }` | |
| `addToPlaylist` | `{ id, trackIds }` | |
| `removeFromPlaylist` | `{ id, trackIds }` | |
| `movePlaylistTrack` | `{ id, from, to }` | |

### Playback

| Function | Parameters | Returns | Description |
| --- | --- | --- | --- |
| `stream` | `{ id, quality }` | `AudioStream` | Playback URL. `quality` is one of `standard`, `high` or `lossless`; return the closest match you have. Times out after 60 seconds. |
| `lyrics` | `{ id }` | `Lyrics` | |
| `similar` | `{ id }` | `Track[]` | Similar Songs on the Now Playing page. |
| `station` | `{ id, seed }` | `TrackPage` | The next batch of station tracks. `id` comes from `Mode.station` or `menuAction`; `seed` is the track to continue from and can be empty. |
| `dislike` | `{ id, station }` | | Dislike a track to see it less often in recommendations. |

### Comments

| Function | Parameters | Returns |
| --- | --- | --- |
| `comments` | `{ id, sort, offset }` | `CommentPage`. `sort` is `hot` or `new`. |
| `postComment` | `{ id, text, replyTo }` | The posted `Comment`, or `null` if not available. |
| `likeComment` | `{ id, commentId, on }` | |

### Track context menu

| Function | Parameters | Returns | Description |
| --- | --- | --- | --- |
| `trackMenu` | `{ track, playlist }` | `MenuEntry[]` or `{ items: MenuEntry[], hide: string[] }` | Add context menu entries for a track or hide built-in ones. The menu waits up to 2 seconds, so use the track data and don't make network requests. `hide` can contain `play`, `next`, `queue`, `like`, `addToPlaylist`, `album`, `artist`, `similar`, `dislike` or `remove`. |
| `menuAction` | `{ id, track, playlist }` | `MenuResult` | The user selected an entry you added. |

<a name="听歌上报"></a>

### Scrobbling

| Function | Parameters | Returns | Description |
| --- | --- | --- | --- |
| `nowPlaying` | `{ track }` | | A track started playing. |
| `scrobble` | `{ track, startedAt, played }` | | A track has been heard long enough to record a listen. `startedAt` is the playback start time (ISO 8601 in UTC); `played` is the actual listening time in milliseconds. |
| `playback` | `{ track, playing, position }` | | Playback state changed: new track, play/pause, seek or stop. `track` is `null` if nothing is playing, and `position` is the current position in milliseconds. Only the last of a burst of changes is sent. Useful for displaying what is playing in an app like Discord. |

Unlike other functions, these three are called **regardless of the track's source**, including local tracks and tracks from other plugins. Any enabled plugin that exports them receives them. Scrobbling-only plugins don't need to provide music and won't appear in Music Source. `track.source` is the source that owns the track (`local` for local music).

The app follows Last.fm's listening rules: tracks under 30 seconds don't count. A listen is recorded once half the track or four minutes have actually played, whichever comes first. Time skipped by seeking doesn't count. At most one scrobble is made per play.

Errors are ignored and aren't shown to the user. If you want to queue listens during network failures and retry later, use `host.storage`.

Here is a minimal plugin for [ListenBrainz](https://listenbrainz.org). The official [ListenBrainz plugin](https://github.com/qier222/ypm-plugin-listenbrainz) also supports self-hosted servers and retries after network failures. Enter your [User token](https://listenbrainz.org/settings/) in the plugin settings.

`plugin.json`

```json
{
  "id": "yourname.listenbrainz",
  "name": "ListenBrainz",
  "version": "1.0.0",
  "permissions": { "network": ["api.listenbrainz.org"] },
  "settings": [
    { "key": "token", "label": "User token", "type": "password", "link": "https://listenbrainz.org/settings/" }
  ]
}
```

`index.js`

```js
async function submit(type, track, listenedAt) {
  const token = host.setting("token");
  if (!token) return;
  const listen = {
    track_metadata: {
      artist_name: (track.artists ?? []).map((a) => a.name).join(", "),
      track_name: track.name,
      release_name: track.album?.name || undefined,
      additional_info: {
        duration_ms: track.duration || undefined,
        submission_client: "YesPlayMusic",
      },
    },
  };
  if (listenedAt) listen.listened_at = listenedAt;
  const r = await fetch("https://api.listenbrainz.org/1/submit-listens", {
    method: "POST",
    headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ listen_type: type, payload: [listen] }),
  });
  if (!r.ok) throw new Error(`ListenBrainz ${r.status}: ${await r.text()}`);
}

export const nowPlaying = ({ track }) => submit("playing_now", track);
export const scrobble = ({ track, startedAt }) =>
  submit("single", track, Math.floor(Date.parse(startedAt) / 1000));
```

For Last.fm: starting December 1, 2026, the API key holder needs Last.fm Pro. The **plugin author** pays if they own the key; users don't need their own Pro subscription in that case. Use `host.crypto.md5` to calculate the `api_sig` signature. The official [Last.fm plugin](https://github.com/qier222/ypm-plugin-lastfm) is an example that asks users to supply their own API key.

## Data structures

All fields can be omitted; the app uses empty values. Durations are in milliseconds, and dates are ISO 8601 strings. IDs only need to be unique within your plugin.

```ts
type Artist = { id: string; name: string; imageUrl?: string; following?: boolean };

type Album = {
  id: string; name: string; imageUrl?: string; artists?: Artist[];
  released?: string;          // "2024-03-01" or "2024"
  kind?: "album" | "single" | "ep" | "compilation";
  trackCount?: number; saved?: boolean;
  added?: string;             // When added to the library
  copyright?: string;         // Copyright line, shown as-is at the bottom of the album page, e.g. "℗ 2024 XX Records"
};

type Track = {
  id: string; name: string; artists?: Artist[]; album?: Album;
  duration?: number;          // Milliseconds
  url?: string;               // Track URL on the service, for sharing
  unavailable?: boolean;      // Unavailable (rights, subscription, etc.): grayed out and cannot be double-clicked to play
  added?: string;
};

type Playlist = {
  id: string; name: string; imageUrl?: string; description?: string;
  owner?: string; subtitle?: string; trackCount?: number; plays?: number;
  mine?: boolean;             // Created by the user
  saved?: boolean;            // Saved from another user
  fixed?: boolean;            // Owned but not editable (e.g. Liked Songs)
  tracks?: Track[];
};

type Account = { id: string; name: string; imageUrl?: string };

type SearchResult = {
  tracks?: Track[]; albums?: Album[]; artists?: Artist[]; playlists?: Playlist[];
  more?: boolean; total?: number;
};

type TrackPage = { tracks: Track[]; more?: boolean };

type AudioStream = {
  url: string;                // http(s)://, or a file:// in the plugin directory or its data directory
  type?: string;              // mp3, flac, m4a, etc.
  quality?: string; bitRate?: number; size?: number;
  headers?: Record<string, string>;  // Headers the player sends when requesting audio
  // ReplayGain fields for Volume Normalization. Gain is in dB; peak is linear (1 = 0 dBFS).
  // File tags take priority; these fields are useful when server transcoding strips tags.
  // Leave these out if unknown; the app makes no adjustment. See OpenSubsonic track replayGain for an example.
  gain?: number; peak?: number;           // Track
  albumGain?: number; albumPeak?: number; // Album
};

type Lyrics = {
  lrc?: string;               // LRC text
  translation?: string;       // Translated LRC text
  lines?: { start: number; end?: number; text?: string; translation?: string;
            words?: { start: number; end: number; text: string }[] }[];  // Takes precedence when present; can include word-level timing
};

type Browse = {
  title?: string; subtitle?: string; imageUrl?: string; description?: string;
  sections: Section[];
  tabs?: Choice[];            // Top tabs; clicking one calls browse with its page
  filters?: Choice[][];       // Rows of labels under the tabs
};

type Choice = { title: string; page?: string; selected?: boolean;
                groups?: { title: string; options: Choice[] }[]; images?: string[] };

type Section = {
  title?: string; subtitle?: string;
  style?: "modes" | "shelf" | "songs" | "charts" | "grid";
  tracks?: Track[]; albums?: Album[]; artists?: Artist[]; playlists?: Playlist[];
  modes?: Mode[];
  links?: { title: string; page: string; subtitle?: string; imageUrl?: string }[];
  morePage?: string;          // The browse page opened by View All
  empty?: string;             // Message when there is no content
};

type Mode = {                 // Special-mode cards at the top of Home (daily recommendations, personal radio, etc.)
  title: string; subtitle?: string; note?: string; imageUrl?: string;
  tracks?: Track[];           // A set of tracks
  playlist?: string;          // Or a playlist ID
  station?: string;           // Or a station ID, passed to station() to fetch tracks in batches
};

type Profile = {
  name: string; imageUrl?: string; signature?: string;
  badges?: string[];                          // Labels next to the name, e.g. "Lv.9"
  facts?: { label: string; value: string }[]; // Example: { label: "Following", value: "32" }
  stats?: { label: string; value: number; unit?: string;
            link?: "songs" | "albums" | "playlists" | "artists" }[];  // Up to three stats cards
  topArtists?: { artist: Artist; plays: number }[];
  topTracks?: { title?: string; tracks: (Track & { plays?: number })[] };
  playlists?: Playlist[];                     // Playlists created by this user
};

type Comment = { id: string; text: string; user?: { id?: string; name?: string; imageUrl?: string };
                 time?: number; likes?: number; liked?: boolean;
                 replyTo?: { id?: string; user?: { name: string }; text: string } };
type CommentPage = { comments: Comment[]; total?: number; more?: boolean };

type MenuEntry = { id: string; title: string; icon?: string; danger?: boolean };
type MenuResult = {
  toast?: string;                             // Show a message
  copy?: string;                              // Copy to the clipboard
  open?: { kind: "album" | "artist" | "playlist"; id: string };
  tracks?: Track[]; name?: string;            // Play these tracks
  station?: { id: string; seed?: string };    // Play this station
};
```

`Section.style` controls the Home layout:

| Style | Display |
| --- | --- |
| `modes` | Special-mode cards: the first two are large cards, the rest are small rows. |
| `shelf` | Cards for playlists, albums and songs; artists use round avatars. Overflow uses two rows with horizontal scrolling. |
| `songs` | Paged song grids (3 columns × 4 rows). |
| `charts` | Chart cards; the playlist's `tracks` are the top entries. |
| `grid` | Rows of cards that fill the width and extend down the page. |
| Omitted | Standard lists and cards. |

## Errors

Throw an object or `Error` with a `code`. The app handles errors according to that code and shows `message` to the user:

```js
const e = new Error("Please sign in first");
e.code = "signIn";
throw e;
```

| Code | Meaning | App behavior |
| --- | --- | --- |
| `signIn` | Sign-in required | Prompt to sign in |
| `setup` | A required setting is missing (server address, token, etc.) | Prompt to open Settings |
| `unavailable` | The track cannot play | Notify the user and skip it |
| `unsupported` | The operation is not supported | Treat it as an unavailable feature |
| Other or omitted | Other errors | Show `message` and allow retry |

## Caching

The app caches plugin data and can show it on the next visit while refetching in the background. Home data stays fresh for 5 minutes, albums for 1 day, artists for 1 hour, playlists for 10 minutes, lyrics for much longer, and searches for 5 minutes (memory only). Liked songs, the user's own playlists, the library and profiles are refetched each time they open. Accounts have separate caches. Plugins don't need their own page-level caches.

## Limits

| Item | Limit |
| --- | --- |
| Function call | 30 seconds (`stream`: 60 seconds; `signIn`: 10 minutes) |
| Loading the entry module | Has a timeout; don't make top-level network requests |
| Memory | 128 MB |
| Connection timeout | 15 seconds; the response is closed if no data arrives for 60 seconds |
| Redirects | At most 10 |
| Response body | 32 MB |
| Simultaneous timers | 1,000 |
| Simultaneous child processes | 16 |

Plugins stuck in an infinite loop are stopped. The reason is shown in Settings.

## Debugging

- The app prints `console.*` output to stdout with the plugin ID. Launch the app from a terminal to see it:
  - macOS: `/Applications/YesPlayMusic.app/Contents/MacOS/YesPlayMusic`
  - Windows: run `YesPlayMusic.exe` in PowerShell
  - Linux: run `yesplaymusic` in a terminal
- After changing plugin code, click Reload in Settings → Plugins.
- Load failures (invalid `plugin.json`, syntax errors in the entry module, an unmet `minAppVersion`, etc.) are shown on the plugin card in Settings.
