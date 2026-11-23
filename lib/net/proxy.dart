// System proxy. Neither Dart's HttpClient nor mpv reads the macOS proxy settings on its own,
// and both plugin fetches and network audio playback need it.
//
// Prefers the env vars https_proxy / http_proxy / all_proxy (http proxies only),
// then macOS system settings (HTTPS/HTTP proxy and exceptions list from scutil --proxy).
// Local addresses, LAN addresses and hosts in the exceptions list connect directly.

import 'dart:io';

class HttpProxy {
  const HttpProxy(this.host, this.port, {this.exceptions = const []});
  final String host;
  final int port;

  /// Hosts that connect directly: exact host names, *.suffix, IPv4 ranges (a.b.c.d/n).
  final List<String> exceptions;

  /// Format of mpv's http-proxy option.
  String get url => 'http://$host:$port';

  /// Return value for HttpClient.findProxy.
  String findProxy(Uri u) => bypass(u.host) ? 'DIRECT' : 'PROXY $host:$port';

  bool bypass(String host) {
    host = host.toLowerCase();
    if (host == 'localhost' || host == '::1' || host.endsWith('.local')) {
      return true;
    }
    final ip = _ipv4(host);
    if (ip != null && (ip >> 24) == 127) return true;
    for (final e in exceptions) {
      final x = e.trim().toLowerCase();
      if (x.isEmpty) continue;
      if (x.startsWith('*.')) {
        if (host.endsWith(x.substring(1))) return true;
      } else if (x.contains('/') && ip != null) {
        final [net, bits] = x.split('/');
        final n = _ipv4(net), b = int.tryParse(bits);
        if (n != null && b != null && b >= 0 && b <= 32) {
          final mask = b == 0 ? 0 : (0xFFFFFFFF << (32 - b)) & 0xFFFFFFFF;
          if ((ip & mask) == (n & mask)) return true;
        }
      } else if (x == host) {
        return true;
      }
    }
    return false;
  }

  static int? _ipv4(String s) {
    final ps = s.split('.');
    if (ps.length != 4) return null;
    var v = 0;
    for (final p in ps) {
      final n = int.tryParse(p);
      if (n == null || n < 0 || n > 255) return null;
      v = (v << 8) | n;
    }
    return v;
  }

  Map<String, Object?> toJson() => {
    'host': host,
    'port': port,
    'exceptions': exceptions,
  };

  static HttpProxy? fromJson(Object? j) => j is Map
      ? HttpProxy(
          j['host'] as String,
          j['port'] as int,
          exceptions: [for (final e in j['exceptions'] as List) e as String],
        )
      : null;

  @override
  String toString() => url;
}

HttpProxy? _cached;
var _detected = false;

/// The current system proxy (detected on first call, cached afterwards). Returns null when there is no proxy.
HttpProxy? systemProxy() {
  if (_detected) return _cached;
  _detected = true;
  return _cached = _fromEnv() ?? (Platform.isMacOS ? _fromScutil() : null);
}

HttpProxy? _fromEnv() {
  final env = Platform.environment;
  for (final k in [
    'https_proxy',
    'HTTPS_PROXY',
    'http_proxy',
    'HTTP_PROXY',
    'all_proxy',
    'ALL_PROXY',
  ]) {
    final u = Uri.tryParse(env[k] ?? '');
    if (u == null || u.host.isEmpty || (u.scheme != 'http' && u.scheme != '')) {
      continue;
    }
    final no = (env['no_proxy'] ?? env['NO_PROXY'] ?? '')
        .split(',')
        .map((s) => s.trim())
        .map((s) => s.startsWith('.') ? '*$s' : s)
        .where((s) => s.isNotEmpty)
        .toList();
    return HttpProxy(u.host, u.hasPort ? u.port : 80, exceptions: no);
  }
  return null;
}

HttpProxy? _fromScutil() {
  final String out;
  try {
    final r = Process.runSync('/usr/sbin/scutil', ['--proxy']);
    if (r.exitCode != 0) return null;
    out = r.stdout as String;
  } on ProcessException {
    return null;
  }
  return parseScutil(out);
}

/// Parses the output of `scutil --proxy`.
HttpProxy? parseScutil(String out) {
  String? v(String key) =>
      RegExp('^\\s*$key : (.+)\$', multiLine: true).firstMatch(out)?[1]?.trim();
  final exceptions = <String>[];
  final list = RegExp(r'ExceptionsList : <array> \{([^}]*)\}').firstMatch(out);
  if (list != null) {
    for (final m in RegExp(
      r'^\s*\d+ : (.+)$',
      multiLine: true,
    ).allMatches(list[1]!)) {
      exceptions.add(m[1]!.trim());
    }
  }
  for (final kind in ['HTTPS', 'HTTP']) {
    if (v('${kind}Enable') != '1') continue;
    final host = v('${kind}Proxy'), port = int.tryParse(v('${kind}Port') ?? '');
    if (host != null && host.isNotEmpty && port != null) {
      return HttpProxy(host, port, exceptions: exceptions);
    }
  }
  return null;
}
