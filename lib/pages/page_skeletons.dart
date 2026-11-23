import 'package:flutter/widgets.dart';

import '../state.dart';
import '../theme.dart';
import '../ui.dart';

/// Loading skeleton for album, playlist and artist pages: same approach as the home skeleton ([HomeSkeleton]),
/// drawing only outlines positioned and sized like the loaded page, so the layout doesn't jump when content arrives.
/// The back button is real, so you can go back while loading.

// Cards and covers white 5%, text bars white 7% (black in light mode), same as the home skeleton.
Color get _card => P.dark ? wa(0.05) : ba(0.04);
Color get _bone => P.dark ? wa(0.07) : ba(0.06);

Widget _box({double? w, double? h, double r = 0, Color? c}) => Container(
  width: w,
  height: h,
  decoration: squircle(r, color: c ?? _card),
);

Widget _text(double w, [double h = 14]) => _box(w: w, h: h, r: h / 3, c: _bone);
Widget _dot(double d) => _box(w: d, h: d, r: d / 2);

/// Title bar lengths vary a little so it looks like a list of different song names.
const _widths = [220.0, 168.0, 252.0, 196.0, 140.0, 236.0, 180.0, 208.0];

/// A faint band of light sweeping left to right (same as the home skeleton).
class _Shine extends StatefulWidget {
  const _Shine({required this.child});
  final Widget child;

  @override
  State<_Shine> createState() => _ShineState();
}

class _ShineState extends State<_Shine> with SingleTickerProviderStateMixin {
  late final _c = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1400),
  )..repeat();

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final shine = P.dark ? wa(0.035) : const Color(0x80FFFFFF);
    return AnimatedBuilder(
      animation: _c,
      builder: (_, child) => ShaderMask(
        blendMode: BlendMode.srcATop,
        shaderCallback: (r) => LinearGradient(
          colors: [
            shine.withValues(alpha: 0),
            shine,
            shine.withValues(alpha: 0),
          ],
          stops: const [0.4, 0.5, 0.6],
          transform: _Slide(Curves.easeInOut.transform(_c.value) * 1.4 - 0.7),
        ).createShader(r),
        child: child,
      ),
      child: widget.child,
    );
  }
}

class _Slide extends GradientTransform {
  const _Slide(this.dx);
  final double dx;

  @override
  Matrix4 transform(Rect bounds, {TextDirection? textDirection}) =>
      Matrix4.translationValues(bounds.width * dx, 0, 0);
}

/// A column of song rows: [h] row height, [gap] row spacing, [cover] leading cover size (0 = no cover, draw the index).
Widget _rows({
  required double h,
  required double gap,
  double cover = 0,
  int count = 14,
}) => ClipRect(
  child: OverflowBox(
    alignment: Alignment.topLeft,
    maxHeight: double.infinity,
    child: Column(
      children: [
        for (var i = 0; i < count; i++)
          Padding(
            padding: EdgeInsets.only(bottom: gap),
            child: SizedBox(
              height: h,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  children: [
                    if (cover > 0) ...[
                      _box(w: cover, h: cover, r: 6),
                      const SizedBox(width: 12),
                    ] else ...[
                      _text(14, 12),
                      const SizedBox(width: 26),
                    ],
                    _text(_widths[i % _widths.length]),
                    const Spacer(),
                    _text(32, 12),
                  ],
                ),
              ),
            ),
          ),
      ],
    ),
  ),
);

// ───── Album ─────

/// Final · album page: a 400-wide cover and info on the left, track list on the right.
class AlbumSkeleton extends StatelessWidget {
  const AlbumSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.appRead;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 40),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 400,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20),
                BackBtn(onTap: app.back),
                const SizedBox(height: 36),
                _Shine(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _box(w: 400, h: 400, r: 20),
                      const SizedBox(height: 18),
                      _text(72, 13),
                      const SizedBox(height: 14),
                      _text(300, 52),
                      const SizedBox(height: 18),
                      Row(
                        children: [
                          _dot(28),
                          const SizedBox(width: 10),
                          _text(96, 15),
                        ],
                      ),
                      const SizedBox(height: 24),
                      Row(
                        children: [
                          _box(w: 112, h: 48, r: 24),
                          for (var i = 0; i < 3; i++) ...[
                            const SizedBox(width: 10),
                            _dot(48),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 64),
          Expanded(
            child: _Shine(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 96),
                  SizedBox(
                    height: 28,
                    child: Row(
                      children: [_text(48, 20), const Spacer(), _text(96, 13)],
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(height: 1, color: P.line),
                  const SizedBox(height: 12),
                  Expanded(child: _rows(h: 46, gap: 2)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ───── Playlist ─────

/// Final · playlist page: a 340-wide cover card on the left; search, sort and track list on the right.
class PlaylistSkeleton extends StatelessWidget {
  const PlaylistSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.appRead;
    return Stack(
      children: [
        Positioned(left: 40, top: 20, child: BackBtn(onTap: app.back)),
        Positioned(
          left: 40,
          top: 84,
          child: _Shine(
            child: Container(
              width: 340,
              height: 600,
              padding: const EdgeInsets.all(20),
              decoration: squircle(32, color: _card),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _box(w: 300, h: 300, r: 16, c: _bone),
                  const SizedBox(height: 24),
                  _text(220, 22),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      _box(w: 24, h: 24, r: 12, c: _bone),
                      const SizedBox(width: 8),
                      _text(88, 13),
                    ],
                  ),
                  const SizedBox(height: 18),
                  _text(260, 12),
                  const SizedBox(height: 8),
                  _text(200, 12),
                  const Spacer(),
                  Row(
                    children: [
                      _box(w: 112, h: 48, r: 24, c: _bone),
                      for (var i = 0; i < 2; i++) ...[
                        const SizedBox(width: 10),
                        _box(w: 48, h: 48, r: 24, c: _bone),
                      ],
                    ],
                  ),
                  const SizedBox(height: 4),
                ],
              ),
            ),
          ),
        ),
        Positioned(
          left: 412,
          right: 40,
          top: 84,
          bottom: 0,
          child: _Shine(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  height: 40,
                  child: Row(
                    children: [
                      _box(w: 240, h: 40, r: 20),
                      const Spacer(),
                      for (final w in [32.0, 60.0, 60.0]) ...[
                        const SizedBox(width: 24),
                        _text(w),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: SizedBox(
                    height: 14,
                    child: Row(children: [_text(240, 12)]),
                  ),
                ),
                const SizedBox(height: 7),
                Container(height: 1, color: P.line),
                const SizedBox(height: 11),
                Expanded(child: _rows(h: 52, gap: 4, cover: 40)),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

// ───── Artist ─────

/// Final · artist page: avatar and name, latest release + top songs, a row of albums below.
class ArtistSkeleton extends StatelessWidget {
  const ArtistSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.appRead;
    return ClipRect(
      child: SingleChildScrollView(
        physics: const NeverScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(40, 20, 40, 140),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            BackBtn(onTap: app.back),
            const SizedBox(height: 32),
            _Shine(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      _dot(148),
                      const SizedBox(width: 32),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _text(36, 13),
                          const SizedBox(height: 12),
                          _text(320, 52),
                        ],
                      ),
                      const Spacer(),
                      _box(w: 96, h: 48, r: 24),
                      const SizedBox(width: 10),
                      _dot(48),
                    ],
                  ),
                  const SizedBox(height: 48),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(
                        width: 400,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            SizedBox(
                              height: 28,
                              child: Align(
                                alignment: Alignment.centerLeft,
                                child: _text(88, 20),
                              ),
                            ),
                            const SizedBox(height: 16),
                            _box(w: 400, h: 276, r: 28),
                          ],
                        ),
                      ),
                      const SizedBox(width: 56),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            SizedBox(
                              height: 28,
                              child: Align(
                                alignment: Alignment.centerLeft,
                                child: _text(88, 20),
                              ),
                            ),
                            const SizedBox(height: 14),
                            for (var i = 0; i < 5; i++)
                              SizedBox(
                                height: 52,
                                child: Row(
                                  children: [
                                    _box(w: 40, h: 40, r: 6),
                                    const SizedBox(width: 12),
                                    _text(_widths[i]),
                                    const Spacer(),
                                    _text(32, 12),
                                    const SizedBox(width: 20),
                                  ],
                                ),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 36),
                  SizedBox(
                    height: 28,
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        _text(56, 20),
                        const SizedBox(width: 28),
                        _text(96, 20),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  LayoutBuilder(
                    builder: (context, c) {
                      final w = (c.maxWidth - 20 * 5) / 6;
                      return Row(
                        children: [
                          for (var i = 0; i < 6; i++) ...[
                            if (i > 0) const SizedBox(width: 20),
                            _box(w: w, h: w, r: 14),
                          ],
                        ],
                      );
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
