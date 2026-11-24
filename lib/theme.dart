import 'dart:math' as math;

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

import 'l10n/l10n.dart';

/// The design's "Color Tokens · dark / light".
class Palette {
  const Palette({
    required this.dark,
    required this.ground,
    required this.surface,
    required this.raised,
    required this.hover,
    required this.line,
    required this.ink,
    required this.muted,
    required this.faint,
    required this.thumb,
    required this.floating,
    required this.tip,
  });

  final bool dark;
  final Color ground; // page background
  final Color surface; // cards, list hover
  final Color raised; // buttons, inputs, tracks
  final Color hover; // button hover
  final Color line; // dividers
  final Color ink; // primary text, icons
  final Color muted; // secondary text
  final Color faint; // tertiary text
  final Color thumb; // segment selection / switch knob
  final Color floating; // mini player bar
  final Color tip; // tooltip pill

  static const darkPalette = Palette(
    dark: true,
    ground: Color(0xFF0B0B0D),
    surface: Color(0xFF18181B),
    raised: Color(0xFF242428),
    hover: Color(0xFF303036),
    line: Color(0x0FFFFFFF),
    ink: Color(0xFFF7F7F8),
    muted: Color(0xFFA1A1AA),
    faint: Color(0xFF85858F),
    thumb: Color(0xFFF7F7F8),
    floating: Color(0xFF18181B),
    tip: Color(0xFF2E2E33),
  );

  static const lightPalette = Palette(
    dark: false,
    ground: Color(0xFFFFFFFF),
    surface: Color(0xFFF4F4F5),
    raised: Color(0xFFE4E4E7),
    hover: Color(0xFFD9D9DE),
    line: Color(0x0A0B0B0D),
    ink: Color(0xFF0B0B0D),
    muted: Color(0xFF52525B),
    faint: Color(0xFF71717A),
    thumb: Color(0xFFFFFFFF),
    floating: Color(0xFFFFFFFF),
    tip: Color(0xFF2E2E33),
  );
}

/// The global current palette. The whole tree rebuilds when the theme changes.
Palette P = Palette.darkPalette;

/// Theme colors (changeable in Settings), dark and light sets.
Color accent = const Color(0xFFD6B0FA);

const swatchesDark = [
  Color(0xFFD6B0FA),
  Color(0xFF8EC5FF),
  Color(0xFF8FE3C0),
  Color(0xFFF6C453),
  Color(0xFFFF9EB5),
  Color(0xFFFF9A5C),
];
const swatchesLight = [
  Color(0xFF7C4FD6),
  Color(0xFF2F7DE1),
  Color(0xFF1F9E6E),
  Color(0xFFC88A0A),
  Color(0xFFD6406A),
  Color(0xFFD9601E),
];
List<String> swatchNamesOf(AppLocalizations l) => [
  l.swatchLilac,
  l.swatchSky,
  l.swatchMint,
  l.swatchSun,
  l.swatchRose,
  l.swatchFlame,
];

const heart = Color(0xFFFF5C7A);
const wine = Color(0xFF7B1D2E); // Moon River cover color
const white = Color(0xFFFFFFFF);
const black = Color(0xFF000000);
const darkInk = Color(0xFF0B0B0D);

/// A translucent version of a solid color: over the page background P.ground it looks exactly like [solid];
/// over a cover-color background the color underneath shows through instead of an abrupt gray block.
/// Uses the smallest achievable opacity, with the color solved back from the background.
Color glass(Color solid) {
  final g = P.ground;
  final gs = [g.r, g.g, g.b], ts = [solid.r, solid.g, solid.b];
  // Dark theme layers toward lighter
  final up = ts[0] + ts[1] + ts[2] >= gs[0] + gs[1] + gs[2];
  var a = 0.0;
  for (var i = 0; i < 3; i++) {
    final room = up ? 1 - gs[i] : gs[i];
    final need = (ts[i] - gs[i]).abs();
    if (room > 0 && need / room > a) a = need / room;
  }
  if (a == 0) return solid.withValues(alpha: 0);
  double ch(int i) => (gs[i] + (ts[i] - gs[i]) / a).clamp(0.0, 1.0);
  return Color.from(alpha: a, red: ch(0), green: ch(1), blue: ch(2));
}

Color wa(double a) => Color.fromRGBO(255, 255, 255, a);
Color ba(double a) => Color.fromRGBO(0, 0, 0, a);

/// Continuous-corner (superellipse) decoration, used everywhere instead of a rounded [BoxDecoration].
ShapeDecoration squircle(
  double radius, {
  Color? color,
  Gradient? gradient,
  DecorationImage? image,
  BorderSide? side,
  List<BoxShadow>? shadows,
}) {
  return ShapeDecoration(
    color: color,
    gradient: gradient,
    image: image,
    shadows: shadows,
    shape: RoundedSuperellipseBorder(
      borderRadius: BorderRadius.circular(radius),
      side: side ?? BorderSide.none,
    ),
  );
}

/// Fonts: Archivo's three widths split into three families.
enum F { body, semi, wide }

const _families = {
  F.body: 'Archivo',
  F.semi: 'ArchivoSemi',
  F.wide: 'ArchivoWide',
};
const _fallback = [
  'PingFang SC',
  'PingFang TC',
  'Hiragino Sans GB',
  'Hiragino Sans',
  'Apple SD Gothic Neo',
  'Heiti SC',
  'Microsoft YaHei',
  'Noto Sans CJK SC',
];

TextStyle ts(
  double size, {
  FontWeight w = FontWeight.w600,
  Color? c,
  F f = F.body,
  double? h,
  bool tnum = false,
  double? ls,
}) {
  return TextStyle(
    fontFamily: _families[f],
    fontFamilyFallback: _fallback,
    fontSize: size,
    fontWeight: w,
    color: c ?? P.ink,
    height: h,
    letterSpacing: ls,
    fontFeatures: tnum ? const [FontFeature.tabularFigures()] : null,
    decoration: TextDecoration.none,
  );
}

/// Single-line ellipsized text.
Widget tx(
  String s,
  double size, {
  FontWeight w = FontWeight.w600,
  Color? c,
  F f = F.body,
  bool tnum = false,
  int? lines = 1,
  double? h,
  TextAlign? align,
  Key? key,
}) {
  return CjkText(
    s,
    key: key,
    maxLines: lines,
    overflow: lines == null ? null : TextOverflow.ellipsis,
    softWrap: lines != 1,
    textAlign: align,
    style: ts(size, w: w, c: c, f: f, tnum: tnum, h: h),
  );
}

/// Weight for CJK glyphs drawn at [size] when the surrounding text asks for [w].
///
/// macOS falls back to PingFang for CJK, whose heaviest face is Semibold (600).
/// Asking for w800/w900 makes Flutter fake-bold that face, and at 13–16pt even
/// real Semibold fills in the gaps of dense characters (粤, 霄). So on macOS
/// CJK runs are capped at Semibold, and small text drops one step.
FontWeight cjkWeight(FontWeight w, double size) {
  if (defaultTargetPlatform != TargetPlatform.macOS) return w;
  if (size <= 16) {
    if (w.value >= 600) return FontWeight.w500;
    if (w.value == 500) return FontWeight.w400;
    return w;
  }
  return w.value > 600 ? FontWeight.w600 : w;
}

bool _isCjk(int r) =>
    (r >= 0x2E80 &&
        r <= 0x9FFF) || // radicals, CJK punctuation, kana, ideographs
    (r >= 0xF900 && r <= 0xFAFF) || // compatibility ideographs
    (r >= 0xFE30 && r <= 0xFE4F) || // compatibility forms
    (r >= 0xFF00 && r <= 0xFFEF) || // fullwidth forms
    (r >= 0x20000 && r <= 0x3FFFF); // extension ideographs

/// Rebuilds [span] so CJK runs carry [cjkWeight] of the weight they inherit.
/// [inherited] is the style the span is laid out under (DefaultTextStyle merged
/// with the widget's style). Returns [span] itself when nothing changes.
InlineSpan cjkify(InlineSpan span, TextStyle inherited) {
  if (span is! TextSpan) return span;
  final eff = inherited.merge(span.style);
  final w = eff.fontWeight ?? FontWeight.w400;
  final cw = cjkWeight(w, eff.fontSize ?? 14);
  final kids = span.children;
  final newKids = kids?.map((k) => cjkify(k, eff)).toList();
  final kidsChanged =
      newKids != null &&
      Iterable.generate(kids!.length)
          .any((i) => !identical(kids[i], newKids[i]));
  final text = span.text;
  final runs = <InlineSpan>[];
  if (text != null && cw != w && text.runes.any(_isCjk)) {
    final buf = StringBuffer();
    bool? cur;
    void flush() {
      if (buf.isEmpty) return;
      runs.add(
        TextSpan(
          text: buf.toString(),
          style: cur! ? TextStyle(fontWeight: cw) : null,
          recognizer: span.recognizer,
          mouseCursor: span.mouseCursor,
          onEnter: span.onEnter,
          onExit: span.onExit,
        ),
      );
      buf.clear();
    }

    for (final r in text.runes) {
      final c = _isCjk(r);
      if (cur != null && c != cur) flush();
      cur = c;
      buf.writeCharCode(r);
    }
    flush();
  }
  if (runs.isEmpty && !kidsChanged) return span;
  return TextSpan(
    style: span.style,
    text: runs.isEmpty ? text : null,
    children: [...runs, ...?(newKids ?? kids)],
    recognizer: span.recognizer,
    mouseCursor: span.mouseCursor,
    onEnter: span.onEnter,
    onExit: span.onExit,
    semanticsLabel: span.semanticsLabel,
    locale: span.locale,
    spellOut: span.spellOut,
  );
}

/// [text] in [style] as a span with CJK weights applied, for TextPainter measuring.
InlineSpan cjkSpan(String text, TextStyle style) =>
    cjkify(TextSpan(text: text, style: style), const TextStyle());

/// [Text] that draws CJK runs at [cjkWeight]. Use it instead of Text for UI copy.
class CjkText extends StatelessWidget {
  const CjkText(
    String this.data, {
    super.key,
    this.style,
    this.textAlign,
    this.maxLines,
    this.overflow,
    this.softWrap,
    this.strutStyle,
  }) : span = null;

  const CjkText.rich(
    InlineSpan this.span, {
    super.key,
    this.style,
    this.textAlign,
    this.maxLines,
    this.overflow,
    this.softWrap,
    this.strutStyle,
  }) : data = null;

  final String? data;
  final InlineSpan? span;
  final TextStyle? style;
  final TextAlign? textAlign;
  final int? maxLines;
  final TextOverflow? overflow;
  final bool? softWrap;
  final StrutStyle? strutStyle;

  @override
  Widget build(BuildContext context) {
    final eff = DefaultTextStyle.of(context).style.merge(style);
    return Text.rich(
      cjkify(span ?? TextSpan(text: data), eff),
      style: style,
      textAlign: textAlign,
      maxLines: maxLines,
      overflow: overflow,
      softWrap: softWrap,
      strutStyle: strutStyle,
    );
  }
}

const w500 = FontWeight.w500;
const w600 = FontWeight.w600;
const w700 = FontWeight.w700;
const w800 = FontWeight.w800;
const w900 = FontWeight.w900;

/// Common animation durations and curves.
const fast = Duration(milliseconds: 120);
const medium = Duration(milliseconds: 200);

/// A spring curve with a little bounce (approximating the spring in the Sketch prototype).
class SpringCurve extends Curve {
  const SpringCurve({this.bounce = 0.15});
  final double bounce;

  @override
  double transformInternal(double t) {
    // Damped oscillation: the larger the bounce, the more overshoot.
    final zeta = 1 - bounce.clamp(0.0, 0.9);
    const omega = 12.0;
    if (zeta >= 1) {
      return 1 - (1 + omega * t) * math.exp(-omega * t);
    }
    final wd = omega * math.sqrt(1 - zeta * zeta);
    return 1 -
        math.exp(-zeta * omega * t) *
            (math.cos(wd * t) + (zeta * omega / wd) * math.sin(wd * t));
  }
}

const bouncy = SpringCurve(bounce: 0.3);
const snappy = Curves.easeOutCubic;
const smooth = Curves.easeOutQuart;
