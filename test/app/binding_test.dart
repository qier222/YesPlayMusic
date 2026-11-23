import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/binding.dart';

class _Inner implements BinaryMessenger {
  final handlers = <String, MessageHandler>{};
  @override
  void setMessageHandler(String channel, MessageHandler? h) =>
      h == null ? handlers.remove(channel) : handlers[channel] = h;
  @override
  dynamic noSuchMethod(Invocation i) => super.noSuchMethod(i);
}

ByteData _msg(int n) => ByteData(1)..setUint8(0, n);

void main() {
  testWidgets('text input that arrives mid-frame waits for the frame to end', (
    tester,
  ) async {
    final inner = _Inner();
    final seen = <int>[];
    TextInputDeferral(inner)
        .setMessageHandler(SystemChannels.textInput.name, (d) async {
          seen.add(d!.getUint8(0));
          return null;
        });
    final deliver = inner.handlers[SystemChannels.textInput.name]!;

    // 空闲时直接处理。
    await deliver(_msg(0));
    expect(seen, [0]);

    // 一帧中间（build 里）到达的两条：这一帧结束后按顺序处理。
    var inFrame = <int>[];
    await tester.pumpWidget(
      Builder(
        builder: (_) {
          deliver(_msg(1));
          deliver(_msg(2));
          inFrame = List.of(seen);
          return const SizedBox();
        },
      ),
    );
    expect(inFrame, [0]);
    // 排着队时空闲到达的，也排在后面。
    await deliver(_msg(3));
    await tester.pump();
    expect(seen, [0, 1, 2, 3]);
  });

  testWidgets('other channels are not wrapped', (tester) async {
    final inner = _Inner();
    Future<ByteData?> h(ByteData? d) async => null;
    TextInputDeferral(inner).setMessageHandler('other', h);
    expect(identical(inner.handlers['other'], h), isTrue);
  });
}
