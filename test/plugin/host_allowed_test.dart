import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/plugin/manifest.dart';

void main() {
  group('hostAllowed', () {
    test('exact host, case-insensitive', () {
      expect(hostAllowed('api.example.com', ['api.example.com']), true);
      expect(hostAllowed('API.Example.com', [' api.example.COM ']), true);
      expect(hostAllowed('other.example.com', ['api.example.com']), false);
    });

    test('wildcard matches subdomains only', () {
      const allowed = ['*.example.com'];
      expect(hostAllowed('a.example.com', allowed), true);
      expect(hostAllowed('a.b.example.com', allowed), true);
      expect(hostAllowed('example.com', allowed), false);
      expect(hostAllowed('evilexample.com', allowed), false);
      expect(hostAllowed('example.com.evil.net', allowed), false);
    });

    test('* allows any non-empty host', () {
      expect(hostAllowed('anything.net', ['*']), true);
      expect(hostAllowed('', ['*']), false);
    });

    test('{setting:key} uses the host from settings', () {
      String? lookup(String key) => key == 'server' ? 'Music.Local' : null;
      const allowed = ['{setting:server}'];
      expect(hostAllowed('music.local', allowed, settingHost: lookup), true);
      expect(hostAllowed('other.local', allowed, settingHost: lookup), false);
      expect(
        hostAllowed('music.local', ['{setting:missing}'], settingHost: lookup),
        false,
      );
      // Without a resolver the placeholder never matches.
      expect(hostAllowed('music.local', allowed), false);
    });

    test('empty list allows nothing', () {
      expect(hostAllowed('example.com', const []), false);
    });
  });
}
