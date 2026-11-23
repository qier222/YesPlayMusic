import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:path/path.dart' as p;
import 'package:yesplaymusic/log.dart';

void main() {
  late Directory tmp;
  setUp(() => tmp = Directory.systemTemp.createTempSync('ypm_log_'));
  tearDown(() {
    AppLog.close();
    tmp.deleteSync(recursive: true);
  });

  String read() => File(p.join(tmp.path, 'app.log')).readAsStringSync();

  // debugPrint and unhandled exceptions are written to the file; close restores the original callbacks.
  test('captures debugPrint and uncaught errors', () {
    final printBefore = debugPrint;
    final platformBefore = PlatformDispatcher.instance.onError;
    AppLog.init(tmp.path);
    AppLog.captureErrors();
    debugPrint('你好 log');
    expect(
      PlatformDispatcher.instance.onError!(
        StateError('boom'),
        StackTrace.current,
      ),
      isTrue,
    );
    final text = read();
    expect(text, contains(' I 你好 log'));
    expect(text, contains(' E Bad state: boom'));
    AppLog.close();
    expect(debugPrint, same(printBefore));
    expect(PlatformDispatcher.instance.onError, same(platformBefore));
  });

  // An old log over 1 MB is rotated to app.1.log at launch.
  test('rotates a big log on start', () {
    File(p.join(tmp.path, 'app.log'))
        .writeAsStringSync('x' * (AppLog.rotateBytes + 1));
    AppLog.init(tmp.path);
    AppLog.write('I', 'new');
    expect(
      File(p.join(tmp.path, 'app.1.log')).lengthSync(),
      AppLog.rotateBytes + 1,
    );
    expect(read(), endsWith(' I new\n'));
  });

  // After 5 MB in one run, only one notice line is left and nothing more is written.
  test('caps one session', () {
    AppLog.init(tmp.path);
    final big = 'y' * (1 << 20);
    for (var i = 0; i < 6; i++) {
      AppLog.write('I', big);
    }
    AppLog.write('I', 'after');
    final text = read();
    expect(text.length, lessThan(AppLog.sessionBytes + 200));
    expect(text, contains('Log limit reached'));
    expect(text, isNot(contains('after')));
  });

  // Credentials are masked before writing; everything else is unchanged.
  test('redacts credentials', () {
    expect(
      AppLog.redact('Cookie: MUSIC_U=abc; os=pc\nnext line'),
      'Cookie: ***\nnext line',
    );
    expect(
      AppLog.redact('headers {authorization: Bearer xyz}'),
      'headers {authorization: ***',
    );
    expect(
      AppLog.redact('GET /a?access_token=t1&id=3&password=p%40ss done'),
      'GET /a?access_token=***&id=3&password=*** done',
    );
    expect(
      AppLog.redact('{"token": "t2", "name": "晚风", "Password":"x"}'),
      '{"token": "***", "name": "晚风", "Password":"***"}',
    );
    expect(AppLog.redact('播放 晚风 失败：404'), '播放 晚风 失败：404');

    AppLog.init(tmp.path);
    AppLog.write('I', 'set-cookie: sid=1');
    expect(read(), endsWith(' I set-cookie: ***\n'));
    expect(AppLog.dir, tmp.path);
  });
}
