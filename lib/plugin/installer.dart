// Installing plugins from links.
//
// Supported links:
//   - GitHub repo: github.com/owner/repo (or owner/repo). With a release, installs the latest
//     Release (preferring a .zip asset in the Release, otherwise the source archive); without one, the default branch.
//   - GitHub Release page: github.com/owner/repo/releases/tag/v1.2.0
//   - GitHub directory or file: github.com/owner/repo/tree/main/plugins/x,
//     .../blob/main/plugins/x/plugin.json
//   - .zip link: extracted, then the directory containing plugin.json is used.
//   - plugin.json link: downloads it, the entry main points to, and files the entry imports relatively.
//
// Downloads go to .staging-* under the plugin directory first (starting with ., so plugin loading skips it),
// and only move to plugins/<id>/ after the user has reviewed permissions and capabilities and clicked "Install".
// No plugin code runs before confirmation: capabilities are read from the exports in the source.

import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:archive/archive.dart';
import 'package:path/path.dart' as p;

import '../l10n/l10n.dart';
import '../net/proxy.dart';
import '../version.dart';
import 'manifest.dart';
import 'plugin_source.dart';

/// A plugin downloaded but not yet installed.
class PluginPackage {
  PluginPackage._({
    required this.dir,
    required this.stage,
    required this.manifest,
    required this.ops,
    required this.origin,
    required this.source,
    this.release = '',
    this.published,
  });

  /// The directory containing plugin.json (inside the staging directory).
  final String dir;

  /// Staging directory, deleted after installing or giving up.
  final String stage;
  final PluginManifest manifest;

  /// Features (Ops) exported in the source that the app recognises.
  final Set<String> ops;

  /// The (normalised) link remembered for update checks; empty when installed from a local folder.
  final String origin;

  /// The origin shown to the user: github.com/owner/repo, or the link's host and path.
  final String source;

  /// The Release tag; empty when a branch or another link was installed.
  final String release;
  final DateTime? published;

  /// Why it can't be installed on the current app version.
  String? get blocked =>
      manifest.minAppVersion.isNotEmpty &&
          compareVersions(appVersion, manifest.minAppVersion) < 0
      ? L.pluginErrMinAppVersion(manifest.minAppVersion, appVersion)
      : null;

  Future<void> discard() async {
    try {
      await Directory(stage).delete(recursive: true);
    } catch (_) {}
  }
}

/// Installation failed; [message] can be shown to the user as-is.
class InstallError implements Exception {
  InstallError(this.message);
  final String message;
  @override
  String toString() => message;
}

/// A location on GitHub. [ref] is a branch or commit, [tag] a Release; when both are empty the latest Release is used.
class GitHubRef {
  const GitHubRef(this.owner, this.repo, {this.tag, this.ref, this.path = ''});
  final String owner, repo;
  final String? tag, ref;
  final String path;

  String get slug => '$owner/$repo';
}

/// Parses the link the user entered into a GitHub location; returns null when it isn't a GitHub repo link.
GitHubRef? parseGitHub(String input) {
  var s = input.trim();
  // owner/repo shorthand; GitHub usernames have no dots, which tells it apart from github.com/owner
  if (RegExp(r'^[\w-]+/[\w.-]+$').hasMatch(s)) s = 'github.com/$s';
  if (!s.contains('://')) s = 'https://$s';
  final u = Uri.tryParse(s);
  if (u == null) return null;
  final host = u.host.toLowerCase();
  if (host != 'github.com' && host != 'www.github.com') return null;
  final seg = u.pathSegments.where((x) => x.isNotEmpty).toList();
  if (seg.length < 2) return null;
  final owner = seg[0], repo = seg[1].replaceFirst(RegExp(r'\.git$'), '');
  if (seg.length == 2) return GitHubRef(owner, repo);
  switch (seg[2]) {
    case 'releases':
      if (seg.length >= 5 && seg[3] == 'tag') {
        return GitHubRef(owner, repo, tag: seg[4]);
      }
      if (seg.length == 3 || (seg.length == 4 && seg[3] == 'latest')) {
        return GitHubRef(owner, repo);
      }
      return null; // releases/download/... is a direct asset link
    case 'tree' when seg.length >= 4:
      return GitHubRef(owner, repo, ref: seg[3], path: seg.skip(4).join('/'));
    case 'blob' when seg.length >= 5:
      final rest = seg.skip(4).toList();
      if (rest.last == 'plugin.json') rest.removeLast();
      return GitHubRef(owner, repo, ref: seg[3], path: rest.join('/'));
  }
  return null;
}

const _maxBytes = 50 * 1024 * 1024;

/// Limits on total extracted size and file count, against zip bombs.
const _maxUnzippedBytes = 200 * 1024 * 1024;
const _maxUnzippedFiles = 5000;

/// Downloads the plugin into [pluginsRoot]/.staging-* and reads plugin.json and the exported features.
Future<PluginPackage> fetchPlugin(
  String input, {
  required String pluginsRoot,
}) async {
  input = input.trim();
  if (input.isEmpty) throw InstallError(L.pluginErrEmptyLink);
  final stage = p.join(
    pluginsRoot,
    '.staging-${DateTime.now().microsecondsSinceEpoch}',
  );
  await Directory(stage).create(recursive: true);
  final http = _client();
  try {
    final gh = parseGitHub(input);
    if (gh != null) return await _fromGitHub(http, gh, stage);
    final url = input.contains('://') ? input : 'https://$input';
    final u = Uri.tryParse(url);
    if (u == null ||
        u.host.isEmpty ||
        !(u.isScheme('https') || u.isScheme('http'))) {
      throw InstallError(L.pluginErrInvalidLink);
    }
    if (u.path.toLowerCase().endsWith('.zip')) {
      await _unzip(await _get(http, u), stage);
      return await _package(
        stage,
        stage,
        origin: u.toString(),
        source: '${u.host}${u.path}',
      );
    }
    final dir = p.join(stage, 'plugin');
    await _fetchLoose(http, u, dir);
    return await _package(
      stage,
      dir,
      origin: u.toString(),
      source: '${u.host}${u.path}',
    );
  } catch (e) {
    try {
      await Directory(stage).delete(recursive: true);
    } catch (_) {}
    if (e is InstallError) rethrow;
    if (e is SocketException || e is HttpException || e is HandshakeException) {
      throw InstallError(
        L.pluginErrDownloadNetwork('${e is SocketException ? e.message : e}'),
      );
    }
    throw InstallError('$e');
  } finally {
    http.close(force: true);
  }
}

/// Installs from a local folder: copies to the staging directory and goes through the same confirmation as link installs.
Future<PluginPackage> fetchPluginFromFolder(
  String folder, {
  required String pluginsRoot,
}) async {
  final stage = p.join(
    pluginsRoot,
    '.staging-${DateTime.now().microsecondsSinceEpoch}',
  );
  try {
    await _copyDir(folder, p.join(stage, 'plugin'));
    return await _package(stage, stage, origin: '', source: folder);
  } catch (e) {
    try {
      await Directory(stage).delete(recursive: true);
    } catch (_) {}
    if (e is InstallError) rethrow;
    throw InstallError('$e');
  }
}

/// Installs [pkg] into `plugins/<id>/`. [replace] is the current directory of the same plugin (when updating),
/// which is deleted first. Returns the installed directory.
Future<String> installPlugin(
  PluginPackage pkg, {
  required String pluginsRoot,
  String? replace,
}) async {
  final target = p.join(pluginsRoot, pkg.manifest.id);
  for (final d in {?replace, target}) {
    final dir = Directory(d);
    if (await dir.exists()) await dir.delete(recursive: true);
  }
  try {
    await Directory(pkg.dir).rename(target);
  } on FileSystemException {
    await _copyDir(pkg.dir, target);
  }
  await pkg.discard();
  return target;
}

/// Version of the GitHub repo's latest Release (without v); null when there's no Release or it can't be fetched.
Future<String?> latestGitHubVersion(GitHubRef gh) async {
  final http = _client();
  try {
    final j = await _json(
      http,
      Uri.parse('https://api.github.com/repos/${gh.slug}/releases/latest'),
      allow404: true,
    );
    final tag = '${j?['tag_name'] ?? ''}';
    return tag.isEmpty ? null : tag.replaceFirst(RegExp(r'^v'), '');
  } catch (_) {
    return null;
  } finally {
    http.close(force: true);
  }
}

// ───────────── GitHub ─────────────

Future<PluginPackage> _fromGitHub(
  HttpClient http,
  GitHubRef gh,
  String stage,
) async {
  final api = 'https://api.github.com/repos/${gh.slug}';
  Uri zip;
  var tag = '';
  DateTime? published;
  if (gh.ref != null) {
    zip = Uri.parse('$api/zipball/${Uri.encodeComponent(gh.ref!)}');
  } else {
    final rel = await _json(
      http,
      Uri.parse(
        gh.tag == null
            ? '$api/releases/latest'
            : '$api/releases/tags/${Uri.encodeComponent(gh.tag!)}',
      ),
      allow404: gh.tag == null,
    );
    if (rel == null) {
      // Never released: use the default branch. Check the repo exists first so the error message is accurate.
      if (await _json(http, Uri.parse(api), allow404: true) == null) {
        throw InstallError(L.pluginErrRepoNotFound(gh.slug));
      }
      zip = Uri.parse('$api/zipball');
    } else {
      tag = '${rel['tag_name'] ?? ''}';
      published = DateTime.tryParse('${rel['published_at'] ?? ''}');
      final assets = [
        for (final a in rel['assets'] as List? ?? const [])
          if (a is Map && '${a['name']}'.toLowerCase().endsWith('.zip')) a,
      ];
      zip = Uri.parse(
        assets.isNotEmpty
            ? '${assets.first['browser_download_url']}'
            : '${rel['zipball_url']}',
      );
    }
  }
  await _unzip(await _get(http, zip), stage);
  // GitHub source archives are wrapped in owner-repo-sha/; plugin.json is searched for down the path
  var root = stage;
  if (gh.path.isNotEmpty) {
    final top = Directory(stage).listSync().whereType<Directory>().toList();
    final base = top.length == 1 ? top.first.path : stage;
    root = p.join(base, gh.path);
    if (!File(p.join(root, 'plugin.json')).existsSync()) {
      throw InstallError(L.pluginErrNoManifestInPath(gh.path));
    }
  }
  return _package(
    stage,
    root,
    origin:
        'https://github.com/${gh.slug}'
        '${gh.ref != null ? '/tree/${gh.ref}${gh.path.isEmpty ? '' : '/${gh.path}'}' : ''}',
    source: 'github.com/${gh.slug}',
    release: tag,
    published: published,
  );
}

// ───────────── Loose files (plugin.json link) ─────────────

final _importRe = RegExp(
  r'''(?:import|export)\s*(?:[^'"]*?\sfrom\s*)?['"](\.{1,2}/[^'"]+)['"]''',
);

Future<void> _fetchLoose(HttpClient http, Uri manifestUrl, String dir) async {
  final text = utf8.decode(await _get(http, manifestUrl));
  final PluginManifest m;
  try {
    m = PluginManifest.parse(text);
  } on FormatException catch (e) {
    throw InstallError(e.message);
  }
  await Directory(dir).create(recursive: true);
  await File(p.join(dir, 'plugin.json')).writeAsString(text);
  // The entry and files it imports relatively; only inside the plugin directory
  final todo = [m.main], done = <String>{};
  while (todo.isNotEmpty && done.length < 200) {
    final rel = p.posix.normalize(todo.removeLast().replaceAll(r'\', '/'));
    if (!done.add(rel)) continue;
    final path = _inside(dir, rel);
    if (path == null) continue;
    final bytes = await _get(http, manifestUrl.resolve(rel));
    final out = File(path);
    await out.parent.create(recursive: true);
    await out.writeAsBytes(bytes);
    for (final mm in _importRe.allMatches(
      utf8.decode(bytes, allowMalformed: true),
    )) {
      todo.add(p.posix.join(p.posix.dirname(rel), mm[1]!));
    }
  }
  // The icon is optional; never mind if it fails to download
  if (m.icon.isNotEmpty) {
    final rel = p.posix.normalize(m.icon.replaceAll(r'\', '/'));
    final path = _inside(dir, rel);
    final bytes = path == null
        ? null
        : await _tryGet(http, manifestUrl.resolve(rel));
    if (path != null && bytes != null) {
      final out = File(path);
      await out.parent.create(recursive: true);
      await out.writeAsBytes(bytes);
    }
  }
}

/// Places the `/`-separated relative path [rel] inside [dir]; returns null when it would land outside [dir] (`..`, absolute paths,
/// Windows drive letters or backslashes).
String? _inside(String dir, String rel) {
  final segs = rel.replaceAll(r'\', '/').split('/');
  if (rel.startsWith('/') || segs.any((x) => x == '..' || x.contains(':'))) {
    return null;
  }
  final path = p.normalize(
    p.joinAll([dir, ...segs.where((x) => x.isNotEmpty && x != '.')]),
  );
  return p.isWithin(dir, path) ? path : null;
}

// ───────────── Reading plugins ─────────────

Future<PluginPackage> _package(
  String stage,
  String searchRoot, {
  required String origin,
  required String source,
  String release = '',
  DateTime? published,
}) async {
  final dir = _findManifest(searchRoot);
  if (dir == null) throw InstallError(L.pluginErrNoManifestInLink);
  final PluginManifest m;
  try {
    m = PluginManifest.parse(
      await File(p.join(dir, 'plugin.json')).readAsString(),
    );
  } on FormatException catch (e) {
    throw InstallError(e.message);
  }
  if (!File(p.join(dir, m.main)).existsSync()) {
    throw InstallError(L.pluginErrMissingEntry(m.main));
  }
  return PluginPackage._(
    dir: dir,
    stage: stage,
    manifest: m,
    ops: exportsOf(dir, m.main),
    origin: origin,
    source: source,
    release: release,
    published: published,
  );
}

/// The shallowest directory containing plugin.json.
String? _findManifest(String root) {
  var level = [root];
  for (var depth = 0; depth < 4 && level.isNotEmpty; depth++) {
    level.sort();
    for (final d in level) {
      if (File(p.join(d, 'plugin.json')).existsSync()) return d;
    }
    level = [
      for (final d in level)
        for (final e in Directory(d).listSync())
          if (e is Directory &&
              !p.basename(e.path).startsWith('.') &&
              p.basename(e.path) != 'node_modules')
            e.path,
    ];
  }
  return null;
}

/// Reads from the source which app-recognised functions the entry module exports (without running the plugin).
/// Follows `export * from` / `export {…} from` into relative modules.
Set<String> exportsOf(String dir, String main) {
  final names = <String>{};
  final seen = <String>{};
  void scan(String rel) {
    final file = p.normalize(p.join(dir, rel));
    if (!p.isWithin(dir, file) || !seen.add(file) || seen.length > 50) return;
    final String src;
    try {
      src = File(file).readAsStringSync();
    } catch (_) {
      return;
    }
    final code = src
        .replaceAll(RegExp(r'/\*[\s\S]*?\*/'), '')
        .replaceAll(RegExp(r'(^|[^:])//.*', multiLine: true), r'$1');
    for (final m in RegExp(
      r'export\s+(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)',
    ).allMatches(code)) {
      names.add(m[1]!);
    }
    for (final m in RegExp(
      r'export\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)',
    ).allMatches(code)) {
      names.add(m[1]!);
    }
    for (final m in RegExp(
      r'''export\s*\{([^}]*)\}(?:\s*from\s*['"]([^'"]+)['"])?''',
    ).allMatches(code)) {
      for (final part in m[1]!.split(',')) {
        final w = part.trim().split(RegExp(r'\s+as\s+'));
        if (w.last.trim().isNotEmpty) names.add(w.last.trim());
      }
    }
    for (final m in RegExp(
      r'''export\s*\*\s*from\s*['"](\.{1,2}/[^'"]+)['"]''',
    ).allMatches(code)) {
      scan(p.join(p.dirname(rel), m[1]!));
    }
  }

  scan(main);
  return names.intersection(PluginSource.knownOps);
}

// ───────────── Download, extract ─────────────

HttpClient _client() {
  final proxy = systemProxy();
  final http = HttpClient()
    ..connectionTimeout = const Duration(seconds: 15)
    ..userAgent = 'YesPlayMusic/$appVersion';
  if (proxy != null) http.findProxy = proxy.findProxy;
  return http;
}

Future<Uint8List> _get(HttpClient http, Uri url) async =>
    (await _tryGet(http, url)) ??
    (throw InstallError(L.pluginErrNotFoundUrl('$url')));

/// Returns null on 404.
Future<Uint8List?> _tryGet(HttpClient http, Uri url) async {
  final req = await http.getUrl(url);
  if (url.host == 'api.github.com') {
    req.headers.set('Accept', 'application/vnd.github+json');
  }
  final res = await req.close().timeout(const Duration(seconds: 30));
  if (res.statusCode == 404) {
    await res.drain<void>();
    return null;
  }
  if (res.statusCode == 403 && url.host == 'api.github.com') {
    await res.drain<void>();
    throw InstallError(L.pluginErrGithubRateLimit);
  }
  if (res.statusCode != 200) {
    await res.drain<void>();
    throw InstallError(L.pluginErrDownloadHttp(res.statusCode));
  }
  final out = BytesBuilder(copy: false);
  await for (final chunk in res.timeout(const Duration(seconds: 60))) {
    out.add(chunk);
    if (out.length > _maxBytes) throw InstallError(L.pluginErrTooLarge);
  }
  return out.takeBytes();
}

Future<Map<String, Object?>?> _json(
  HttpClient http,
  Uri url, {
  bool allow404 = false,
}) async {
  final bytes = await _tryGet(http, url);
  if (bytes == null) {
    if (allow404) return null;
    throw InstallError(L.pluginErrNotFoundUrl('$url'));
  }
  final j = jsonDecode(utf8.decode(bytes));
  return j is Map<String, Object?> ? j : null;
}

Future<void> _unzip(Uint8List bytes, String dest) async {
  final Archive a;
  try {
    a = ZipDecoder().decodeBytes(bytes);
  } catch (_) {
    throw InstallError(L.pluginErrInvalidZip);
  }
  var total = 0;
  if (a.files.length > _maxUnzippedFiles) {
    throw InstallError(L.pluginErrTooLarge);
  }
  for (final f in a.files) {
    final name = p.posix.normalize(f.name.replaceAll('\\', '/'));
    if (name.startsWith('/') || name.split('/').contains('..')) continue;
    final path = _inside(dest, name);
    if (path == null) continue;
    if (f.isFile) {
      total += f.size;
      if (total > _maxUnzippedBytes) throw InstallError(L.pluginErrTooLarge);
      await File(path).parent.create(recursive: true);
      await File(path).writeAsBytes(f.content);
    } else {
      await Directory(path).create(recursive: true);
    }
  }
}

Future<void> _copyDir(String from, String to) async {
  await Directory(to).create(recursive: true);
  await for (final e in Directory(from).list(recursive: true)) {
    final rel = p.relative(e.path, from: from);
    if (e is Directory) {
      await Directory(p.join(to, rel)).create(recursive: true);
    } else if (e is File) {
      await File(p.join(to, rel)).parent.create(recursive: true);
      await e.copy(p.join(to, rel));
    }
  }
}
