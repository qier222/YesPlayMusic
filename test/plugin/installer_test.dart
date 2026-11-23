import 'dart:convert';
import 'dart:io';

import 'package:archive/archive.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:path/path.dart' as p;
import 'package:yesplaymusic/plugin/installer.dart';
import 'package:yesplaymusic/plugin/manifest.dart';

/// Local static file server: path → content. Records the paths requested.
Future<({HttpServer server, List<String> hits})> _serve(
  Map<String, List<int>> files,
) async {
  final server = await HttpServer.bind(InternetAddress.loopbackIPv4, 0);
  final hits = <String>[];
  server.listen((req) async {
    final path = Uri.decodeFull(req.uri.path);
    hits.add(path);
    final body = files[path];
    if (body == null) {
      req.response.statusCode = 404;
    } else {
      req.response.add(body);
    }
    await req.response.close();
  });
  return (server: server, hits: hits);
}

List<int> _zip(Map<String, List<int>> entries) {
  final a = Archive();
  for (final e in entries.entries) {
    a.addFile(ArchiveFile(e.key, e.value.length, e.value));
  }
  return ZipEncoder().encode(a);
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  HttpOverrides.global = null;

  late Directory tmp;
  late String root;

  setUp(() async {
    tmp = await Directory.systemTemp.createTemp('ypm_installer_');
    root = p.join(tmp.path, 'a', 'b', 'plugins');
    await Directory(root).create(recursive: true);
  });

  tearDown(() async {
    await tmp.delete(recursive: true);
  });

  /// Whether tmp has any files besides plugins/ (written outside the plugin directory).
  List<String> escaped() => [
    for (final e in tmp.listSync(recursive: true))
      if (e is File && !p.isWithin(root, e.path)) e.path,
  ];

  group('parseGitHub', () {
    test('各种 GitHub 链接', () {
      expect(parseGitHub('owner/repo')!.slug, 'owner/repo');
      expect(parseGitHub('https://github.com/o/r.git')!.repo, 'r');
      final tag = parseGitHub('github.com/o/r/releases/tag/v1.2.0')!;
      expect(tag.tag, 'v1.2.0');
      expect(parseGitHub('github.com/o/r/releases/latest')!.tag, isNull);
      final tree = parseGitHub('github.com/o/r/tree/main/plugins/x')!;
      expect(tree.ref, 'main');
      expect(tree.path, 'plugins/x');
      final blob = parseGitHub(
        'https://github.com/o/r/blob/dev/plugins/x/plugin.json',
      )!;
      expect(blob.ref, 'dev');
      expect(blob.path, 'plugins/x');
    });

    test('不是仓库链接时返回 null', () {
      expect(parseGitHub('https://example.com/o/r'), isNull);
      expect(parseGitHub('github.com/o'), isNull);
      expect(parseGitHub('github.com/o/r/releases/download/v1/x.zip'), isNull);
    });
  });

  group('plugin.json 链接安装', () {
    test('下载入口和相对 import 的文件', () async {
      final h = await _serve({
        '/p/plugin.json': utf8.encode(
          '{"id":"demo","name":"Demo","main":"index.js","icon":"icon.png"}',
        ),
        '/p/index.js': utf8.encode(
          "export * from './lib/a.js';\nexport function search() {}",
        ),
        '/p/lib/a.js': utf8.encode(
          "export * from '../b.js'; export const a=1;",
        ),
        '/p/b.js': utf8.encode('export function lyrics() {}'),
        '/p/icon.png': [1, 2, 3],
      });
      final pkg = await fetchPlugin(
        'http://127.0.0.1:${h.server.port}/p/plugin.json',
        pluginsRoot: root,
      );
      expect(pkg.manifest.id, 'demo');
      expect(File(p.join(pkg.dir, 'lib', 'a.js')).existsSync(), isTrue);
      expect(File(p.join(pkg.dir, 'b.js')).existsSync(), isTrue);
      expect(File(p.join(pkg.dir, 'icon.png')).existsSync(), isTrue);
      expect(pkg.ops, containsAll(['search', 'lyrics']));
      expect(p.basename(pkg.stage), startsWith('.staging-'));

      final dir = await installPlugin(pkg, pluginsRoot: root);
      expect(dir, p.join(root, 'demo'));
      expect(File(p.join(dir, 'index.js')).existsSync(), isTrue);
      expect(Directory(pkg.stage).existsSync(), isFalse);
      await h.server.close(force: true);
    });

    test('import 路径带 .. 或反斜杠时不写出插件目录', () async {
      final h = await _serve({
        '/p/plugin.json': utf8.encode('{"id":"x","name":"X"}'),
        '/p/index.js': utf8.encode(
          "import './a\\\\..\\\\..\\\\..\\\\..\\\\evil.js';\n"
          "import '../../../../evil2.js';",
        ),
        '/evil.js': utf8.encode('pwned'),
        '/evil2.js': utf8.encode('pwned'),
      });
      final pkg = await fetchPlugin(
        'http://127.0.0.1:${h.server.port}/p/plugin.json',
        pluginsRoot: root,
      );
      expect(escaped(), isEmpty);
      await pkg.discard();
      await h.server.close(force: true);
    });

    test('清单里反斜杠形式的 ..（icon / main）被拒绝', () async {
      for (final m in [
        '{"id":"x","name":"X","icon":"..\\\\..\\\\..\\\\evil.png"}',
        '{"id":"x","name":"X","main":"..\\\\..\\\\evil.js"}',
        '{"id":"x","name":"X","main":"C:\\\\evil.js"}',
      ]) {
        expect(() => PluginManifest.parse(m), throwsFormatException, reason: m);
      }
    });

    test('404 和非法链接给出可读错误并清理暂存目录', () async {
      final h = await _serve({});
      await expectLater(
        fetchPlugin(
          'http://127.0.0.1:${h.server.port}/nope/plugin.json',
          pluginsRoot: root,
        ),
        throwsA(isA<InstallError>()),
      );
      await expectLater(
        fetchPlugin('   ', pluginsRoot: root),
        throwsA(isA<InstallError>()),
      );
      await expectLater(
        fetchPlugin('ftp://x.example/p.json', pluginsRoot: root),
        throwsA(isA<InstallError>()),
      );
      expect(
        Directory(root)
            .listSync()
            .where((e) => p.basename(e.path).startsWith('.staging-')),
        isEmpty,
      );
      await h.server.close(force: true);
    });
  });

  group('.zip 链接安装', () {
    test('解压后找到最浅的 plugin.json，跳过路径穿越条目', () async {
      final h = await _serve({
        '/x.zip': _zip({
          'top/plugin.json': utf8.encode('{"id":"z","name":"Z"}'),
          'top/index.js': utf8.encode('export function search(){}'),
          '../../../../escape.txt': utf8.encode('pwned'),
          'top/..\\..\\..\\..\\escape2.txt': utf8.encode('pwned'),
          '/abs.txt': utf8.encode('pwned'),
        }),
      });
      final pkg = await fetchPlugin(
        'http://127.0.0.1:${h.server.port}/x.zip',
        pluginsRoot: root,
      );
      expect(p.basename(pkg.dir), 'top');
      expect(pkg.ops, {'search'});
      expect(escaped(), isEmpty);
      await pkg.discard();
      await h.server.close(force: true);
    });

    test('压缩包里没有 plugin.json 时报错', () async {
      final h = await _serve({
        '/x.zip': _zip({'readme.md': utf8.encode('hi')}),
      });
      await expectLater(
        fetchPlugin(
          'http://127.0.0.1:${h.server.port}/x.zip',
          pluginsRoot: root,
        ),
        throwsA(isA<InstallError>()),
      );
      await h.server.close(force: true);
    });

    test('不是 zip 时报错', () async {
      final h = await _serve({'/x.zip': utf8.encode('not a zip')});
      await expectLater(
        fetchPlugin(
          'http://127.0.0.1:${h.server.port}/x.zip',
          pluginsRoot: root,
        ),
        throwsA(isA<InstallError>()),
      );
      await h.server.close(force: true);
    });
  });

  group('本地文件夹安装', () {
    test('复制到暂存目录，更新时替换旧目录', () async {
      final src = Directory(p.join(tmp.path, 'src'))..createSync();
      File(p.join(src.path, 'plugin.json'))
          .writeAsStringSync('{"id":"loc","name":"Loc","version":"2.0.0"}');
      File(p.join(src.path, 'index.js'))
          .writeAsStringSync('export async function playlists(){}');
      final old = Directory(p.join(root, 'old-loc'))..createSync();
      File(p.join(old.path, 'stale.js')).writeAsStringSync('');

      final pkg = await fetchPluginFromFolder(src.path, pluginsRoot: root);
      expect(pkg.ops, {'playlists'});
      final dir = await installPlugin(
        pkg,
        pluginsRoot: root,
        replace: old.path,
      );
      expect(old.existsSync(), isFalse);
      expect(File(p.join(dir, 'index.js')).existsSync(), isTrue);
    });

    test('文件夹里缺入口文件时报错', () async {
      final src = Directory(p.join(tmp.path, 'src2'))..createSync();
      File(p.join(src.path, 'plugin.json'))
          .writeAsStringSync('{"id":"loc","name":"Loc","main":"main.js"}');
      await expectLater(
        fetchPluginFromFolder(src.path, pluginsRoot: root),
        throwsA(isA<InstallError>()),
      );
    });
  });

  group('exportsOf', () {
    test('识别各种导出写法，忽略注释和未知名字', () {
      final d = Directory(p.join(tmp.path, 'ex'))..createSync();
      File(p.join(d.path, 'index.js')).writeAsStringSync('''
// export function album() {}
/* export function artist() {} */
export async function search() {}
export function* lyrics() {}
export const playlists = 1;
function a() {} function b() {}
export { a as album, b as notAnOp };
export * from './more.js';
export * from '../outside.js';
''');
      File(p.join(d.path, 'more.js'))
          .writeAsStringSync('export function playlist() {}');
      File(p.join(tmp.path, 'outside.js'))
          .writeAsStringSync('export function artist() {}');
      expect(exportsOf(d.path, 'index.js'), {
        'search',
        'lyrics',
        'playlists',
        'album',
        'playlist',
      });
    });
  });
}
