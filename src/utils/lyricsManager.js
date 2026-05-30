import { getLyric } from '@/api/track';
import {
  buildLyricWithSecondary,
  cleanupLyric,
  lyricParser,
} from '@/utils/lyrics';

const lyricsCache = new Map();

export function getLyricType({ lyric, tlyric, romalyric }) {
  if (tlyric.length * romalyric.length > 0) return 'translation';
  return lyric.length > 0 ? 'translation' : 'romaPronunciation';
}

export function getLyricToShow({ lyric, tlyric, romalyric, lyricType }) {
  return lyricType === 'translation'
    ? buildLyricWithSecondary(lyric, tlyric)
    : buildLyricWithSecondary(lyric, romalyric);
}

export function loadParsedLyrics(track) {
  const trackId = track?.id;
  if (!trackId) {
    return Promise.resolve({
      lyric: [],
      tlyric: [],
      romalyric: [],
      lyricType: 'translation',
    });
  }

  if (lyricsCache.has(trackId)) return lyricsCache.get(trackId);

  const lyricPromise = getLyric(trackId).then(data => {
    if (!data?.lrc?.lyric) {
      return {
        lyric: [],
        tlyric: [],
        romalyric: [],
        lyricType: 'translation',
      };
    }

    const parsedLyrics = lyricParser(data);
    const lyric = cleanupLyric(parsedLyrics.lyric, track);
    const result = {
      lyric,
      tlyric: parsedLyrics.tlyric,
      romalyric: parsedLyrics.romalyric,
      lyricType: getLyricType({
        lyric,
        tlyric: parsedLyrics.tlyric,
        romalyric: parsedLyrics.romalyric,
      }),
    };

    if (result.lyric.length === 0) {
      result.tlyric = [];
      result.romalyric = [];
    }

    return result;
  });

  lyricsCache.set(trackId, lyricPromise);
  return lyricPromise;
}
