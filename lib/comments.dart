// Comments for a song: paged by hot or newest; likes and new comments update the UI first and revert if the source errors.

import 'package:flutter/foundation.dart';

import 'l10n/l10n.dart';
import 'music/models.dart' as m;
import 'music/source.dart';

/// Comment sort order. The name is the sort passed to the plugin.
enum CommentSort { hot, new_ }

extension CommentSortName on CommentSort {
  String get id => this == CommentSort.hot ? 'hot' : 'new';
}

/// Maximum comment length.
const commentLimit = 1000;

class CommentFeed extends ChangeNotifier {
  CommentFeed(this.source, this.trackId, this.sort) {
    loadMore();
  }
  final Source source;
  final String trackId;
  final CommentSort sort;

  final List<m.Comment> items = [];
  int total = 0;
  bool more = true, loading = false;

  /// Message when the first page fails; later page failures just stop loading.
  String? error;

  bool _disposed = false;

  bool get canPost => source.can(Op.postComment);
  bool get canLike => source.can(Op.likeComment);

  void _notify() {
    if (!_disposed) notifyListeners();
  }

  Future<void> loadMore() async {
    if (loading || !more) return;
    loading = true;
    _notify();
    try {
      final p = await source.comments(
        trackId,
        sort: sort.id,
        offset: items.length,
      );
      final seen = {for (final c in items) c.id};
      items.addAll(p.comments.where((c) => seen.add(c.id)));
      total = p.total;
      more = p.more && p.comments.isNotEmpty;
      error = null;
    } catch (e) {
      more = false;
      if (items.isEmpty) {
        error = e is SourceError && e.reason.isNotEmpty
            ? e.reason
            : L.commentLoadFailed;
      }
    } finally {
      loading = false;
      _notify();
    }
  }

  /// Likes or unlikes. On failure reverts and throws so the UI can show a message.
  Future<void> like(m.Comment c) async {
    final i = items.indexWhere((x) => x.id == c.id);
    if (i < 0) return;
    final on = !c.liked;
    items[i] = c.copyWith(
      liked: on,
      likes: (c.likes + (on ? 1 : -1)).clamp(0, 1 << 31),
    );
    _notify();
    try {
      await source.likeComment(trackId, c.id, on);
    } catch (_) {
      final j = items.indexWhere((x) => x.id == c.id);
      if (j >= 0) items[j] = c;
      _notify();
      rethrow;
    }
  }

  /// Posts a comment (a reply to [replyTo] when it's not null). If the source returns the posted comment, it goes on top.
  Future<void> post(String text, {m.Comment? replyTo}) async {
    final c = await source.postComment(
      trackId,
      text,
      replyTo: replyTo?.id ?? '',
    );
    total++;
    if (c != null) items.insert(0, c);
    _notify();
  }

  @override
  void dispose() {
    _disposed = true;
    super.dispose();
  }
}
