import 'dart:io';

import 'package:flutter/widgets.dart';

import 'cache/image_cache.dart';
import 'music/models.dart' as m;

// Data for the UI: Track.ref points to the song in its source.

/// A cover can be a local absolute path, file:// or an http(s) URL.
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

  /// A song from a source.
  factory Track.of(m.Track t) => Track(
    title: t.name,
    artist: t.artistNames,
    album: t.album.name,
    cover: t.album.imageUrl,
    seconds: (t.duration / 1000).round(),
    ref: t,
    added: DateTime.tryParse(t.added)?.toLocal(),
  );

  /// The "current song" when the queue is empty.
  static const none = Track(title: '', artist: '', cover: '', seconds: 0);

  final String title;
  final String artist;
  final String album;
  final String cover;
  final int seconds;
  final bool mv;

  /// Song data from the source; null only for [none].
  final m.Track? ref;

  /// When it was added to the library; null if unknown.
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

  /// Start time (milliseconds).
  final int start;
}

// ───────────── Albums (record shelf) ─────────────

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

  /// Copyright line (℗ 2022 XX Records), shown at the bottom of the album page; empty if unknown.
  final String copyright;

  /// Page opened by tapping the artist name; not tappable when empty.
  final String artistRoute;
  final int year;
  final double spine; // spine width

  /// When it was added to the library; null if unknown.
  final DateTime? added;

  /// Release date; null if unknown, leaving only [year].
  final DateTime? released;

  /// Fills in the release date (library list APIs often omit it; it's only known after fetching album details).
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

// ───────────── Library · Songs ─────────────

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

// ───────────── Library · Artists (bubbles) ─────────────

class Bubble {
  const Bubble(this.name, this.cover, this.d);
  final String name, cover;
  final double d;
}

// ───────────── Playlists ─────────────

class PlaylistCard {
  const PlaylistCard(this.id, this.title, this.meta, this.cover, this.mine);
  final String id, title, meta, cover;
  final bool mine; // card color is extracted from the cover by CoverColors
}
