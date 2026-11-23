// 从链接安装插件。
//
// 支持的链接：
//   - GitHub 仓库：github.com/owner/repo（或 owner/repo）。有正式版时装最新
//     Release（优先用 Release 里的 .zip 附件，否则用源码包），没有就装默认分支。
//   - GitHub Release 页面：github.com/owner/repo/releases/tag/v1.2.0
//   - GitHub 目录或文件：github.com/owner/repo/tree/main/plugins/x、
//     .../blob/main/plugins/x/plugin.json
//   - .zip 链接：解压后找 plugin.json 所在的目录。
//   - plugin.json 链接：下载它、main 指向的入口，以及入口相对 import 的文件。
//
// 下载的东西先放在插件目录下的 .staging-*（以 . 开头，加载插件时会跳过），
// 用户在安装确认里看过权限和能力、点了「安装」才移到 plugins/<id>/。
// 确认之前不运行插件的任何代码：能力是从源码里的 export 看出来的。

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

/// 下载好、还没安装的插件。
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

  /// plugin.json 所在的目录（在暂存目录里）。
  final String dir;

  /// 暂存目录，装好或放弃后删掉。
  final String stage;
  final PluginManifest manifest;

  /// 源码里导出的、应用认识的功能（Op）。
  final Set<String> ops;

  /// 记下来用于检查更新的链接（规范化过）；从本地文件夹装的为空。
  final String origin;

  /// 给用户看的来源：github.com/owner/repo 或链接的主机和路径。
  final String source;

  /// Release 的 tag；装的是分支或别的链接时为空。
  final String release;
  final DateTime? published;

  /// 当前应用版本装不了时的原因。
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

/// 安装失败，[message] 可以直接给用户看。
class InstallError implements Exception {
  InstallError(this.message);
  final String message;
  @override
  String toString() => message;
}

/// GitHub 上的位置。[ref] 是分支或提交，[tag] 是 Release；都空时用最新 Release。
class GitHubRef {
  const GitHubRef(this.owner, this.repo, {this.tag, this.ref, this.path = ''});
  final String owner, repo;
  final String? tag, ref;
  final String path;

  String get slug => '$owner/$repo';
}

/// 把用户填的链接解析成 GitHub 位置；不是 GitHub 仓库链接时返回 null。
GitHubRef? parseGitHub(String input) {
  var s = input.trim();
  // owner/repo 简写；GitHub 用户名里没有点，借此和 github.com/owner 区分开
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
      return null; // releases/download/... 是附件直链
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

/// 解压后的总大小和文件数上限，防 zip 炸弹。
const _maxUnzippedBytes = 200 * 1024 * 1024;
const _maxUnzippedFiles = 5000;

/// 下载插件到 [pluginsRoot]/.staging-*，读出 plugin.json 和导出的功能。
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

/// 从本地文件夹安装：复制到暂存目录，和链接安装走同一套确认。
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

/// 把 [pkg] 装到 `plugins/<id>/`。[replace] 是同一个插件现在的目录（更新时），
/// 会先删掉。返回装好的目录。
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

/// GitHub 仓库最新 Release 的版本号（去掉 v）；没有 Release 或查不到时 null。
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
      // 还没有发布过：用默认分支。先确认仓库存在，错误信息才准确。
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
  // GitHub 的源码包外面套了一层 owner-repo-sha/，plugin.json 按路径往下找
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

// ───────────── 散装文件（plugin.json 链接） ─────────────

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
  // 入口和它相对 import 的文件；只在插件目录里
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
  // 图标不是必需的，下载失败就算了
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

/// 把以 `/` 分隔的相对路径 [rel] 放进 [dir]；会落到 [dir] 外面（`..`、绝对路径、
/// Windows 盘符或反斜杠）时返回 null。
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

// ───────────── 读插件 ─────────────

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

/// 最浅的、有 plugin.json 的目录。
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

/// 从源码里看入口模块导出了哪些应用认识的函数（不运行插件）。
/// 跟着 `export * from` / `export {…} from` 进相对路径的模块。
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

// ───────────── 下载、解压 ─────────────

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

/// 404 时返回 null。
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
