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

    // Handled directly when idle.
    await deliver(_msg(0));
    expect(seen, [0]);

    // Two arriving mid-frame (during build): handled in order after the frame ends.
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
    // One arriving while idle with others queued also goes behind them.
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
