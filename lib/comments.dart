// 一首歌的评论：按热门或最新分页取，点赞和发评论先改界面，源报错再改回来。

import 'package:flutter/foundation.dart';

import 'l10n/l10n.dart';
import 'music/models.dart' as m;
import 'music/source.dart';

/// 评论的排序。名字就是传给插件的 sort。
enum CommentSort { hot, new_ }

extension CommentSortName on CommentSort {
  String get id => this == CommentSort.hot ? 'hot' : 'new';
}

/// 评论字数上限。
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

  /// 第一页就失败时的说明；之后翻页失败只是停下来。
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

  /// 点赞或取消。失败时改回来并抛出，让界面提示。
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

  /// 发评论（[replyTo] 不为空时是回复它）。源返回了发出去的那条就插到最上面。
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
