import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/theme.dart';

/// Leaf runs of [span] as (text, effective weight) pairs.
List<(String, FontWeight?)> runs(InlineSpan span, [FontWeight? parent]) {
  final out = <(String, FontWeight?)>[];
  void walk(InlineSpan s, FontWeight? w) {
    if (s is! TextSpan) return;
    final ew = s.style?.fontWeight ?? w;
    if (s.text != null) out.add((s.text!, ew));
    for (final c in s.children ?? const <InlineSpan>[]) {
      walk(c, ew);
    }
  }

  walk(span, parent);
  return out;
}

void main() {
  tearDown(() => debugDefaultTargetPlatformOverride = null);

  group('cjkWeight on macOS', () {
    setUp(() => debugDefaultTargetPlatformOverride = TargetPlatform.macOS);

    test('small text drops one step', () {
      expect(cjkWeight(w700, 15), FontWeight.w500);
      expect(cjkWeight(w600, 13), FontWeight.w500);
      expect(cjkWeight(w500, 13), FontWeight.w400);
      expect(cjkWeight(FontWeight.w400, 13), FontWeight.w400);
    });

    test('large text is capped at Semibold', () {
      expect(cjkWeight(w900, 34), w600);
      expect(cjkWeight(w800, 22), w600);
      expect(cjkWeight(w600, 22), w600);
      expect(cjkWeight(w500, 22), w500);
    });
  });

  test('other platforms keep the requested weight', () {
    for (final p in [TargetPlatform.windows, TargetPlatform.linux]) {
      debugDefaultTargetPlatformOverride = p;
      expect(cjkWeight(w900, 34), w900);
      expect(cjkWeight(w700, 15), w700);
      final s = TextSpan(
        text: '粤语 mean',
        style: ts(15, w: w700),
      );
      expect(identical(cjkify(s, const TextStyle()), s), isTrue);
    }
  });

  group('cjkify on macOS', () {
    setUp(() => debugDefaultTargetPlatformOverride = TargetPlatform.macOS);

    test('splits mixed text and only reweights CJK runs', () {
      final s = cjkSpan('欧美流行｜没有不mean的义务', ts(15, w: w700));
      expect(s.toPlainText(), '欧美流行｜没有不mean的义务');
      expect(runs(s), [
        ('欧美流行｜没有不', FontWeight.w500),
        ('mean', w700),
        ('的义务', FontWeight.w500),
      ]);
    });

    test('leaves Latin-only text untouched', () {
      final s = TextSpan(
        text: 'She’s the Best',
        style: ts(34, w: w900),
      );
      expect(identical(cjkify(s, const TextStyle()), s), isTrue);
    });

    test('keeps recognizers on every split run', () {
      final tap = TapGestureRecognizer();
      addTearDown(tap.dispose);
      final s = cjkify(
        TextSpan(
          style: ts(13, w: w600),
          children: [TextSpan(text: '周深 Zhou', recognizer: tap)],
        ),
        const TextStyle(),
      );
      final leaves = <TextSpan>[];
      s.visitChildren((c) {
        if (c is TextSpan && c.text != null) leaves.add(c);
        return true;
      });
      expect(leaves.map((l) => l.text), ['周深', ' Zhou']);
      expect(leaves.every((l) => l.recognizer == tap), isTrue);
    });
  });

  testWidgets(
    'tx() inherits weight from its own style on macOS',
    variant: TargetPlatformVariant.only(TargetPlatform.macOS),
    (tester) async {
      await tester.pumpWidget(
        Directionality(
          textDirection: TextDirection.ltr,
          child: tx('粤语女声', 34, w: w900),
        ),
      );
      final t = tester.widget<Text>(find.byType(Text));
      expect(runs(t.textSpan!, w900), [('粤语女声', w600)]);
      expect(find.text('粤语女声'), findsOneWidget);
    },
  );
}
