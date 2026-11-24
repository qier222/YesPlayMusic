import 'package:flutter/gestures.dart';
import 'package:flutter/widgets.dart';

import '../data.dart';
import '../state.dart';
import '../theme.dart';

/// A piece of text that may be tappable; when [route] is empty it's plain text (e.g. a separator).
typedef LinkPart = ({String text, String? route});

/// Each artist of a song, each with its artist page (null when it can't be opened).
List<LinkPart> artistLinks(AppState app, Track t) {
  final r = t.ref;
  if (r == null || r.artists.isEmpty) return [(text: t.artist, route: null)];
  return [
    for (final a in r.artists)
      (text: a.name, route: app.artistRouteFor(r.source, a.id)),
  ];
}

/// A song's album name, with the album page.
List<LinkPart> albumLinks(AppState app, Track t) =>
    t.album.isEmpty ? const [] : [(text: t.album, route: app.albumRouteOf(t))];

/// Joins several groups of links with [sep], separating items within a group with [inner]. Empty groups are skipped.
List<LinkPart> joinLinks(
  List<List<LinkPart>> groups, {
  String sep = '，',
  String inner = ', ',
}) {
  final out = <LinkPart>[];
  for (final g in groups.where((g) => g.isNotEmpty)) {
    if (out.isNotEmpty) out.add((text: sep, route: null));
    for (final (i, p) in g.indexed) {
      if (i > 0) out.add((text: inner, route: null));
      out.add(p);
    }
  }
  return out;
}

/// A line of text whose tappable parts each have their own hover ([hover] color + underline) and open the matching page
/// (collapsing Now Playing first if open). The whole line is one Text and ellipsizes as usual when it doesn't fit.
class LinkText extends StatefulWidget {
  const LinkText(
    this.parts, {
    super.key,
    required this.style,
    this.hover,
    this.lines = 1,
  });
  final List<LinkPart> parts;
  final TextStyle style;

  /// Hover color; [P.ink] by default.
  final Color? hover;
  final int lines;

  @override
  State<LinkText> createState() => _LinkTextState();
}

class _LinkTextState extends State<LinkText> {
  int? _hover;
  final _taps = <TapGestureRecognizer>[];

  @override
  void dispose() {
    for (final r in _taps) {
      r.dispose();
    }
    super.dispose();
  }

  TapGestureRecognizer _tap(int i, String route) {
    while (_taps.length <= i) {
      _taps.add(TapGestureRecognizer());
    }
    return _taps[i]..onTap = () => context.appRead.open(route);
  }

  @override
  Widget build(BuildContext context) {
    final hc = widget.hover ?? P.ink;
    return CjkText.rich(
      TextSpan(
        children: [
          for (final (i, p) in widget.parts.indexed)
            p.route == null
                ? TextSpan(text: p.text)
                : TextSpan(
                    text: p.text,
                    mouseCursor: SystemMouseCursors.click,
                    onEnter: (_) => setState(() => _hover = i),
                    onExit: (_) {
                      if (mounted && _hover == i) setState(() => _hover = null);
                    },
                    recognizer: _tap(i, p.route!),
                    style: _hover == i
                        ? TextStyle(
                            color: hc,
                            decoration: TextDecoration.underline,
                            decorationColor: hc,
                          )
                        : null,
                  ),
        ],
      ),
      style: widget.style,
      maxLines: widget.lines,
      overflow: TextOverflow.ellipsis,
      softWrap: widget.lines != 1,
    );
  }
}
