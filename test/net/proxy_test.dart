import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/net/proxy.dart';

const _scutil = '''
<dictionary> {
  ExceptionsList : <array> {
    0 : 192.168.0.0/16
    1 : 10.0.0.0/8
    2 : *.corp.example
    3 : nas
  }
  HTTPEnable : 1
  HTTPPort : 8888
  HTTPProxy : 127.0.0.1
  HTTPSEnable : 1
  HTTPSPort : 7890
  HTTPSProxy : 10.0.0.2
  SOCKSEnable : 1
  SOCKSPort : 8889
  SOCKSProxy : 127.0.0.1
}
''';

void main() {
  // Reads the macOS HTTPS proxy (preferred over HTTP) and the exceptions list.
  test('parses scutil output', () {
    final p = parseScutil(_scutil)!;
    expect((p.host, p.port, p.url), ('10.0.0.2', 7890, 'http://10.0.0.2:7890'));
    expect(p.exceptions, [
      '192.168.0.0/16',
      '10.0.0.0/8',
      '*.corp.example',
      'nas',
    ]);
    expect(parseScutil('<dictionary> {\n  HTTPEnable : 0\n}'), isNull);
  });

  // Localhost, LAN ranges and excepted hosts connect directly; the rest go through the proxy.
  test('bypass rules', () {
    final p = parseScutil(_scutil)!;
    for (final h in [
      'localhost',
      '127.0.0.1',
      'printer.local',
      '192.168.1.5',
      '10.9.9.9',
      'a.corp.example',
      'nas',
    ]) {
      expect(p.findProxy(Uri.parse('http://$h/')), 'DIRECT', reason: h);
    }
    for (final h in [
      'music.example.org',
      '193.168.1.1',
      'corp.example.com',
      'nas2',
    ]) {
      expect(
        p.findProxy(Uri.parse('https://$h/')),
        'PROXY 10.0.0.2:7890',
        reason: h,
      );
    }
  });
}
