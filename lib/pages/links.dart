import 'package:flutter/gestures.dart';
import 'package:flutter/widgets.dart';

import '../data.dart';
import '../state.dart';
import '../theme.dart';

/// 一段可能能点的文字；[route] 为空就是普通文字（比如分隔符）。
typedef LinkPart = ({String text, String? route});

/// 一首歌的每位艺人，各自带艺人页（去不了的为 null）。
List<LinkPart> artistLinks(AppState app, Track t) {
  final r = t.ref;
  if (r == null || r.artists.isEmpty) return [(text: t.artist, route: null)];
  return [
    for (final a in r.artists)
      (text: a.name, route: app.artistRouteFor(r.source, a.id)),
  ];
}

/// 一首歌的专辑名，带专辑页。
List<LinkPart> albumLinks(AppState app, Track t) =>
    t.album.isEmpty ? const [] : [(text: t.album, route: app.albumRouteOf(t))];

/// 把几组链接用 [sep] 接起来；组内用 [inner] 隔开。空组跳过。
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

/// 一行文字，里面能点的部分各自悬停（变 [hover] 色 + 下划线），点了去对应页面
/// （正在播放开着就先收起）。整行一个 Text，放不下照常省略。
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

  /// 悬停颜色；默认 [P.ink]。
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
    return Text.rich(
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
