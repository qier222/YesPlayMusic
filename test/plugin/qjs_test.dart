import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/plugin/qjs.dart';

void main() {
  late JsRuntime js;
  final calls = <String>[];

  setUp(() {
    calls.clear();
    js = JsRuntime(
      memoryLimit: 8 << 20,
      host: (op, json) {
        calls.add('$op $json');
        if (op == 'fail') throw HostError('nope');
        return op == 'echo' ? json : null;
      },
    );
  });
  tearDown(() => js.dispose());

  // JS 通过 __host 同步拿到 Dart 的返回值（含中文）；Dart 抛 HostError 时 JS 能接住。
  test('host round trip', () {
    js.eval('''
      globalThis.r = __host("echo", "晚風");
      try { __host("fail", "") } catch (e) { __host("got", e.message) }
      __host("back", r);
    ''');
    expect(calls, ['echo 晚風', 'fail ', 'got nope', 'back 晚風']);
  });

  // Promise 要 pump 才会往下走。
  test('promises run on pump', () {
    js.eval('Promise.resolve(1).then(v => __host("done", String(v)))');
    expect(calls, isEmpty);
    js.pump();
    expect(calls, ['done 1']);
  });

  // 语法错误、未接住的异常带消息和栈。
  test('errors carry message', () {
    expect(
      () => js.eval('throw new TypeError("bad")'),
      throwsA(
        isA<JsError>().having(
          (e) => e.message,
          'm',
          contains('TypeError: bad'),
        ),
      ),
    );
  });

  // 死循环在时限后被中断；中断后运行时还能用。
  test('budget interrupts infinite loop', () {
    final sw = Stopwatch()..start();
    expect(
      () => js.eval('for(;;){}', budgetMs: 200),
      throwsA(
        isA<JsError>().having((e) => e.interrupted, 'interrupted', isTrue),
      ),
    );
    expect(sw.elapsedMilliseconds, lessThan(2000));
    js.eval('__host("alive", "")');
    expect(calls, ['alive ']);
  });

  // 超出内存上限抛错而不是拖垮进程。
  test('memory limit', () {
    expect(
      () => js.eval('const a = []; for(;;) a.push(new Array(1e5).fill(1))'),
      throwsA(isA<JsError>().having((e) => e.outOfMemory, 'oom', isTrue)),
    );
  });

  // 没有文件、进程等能力。
  test('no std/os', () {
    js.eval(
      '__host("t", [typeof std, typeof os, typeof require, typeof process].join())',
    );
    expect(calls, ['t undefined,undefined,undefined,undefined']);
  });
}
