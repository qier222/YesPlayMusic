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

  // JS gets Dart's return value synchronously through __host (including CJK); when Dart throws HostError, JS can catch it.
  test('host round trip', () {
    js.eval('''
      globalThis.r = __host("echo", "晚風");
      try { __host("fail", "") } catch (e) { __host("got", e.message) }
      __host("back", r);
    ''');
    expect(calls, ['echo 晚風', 'fail ', 'got nope', 'back 晚風']);
  });

  // Promises only advance when pumped.
  test('promises run on pump', () {
    js.eval('Promise.resolve(1).then(v => __host("done", String(v)))');
    expect(calls, isEmpty);
    js.pump();
    expect(calls, ['done 1']);
  });

  // Syntax errors and uncaught exceptions carry a message and stack.
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

  // Infinite loops are interrupted after the time limit; the runtime still works afterwards.
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

  // Exceeding the memory limit throws instead of taking down the process.
  test('memory limit', () {
    expect(
      () => js.eval('const a = []; for(;;) a.push(new Array(1e5).fill(1))'),
      throwsA(isA<JsError>().having((e) => e.outOfMemory, 'oom', isTrue)),
    );
  });

  // No file, process or similar capabilities.
  test('no std/os', () {
    js.eval(
      '__host("t", [typeof std, typeof os, typeof require, typeof process].join())',
    );
    expect(calls, ['t undefined,undefined,undefined,undefined']);
  });
}
