import 'dart:io';

import 'package:flutter/widgets.dart';

import 'cache/image_cache.dart';
import 'music/models.dart' as m;

// 界面用的数据：Track.ref 指向来源里的歌曲。

/// 封面可以是本地绝对路径、file:// 或 http(s) 地址。
ImageProvider coverImage(String id) {
  if (id.startsWith('http://') || id.startsWith('https://')) {
    return DiskCachedImage(id);
  }
  if (id.startsWith('file://')) {
    return FileImage(File(Uri.parse(id).toFilePath()));
  }
  return FileImage(File(id));
}

class Track {
  const Track({
    required this.title,
    required this.artist,
    required this.cover,
    required this.seconds,
    this.album = '',
    this.mv = false,
    this.ref,
    this.added,
  });

  /// 来源里的一首歌。
  factory Track.of(m.Track t) => Track(
    title: t.name,
    artist: t.artistNames,
    album: t.album.name,
    cover: t.album.imageUrl,
    seconds: (t.duration / 1000).round(),
    ref: t,
    added: DateTime.tryParse(t.added)?.toLocal(),
  );

  /// 队列为空时的「当前歌曲」。
  static const none = Track(title: '', artist: '', cover: '', seconds: 0);

  final String title;
  final String artist;
  final String album;
  final String cover;
  final int seconds;
  final bool mv;

  /// 来源里的歌曲数据；只有 [none] 为 null。
  final m.Track? ref;

  /// 加进音乐库的时间；不知道为 null。
  final DateTime? added;

  String get dur => fmtTime(seconds.toDouble());
  String get key => ref?.key ?? '$title|$artist|$mv';
}

String fmtTime(double sec) {
  final s = sec.round();
  return '${s ~/ 60}:${(s % 60).toString().padLeft(2, '0')}';
}

class LyricLine {
  const LyricLine(this.text, this.trans, [this.start = -1]);
  final String text;
  final String trans;

  /// 开始时间（毫秒）。
  final int start;
}

// ───────────── 专辑（唱片架） ─────────────

class Album {
  const Album({
    required this.id,
    required this.title,
    required this.artist,
    required this.cover,
    required this.year,
    required this.spine,
    this.kind = '',
    this.artistRoute = '',
    this.added,
    this.released,
    this.copyright = '',
  });

  final String id, title, artist, cover, kind;

  /// 版权行（℗ 2022 XX Records），专辑页底部显示；不知道为空。
  final String copyright;

  /// 点歌手名去的页面；为空时不能点。
  final String artistRoute;
  final int year;
  final double spine; // 书脊宽度

  /// 加进音乐库的时间；不知道时为 null。
  final DateTime? added;

  /// 发行日期；不知道时为 null，只能看 [year]。
  final DateTime? released;

  /// 补上发行日期（音乐库列表接口常常不带，后来查专辑详情才知道）。
  Album withReleased(DateTime d) => Album(
    id: id,
    title: title,
    artist: artist,
    cover: cover,
    year: year > 0 ? year : d.year,
    spine: spine,
    kind: kind,
    artistRoute: artistRoute,
    added: added,
    released: d,
    copyright: copyright,
  );
}

// ───────────── 音乐库 · 歌曲 ─────────────

class SongRow {
  const SongRow(
    this.n,
    this.title,
    this.artist,
    this.album,
    this.added,
    this.dur,
    this.cover,
  );
  final int n;
  final String title, artist, album, added, dur, cover;
}

class SongMonth {
  const SongMonth(this.label, this.count, this.rows);
  final String label, count;
  final List<SongRow> rows;
}

// ───────────── 音乐库 · 艺人（气泡） ─────────────

class Bubble {
  const Bubble(this.name, this.cover, this.d);
  final String name, cover;
  final double d;
}

// ───────────── 歌单 ─────────────

class PlaylistCard {
  const PlaylistCard(this.id, this.title, this.meta, this.cover, this.mine);
  final String id, title, meta, cover;
  final bool mine; // 卡片颜色由 CoverColors 从封面提取
}
