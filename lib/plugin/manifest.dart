// Plugin manifest plugin.json, with the same fields as MyGo Music:
//
//   {
//     "id": "example", "name": "Example", "version": "1.0.0",
//     "minAppVersion": "0.1.0", "main": "index.js",
//     "description": "A one-line intro", "author": "Author", "icon": "icon.png",
//     "playback": "stream",
//     "permissions": {"network": ["api.example.com", "*.example.net"]},
//     "settings": [...], "navigation": [...]
//   }
//
// permissions.network lists hosts fetch may reach: exact host names, *.example.com (matches
// subdomains only), {setting:key} (the host of a server address entered in settings) or * (any). Without it there's no network access.
// permissions.process lists programs host.spawn may start (see process.dart); true equals ["*"].
// The user must also allow this plugin to run programs in settings.
// permissions.ipc lists local channels host.ipc may connect to (see ipc.dart), e.g. "discord-ipc-*".

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
    this.ipc = const [],
    this.description = '',
    this.author = '',
    this.icon = '',
    this.repository = '',
    this.raw = const {},
  });

  final SourceInfo info;
  String get id => info.id;
  final String main, minAppVersion;
  final List<String> network, process, ipc;

  /// A sentence or two of description and the author, shown on the plugin card; both optional.
  final String description, author;

  /// Plugin icon, a relative path to a .png/.jpg/.webp in the plugin directory; the name's initial is used when unset.
  final String icon;

  /// Optional GitHub repository URL, used for update checks when no install origin was recorded.
  final String repository;

  /// Raw JSON, passed to the plugin isolate.
  final Map<String, Object?> raw;

  static final _id = RegExp(r'^[a-z0-9][a-z0-9._-]{0,63}$');

  /// A relative path inside the plugin directory: not absolute, no drive letter, no segment is `..`.
  /// Both `/` and `\` count as separators, otherwise `..\x` on macOS would escape the plugin directory
  /// on Windows (or once the installer converts it to `/`).
  static bool _safeRelative(String path) {
    final unified = path.replaceAll(r'\', '/');
    if (unified.startsWith('/') || p.isAbsolute(path)) return false;
    final segs = unified.split('/');
    return !segs.any((x) => x == '..' || x.contains(':'));
  }

  /// Parses and validates. Throws [FormatException] when invalid, with a message that can be shown to the user as-is.
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
      ipc: strings(perms['ipc']),
      description: j['description'] is String
          ? (j['description'] as String).trim()
          : '',
      author: switch (j['author']) {
        final String a => a.trim(),
        {'name': final String a} => a.trim(),
        _ => '',
      },
      icon: icon.isEmpty ? '' : p.normalize(icon),
      repository: switch (j['repository']) {
        final String r => r.trim(),
        {'url': final String r} => r.trim(),
        _ => '',
      },
      raw: j,
    );
  }
}

/// Whether [host] is within [allowed] (permissions.network). [settingHost] replaces
/// `{setting:key}` with the host name of that address in settings.
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
