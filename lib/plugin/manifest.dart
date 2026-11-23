// 插件清单 plugin.json，字段与 MyGo Music 一致：
//
//   {
//     "id": "example", "name": "Example", "version": "1.0.0",
//     "minAppVersion": "0.1.0", "main": "index.js",
//     "description": "一句介绍", "author": "作者", "icon": "icon.png",
//     "playback": "stream",
//     "permissions": {"network": ["api.example.com", "*.example.net"]},
//     "settings": [...], "navigation": [...]
//   }
//
// permissions.network 是 fetch 能访问的主机：精确主机名、*.example.com（只匹配
// 子域名）、{setting:key}（设置里填的服务器地址的主机）或 *（任意）。不写就不能联网。
// permissions.process 是 host.spawn 能启动的程序（见 process.dart）；true 等于 ["*"]。
// 用户还要在设置里允许这个插件运行程序。

import 'dart:convert';

import 'package:path/path.dart' as p;

import '../l10n/l10n.dart';
import '../music/models.dart';

class PluginManifest {
  const PluginManifest({
    required this.info,
    required this.main,
    this.minAppVersion = '',
    this.network = const [],
    this.process = const [],
    this.description = '',
    this.author = '',
    this.icon = '',
    this.raw = const {},
  });

  final SourceInfo info;
  String get id => info.id;
  final String main, minAppVersion;
  final List<String> network, process;

  /// 一两句介绍和作者，显示在插件卡片上；都可以不写。
  final String description, author;

  /// 插件图标，插件目录里的 .png/.jpg/.webp 相对路径；不写就用名字首字母。
  final String icon;

  /// 原始 JSON，传给插件 isolate 用。
  final Map<String, Object?> raw;

  static final _id = RegExp(r'^[a-z0-9][a-z0-9._-]{0,63}$');

  /// 插件目录里的相对路径：不是绝对路径、没有盘符、任何一段都不是 `..`。
  /// `/` 和 `\` 都当分隔符，否则 macOS 上的 `..\x` 到 Windows（或经安装器换成 `/`）
  /// 就会跳出插件目录。
  static bool _safeRelative(String path) {
    final unified = path.replaceAll(r'\', '/');
    if (unified.startsWith('/') || p.isAbsolute(path)) return false;
    final segs = unified.split('/');
    return !segs.any((x) => x == '..' || x.contains(':'));
  }

  /// 解析并检查。不合格抛 [FormatException]，消息可以直接给用户看。
  factory PluginManifest.parse(String text) {
    final Object? j;
    try {
      j = jsonDecode(text);
    } on FormatException catch (e) {
      throw FormatException(L.pluginErrManifestJson(e.message));
    }
    if (j is! Map<String, Object?>) {
      throw FormatException(L.pluginErrManifestObject);
    }
    final info = SourceInfo.fromJson(j);
    if (!_id.hasMatch(info.id)) {
      throw FormatException(L.pluginErrManifestIdChars(info.id));
    }
    if (info.id == 'local') {
      throw FormatException(L.pluginErrManifestIdLocal);
    }
    if (info.name.isEmpty) throw FormatException(L.pluginErrManifestNoName);
    final main = j['main'] is String ? j['main'] as String : 'index.js';
    if (!_safeRelative(main) || !RegExp(r'\.(m?js)$').hasMatch(main)) {
      throw FormatException(L.pluginErrManifestMain(main));
    }
    final icon = j['icon'] is String ? (j['icon'] as String).trim() : '';
    if (icon.isNotEmpty &&
        (!_safeRelative(icon) ||
            !RegExp(
              r'\.(png|jpe?g|webp)$',
              caseSensitive: false,
            ).hasMatch(icon))) {
      throw FormatException(L.pluginErrManifestIcon(icon));
    }
    final perms = j['permissions'] is Map ? j['permissions'] as Map : const {};
    List<String> strings(Object? v) => v is List
        ? [
            for (final x in v)
              if (x is String) x,
          ]
        : const [];
    return PluginManifest(
      info: info,
      main: p.normalize(main),
      minAppVersion: j['minAppVersion'] is String
          ? j['minAppVersion'] as String
          : '',
      network: strings(perms['network']),
      process: perms['process'] == true
          ? const ['*']
          : strings(perms['process']),
      description: j['description'] is String
          ? (j['description'] as String).trim()
          : '',
      author: switch (j['author']) {
        final String a => a.trim(),
        {'name': final String a} => a.trim(),
        _ => '',
      },
      icon: icon.isEmpty ? '' : p.normalize(icon),
      raw: j,
    );
  }
}

/// [host] 是否在 [allowed]（permissions.network）之内。[settingHost] 把
/// `{setting:key}` 换成设置里那个地址的主机名。
bool hostAllowed(
  String host,
  List<String> allowed, {
  String? Function(String key)? settingHost,
}) {
  host = host.toLowerCase();
  if (host.isEmpty) return false;
  for (var a in allowed) {
    a = a.trim().toLowerCase();
    if (a == '*') return true;
    final m = RegExp(r'^\{setting:([^{}]+)\}$').firstMatch(a);
    if (m != null) {
      final h = settingHost?.call(m[1]!);
      if (h != null && h.isNotEmpty && h.toLowerCase() == host) return true;
      continue;
    }
    if (a.startsWith('*.')) {
      if (host.endsWith(a.substring(1))) return true;
      continue;
    }
    if (a == host) return true;
  }
  return false;
}
