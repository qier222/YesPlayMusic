import 'dart:math' as math;

import 'package:flutter/widgets.dart';

import '../cover_color.dart';
import '../data.dart';
import '../l10n/l10n.dart';
import '../menus.dart';
import '../state.dart';
import '../theme.dart';
import '../ui.dart';
import 'common.dart';
import 'library.dart' show HeartSmall;
import 'links.dart';

/// Content shown on the playlist page.
class PlaylistData {
  const PlaylistData({
    required this.name,
    required this.owner,
    required this.description,
    required this.cover,
    required this.rows,
    this.count = 0,
    this.from = '',
    this.tags = const [],
    this.editable = '',
  });

  /// The id in the source of the user's own playlist: enables "Remove from playlist" in the context menu. Empty for other people's playlists.
  final String editable;

  final String name, owner, description, cover;

  /// Each row: the song and its "Date added" text.
  final List<({Track track, String added})> rows;

  /// Song count reported by the source; when 0, the number of [rows].
  final int count;

  /// [AppState.queueFrom] when a song is double-clicked to play.
  final String from;
  final List<(String, String)> tags;

  int get total => count > 0 ? count : rows.length;
  int get seconds => rows.fold(0, (a, r) => a + r.track.seconds);
}

class PlaylistPage extends StatefulWidget {
  const PlaylistPage({super.key, required this.data});
  final PlaylistData data;

  @override
  State<PlaylistPage> createState() => _PlaylistPageState();
}

class _PlaylistPageState extends State<PlaylistPage> {
  final _filter = TextEditingController();
  final _focus = FocusNode();
  int _sort = 0;

  @override
  void initState() {
    super.initState();
    _focus.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _filter.dispose();
    _focus.dispose();
    super.dispose();
  }

  PlaylistData get _data => widget.data;

  /// Songs (keys) removed from the playlist this time; removed from the list right away.
  final _removed = <String>{};

  List<({Track track, String added})> get _rows {
    final q = _filter.text.trim().toLowerCase();
    final rows = _data.rows.where((r) {
      final t = r.track;
      if (_removed.contains(t.key)) return false;
      return q.isEmpty ||
          '${t.title} ${t.artist} ${t.album}'.toLowerCase().contains(q);
    }).toList();
    int by(String a, String b) => a.toLowerCase().compareTo(b.toLowerCase());
    if (_sort == 1) rows.sort((a, b) => by(a.track.title, b.track.title));
    if (_sort == 2) rows.sort((a, b) => by(a.track.album, b.track.album));
    return rows;
  }

  /// Plays this playlist from [t]; songs that can't be played are left out of the queue. For [shuffled] see [AppState.playList].
  void _play(Track? t, {bool? shuffled}) {
    final app = context.appRead;
    final d = _data;
    final ok = [
      for (final r in d.rows)
        if (!(r.track.ref?.unavailable ?? false)) r.track,
    ];
    if (ok.isEmpty) return;
    app.playList(
      ok,
      start: t == null ? 0 : math.max(0, ok.indexOf(t)),
      name: d.name,
      from: d.from,
      shuffled: shuffled,
    );
  }

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final l = context.l10n;
    final rows = _rows;
    return Stack(
      children: [
        Positioned(left: 40, top: 20, child: BackBtn(onTap: app.back)),
        Positioned(
          left: 40,
          top: 84,
          child: FadeIn(
            dy: 20,
            child: _Panel(
              data: _data,
              onPlay: () => _play(null, shuffled: false),
              onShuffle: () => _play(null, shuffled: true),
            ),
          ),
        ),
        Positioned(
          left: 412,
          right: 40,
          top: 84,
          bottom: 0,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                height: 40,
                child: Row(
                  children: [
                    GestureDetector(
                      onTap: _focus.requestFocus,
                      child: AnimatedContainer(
                        duration: fast,
                        width: 240,
                        height: 40,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        decoration: squircle(
                          20,
                          color: P.dark
                              ? (_focus.hasFocus ? wa(0.12) : wa(0.08))
                              : (_focus.hasFocus ? ba(0.10) : ba(0.06)),
                        ),
                        child: Row(
                          children: [
                            Ico('search', size: 16, color: P.faint),
                            const SizedBox(width: 10),
                            Expanded(
                              child: InputBox(
                                controller: _filter,
                                focusNode: _focus,
                                placeholder: l.playlistSearchPlaceholder,
                                onChanged: (_) => setState(() {}),
                              ),
                            ),
                            if (_filter.text.isNotEmpty)
                              Tap(
                                onTap: () => setState(_filter.clear),
                                builder: (_, h, _) => Ico(
                                  'close',
                                  size: 16,
                                  color: h ? P.ink : P.faint,
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                    const Spacer(),
                    TextTabs(
                      labels: [l.sortDefault, l.sortTitleAZ, l.sortAlbumAZ],
                      selected: _sort,
                      onChanged: (i) => setState(() => _sort = i),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Row(
                  children: [
                    SizedBox(
                      width: 32,
                      child: tx('#', 12, w: w700, c: P.faint),
                    ),
                    SizedBox(
                      width: 336,
                      child: tx(l.playlistColTitle, 12, w: w700, c: P.faint),
                    ),
                    SizedBox(
                      width: 240,
                      child: tx(l.playlistColAlbum, 12, w: w700, c: P.faint),
                    ),
                    tx(l.playlistColAdded, 12, w: w700, c: P.faint),
                    const Spacer(),
                    Ico('clock', size: 16, color: P.faint),
                  ],
                ),
              ),
              const SizedBox(height: 7),
              Container(height: 1, color: P.line),
              const SizedBox(height: 11),
              Expanded(
                child: LayoutBuilder(
                  builder: (context, box) => OverflowBox(
                    alignment: Alignment.topCenter,
                    maxWidth: box.maxWidth + 16,
                    minWidth: box.maxWidth + 16,
                    child: rows.isEmpty
                        ? Padding(
                            padding: const EdgeInsets.fromLTRB(28, 40, 0, 0),
                            child: tx(
                              _filter.text.isEmpty
                                  ? l.playlistEmpty
                                  : l.playlistNoMatch(_filter.text),
                              14,
                              w: w600,
                              c: P.faint,
                            ),
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.only(bottom: 200),
                            itemCount: rows.length,
                            itemBuilder: (_, i) => Padding(
                              key: ValueKey('${rows[i].track.key}-$i-$_sort'),
                              padding: const EdgeInsets.only(bottom: 4),
                              child: FadeIn(
                                delay: math.min(i, 20) * 20,
                                child: _PlRowView(
                                  i: i,
                                  track: rows[i].track,
                                  added: rows[i].added,
                                  onPlay: () => _play(rows[i].track),
                                  playlist: _data.editable,
                                  onRemoved: () => setState(
                                    () => _removed.add(rows[i].track.key),
                                  ),
                                ),
                              ),
                            ),
                          ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _Panel extends StatelessWidget {
  const _Panel({
    required this.data,
    required this.onPlay,
    required this.onShuffle,
  });
  final PlaylistData data;
  final VoidCallback onPlay;
  final VoidCallback onShuffle;

  @override
  Widget build(BuildContext context) {
    final d = data;
    // Panel background is taken from the playlist cover
    return CoverTone(
      coverId: d.cover,
      builder: (context, pal) => _body(context, pal),
    );
  }

  Widget _body(BuildContext context, CoverPalette pal) {
    final l = context.l10n;
    final d = data;
    final meta = d.owner.isNotEmpty ? d.owner : l.countTracks(d.total);
    // Title is at most three lines; past two lines the description loses two lines, so the play button isn't pushed down
    final titleLines = _lines(d.name, _titleStyle, 294, 3);
    final base = d.tags.isEmpty ? 5 : 3;
    final descLines = titleLines > 2 ? math.max(1, base - 2) : base;
    // Card height floats slightly with the content: the button is 24 from the bottom, same as from the left
    return Container(
      width: 340,
      constraints: const BoxConstraints(minHeight: 600),
      padding: const EdgeInsets.all(20),
      decoration: squircle(32, color: pal.deep),
      child: IntrinsicHeight(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              decoration: squircle(
                16,
                shadows: [
                  BoxShadow(
                    color: ba(0.33),
                    blurRadius: 32,
                    offset: const Offset(0, 12),
                    spreadRadius: -8,
                  ),
                ],
              ),
              child: Cover(d.cover, w: 300, h: 300, r: 16),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 24),
                    tx(l.tabPlaylists, 13, w: w700, f: F.semi, c: wa(0.6)),
                    const SizedBox(height: 8),
                    Transform.translate(
                      offset: const Offset(-2, 0),
                      child: CjkText(
                        d.name,
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                        style: _titleStyle,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Container(
                          width: 24,
                          height: 24,
                          alignment: Alignment.center,
                          decoration: const BoxDecoration(
                            color: Color(0xFF6A3FB5),
                            shape: BoxShape.circle,
                          ),
                          child: tx(
                            d.owner.isEmpty ? '?' : d.owner.characters.first,
                            11,
                            w: w800,
                            c: white,
                          ),
                        ),
                        const SizedBox(width: 8),
                        tx(meta, 13, w: w600, c: wa(0.75)),
                      ],
                    ),
                    if (d.description.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      _Description(
                        text: d.description,
                        title: d.name,
                        lines: descLines,
                      ),
                    ],
                    if (d.tags.isNotEmpty) const SizedBox(height: 20),
                    Row(
                      children: [
                        for (final (i, t) in d.tags.indexed) ...[
                          if (i > 0) const SizedBox(width: 8),
                          Tap(
                            onTap: () => showToast(
                              l.playlistTagCount(t.$1, int.tryParse(t.$2) ?? 0),
                            ),
                            builder: (_, h, _) => AnimatedContainer(
                              duration: fast,
                              height: 30,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                              ),
                              decoration: squircle(
                                15,
                                color: ba(h ? 0.35 : 0.2),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  tx(t.$1, 13, w: w700, f: F.semi, c: white),
                                  const SizedBox(width: 6),
                                  tx(t.$2, 12, w: w600, c: wa(0.6)),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 24),
                    const Spacer(),
                    Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Row(
                        children: [
                          PlayPill(onCover: true, onTap: onPlay),
                          const SizedBox(width: 10),
                          RoundBtn(
                            icon: 'shuffle',
                            tip: l.actionShuffle,
                            onCover: true,
                            onTap: (_) => onShuffle(),
                          ),
                          const SizedBox(width: 10),
                          RoundBtn(
                            icon: 'more',
                            tip: l.actionMore,
                            onCover: true,
                            onTap: (ctx) => menuBelow(
                              ctx,
                              playlistMenu(
                                ctx,
                                title: d.name,
                                meta: meta,
                                cover: d.cover,
                                onPlay: () async => onPlay(),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

final _titleStyle = ts(34, w: w900, f: F.wide, c: white, h: 1.1);

/// How many lines [text] takes in [style] at [width], at most [max].
int _lines(String text, TextStyle style, double width, int max) {
  final tp = TextPainter(
    text: cjkSpan(text, style),
    textDirection: TextDirection.ltr,
    maxLines: max,
  )..layout(maxWidth: width);
  final n = tp.computeLineMetrics().length;
  tp.dispose();
  return n.clamp(1, max);
}

/// Playlist description: over [lines] lines it's collapsed with an ellipsis; tap to see the full text in a dialog.
class _Description extends StatelessWidget {
  const _Description({
    required this.text,
    required this.title,
    required this.lines,
  });
  final String text, title;
  final int lines;

  static const width = 292.0;

  @override
  Widget build(BuildContext context) {
    final style = ts(14, w: w500, c: wa(0.75), h: 22 / 14);
    final tp = TextPainter(
      text: cjkSpan(text, style),
      textDirection: TextDirection.ltr,
      maxLines: lines,
    )..layout(maxWidth: width);
    final cut = tp.didExceedMaxLines;
    tp.dispose();
    Widget body(bool h) => SizedBox(
      width: width,
      child: CjkText(
        text,
        maxLines: lines,
        overflow: TextOverflow.ellipsis,
        style: cut && h ? style.copyWith(color: white) : style,
      ),
    );
    if (!cut) return body(false);
    return Tap(
      tip: context.l10n.actionViewFullText,
      onTap: () => showTextDialog(context, title, text),
      builder: (_, h, _) => body(h),
    );
  }
}

class _PlRowView extends StatelessWidget {
  const _PlRowView({
    required this.i,
    required this.track,
    required this.added,
    required this.onPlay,
    this.playlist = '',
    this.onRemoved,
  });
  final int i;
  final Track track;
  final String added;
  final VoidCallback onPlay;
  final String playlist;
  final VoidCallback? onRemoved;

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final r = track;
    final off = track.ref?.unavailable ?? false;
    final current = app.track.key == track.key;
    final liked = app.liked.contains(track.key);
    void play() => current ? app.togglePlay() : onPlay();
    return Tap(
      onDoubleTap: off ? null : play,
      onMenu: (p) => showMenu(
        context,
        p,
        trackMenu(context, track, playlist: playlist, onRemoved: onRemoved),
      ),
      builder: (_, h, _) => AnimatedContainer(
        duration: fast,
        height: 52,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        decoration: squircle(
          12,
          color: current || h ? P.surface : P.surface.withValues(alpha: 0),
        ),
        child: Row(
          children: [
            RowIndex(
              n: i + 1,
              hover: h && !off,
              current: current,
              playing: app.playing,
              onTap: off ? null : play,
            ),
            Cover(r.cover, w: 40, h: 40, r: 6),
            const SizedBox(width: 12),
            SizedBox(
              width: 272,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  tx(
                    r.title,
                    15,
                    w: w700,
                    c: current ? accent : (off ? P.faint : P.ink),
                  ),
                  const SizedBox(height: 5),
                  LinkText(
                    joinLinks([artistLinks(app, track)]),
                    style: ts(12, w: w500, c: P.muted),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            SizedBox(
              width: 228,
              child: LinkText(
                albumLinks(app, track),
                style: ts(13, w: w500, c: P.muted),
              ),
            ),
            const SizedBox(width: 12),
            tx(added, 13, w: w500, c: P.faint),
            const Spacer(),
            // Liked songs always show a red heart; others show an outlined heart only on hover
            if (h || liked) ...[
              HeartSmall(liked: liked, onTap: () => app.toggleLike(track)),
              const SizedBox(width: 8),
            ],
            tx(r.dur, 13, w: w600, c: P.faint, tnum: true),
          ],
        ),
      ),
    );
  }
}
