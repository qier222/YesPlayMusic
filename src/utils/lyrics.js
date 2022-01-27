// copy from https://github.com/sl1673495/vue-netease-music/blob/master/src/utils/lrcparse.js

export function lyricParser(lrc) {
  return {
    lyric: parseLyric(lrc?.lrc?.lyric || ''),
    tlyric: parseLyric(lrc?.tlyric?.lyric || ''),
    lyricuser: lrc.lyricUser,
    transuser: lrc.transUser,
  };
}

const extractLrcRegex = /^(?<lyricTimestamps>(?:\[.+?]\s*)+)(?<content>.+)$/gm;
const extractTimestampRegex = /\[(?<min>\d+):(?<sec>\d+)(?:\.|:)(?<ms>\d+)\]/g;

/**
 * @typedef {{time: number, rawTime: string}} ParsedTimestamp
 */
/**
 * @typedef {{content: string} & ParsedTimestamp} ParsedLyric
 */

/**
 * Parse the lyric string.
 *
 * @param {string} lrc The `lrc` input.
 * @returns {ParsedLyric[]} The parsed lyric.
 * @example parseLyric("[00:00.00] Hello, World!\n[00:00.10] Test\n");
 */
function parseLyric(lrc) {
  /**
   * We use a binary tree to store a list of parsed lyric and its timestamp.
   *
   * @type {ParsedLyric[]}
   * @see binarySearch
   */
  const parsedLyrics = [];

  /**
   * Find the appropriate index to push our parsed lyric.
   * @param {ParsedLyric} lyric
   */
  const binarySearch = lyric => {
    let time = lyric.time;

    let low = 0;
    let high = parsedLyrics.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const midTime = parsedLyrics[mid].time;
      if (midTime === time) {
        return mid;
      } else if (midTime < time) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return low;
  };

  for (const line of lrc.trim().matchAll(extractLrcRegex)) {
    /** @type {ParsedTimestamp[]} */
    const timestamps = [];
    const { lyricTimestamps, content } = line.groups;

    for (const timestamp of lyricTimestamps.matchAll(extractTimestampRegex)) {
      const { min, sec, ms } = timestamp.groups;
      const rawTime = timestamp[0];
      const time = Number(min) * 60 + Number(sec) + 0.001 * Number(ms);

      timestamps.push({ time, rawTime });
    }

    const parsedLyric = timestamps.map(timestamp => ({
      ...timestamp,
      content: trimContent(content),
    }));
    parsedLyric.forEach(lyric =>
      parsedLyrics.splice(binarySearch(lyric), 0, lyric)
    );
  }

  return parsedLyrics;
}

/**
 * @param {string} content
 * @returns {string}
 */
function trimContent(content) {
  let t = content.trim();
  return t.length < 1 ? content : t;
}
