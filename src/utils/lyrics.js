export function lyricParser(lrc) {
  return {
    lyric: parseLyric(lrc?.lrc?.lyric || ''),
    tlyric: parseLyric(lrc?.tlyric?.lyric || ''),
    romalyric: parseLyric(lrc?.romalrc?.lyric || ''),
    lyricuser: lrc.lyricUser,
    transuser: lrc.transUser,
  };
}

export function cleanupLyric(lyric, track = {}) {
  let normalizedLyric = lyric.filter(
    l => !/^作?词[曲]?\s*(:|：)?\s*无?/.exec(l.content)
  );
  const includePureMusic =
    normalizedLyric.length <= 10 &&
    normalizedLyric.map(l => l.content).includes('纯音乐，请欣赏');

  if (!includePureMusic) return normalizedLyric;

  const authorRegex = /^作?词[曲]?\s*(:|：)?\s*/;
  const author = track?.ar?.[0]?.name;
  normalizedLyric = normalizedLyric.filter(l => {
    const regExpArr = l.content.match(authorRegex);
    return !regExpArr || l.content.replace(regExpArr[0], '') !== author;
  });

  return normalizedLyric.length === 1 ? [] : normalizedLyric;
}

export function buildLyricWithSecondary(lyric, secondaryLyric) {
  const lyricFiltered = lyric.filter(({ content }) => Boolean(content));
  return lyricFiltered.map(l => {
    const { rawTime, time, content } = l;
    const lyricItem = { time, content, contents: [content] };
    const sameTimeSecondaryLyric = secondaryLyric.find(
      ({ rawTime: secondaryRawTime }) => secondaryRawTime === rawTime
    );
    if (sameTimeSecondaryLyric?.content) {
      lyricItem.contents.push(sameTimeSecondaryLyric.content);
    }
    return lyricItem;
  });
}

export function getCurrentLyricIndex(lyric, progress) {
  return lyric.findIndex((l, index) => {
    const nextLyric = lyric[index + 1];
    return progress >= l.time && (nextLyric ? progress < nextLyric.time : true);
  });
}

export function getCurrentLyricLine(lyricToShow, lyric, progress) {
  if (lyricToShow.length === 0 || lyric.length === 0) return null;

  let currentIndex = getCurrentLyricIndex(lyric, progress);
  if (currentIndex < 0 && progress < lyric[0].time) {
    currentIndex = 0;
  }

  return {
    index: currentIndex,
    currentLine: lyricToShow[currentIndex] || null,
    nextLine: lyricToShow[currentIndex + 1] || null,
  };
}

// regexr.com/6e52n
const extractLrcRegex =
  /^(?<lyricTimestamps>(?:\[.+?\])+)(?!\[)(?<content>.+)$/gm;
const extractTimestampRegex =
  /\[(?<min>\d+):(?<sec>\d+)(?:\.|:)*(?<ms>\d+)*\]/g;

/**
 * @typedef {{time: number, rawTime: string, content: string}} ParsedLyric
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
   * A sorted list of parsed lyric and its timestamp.
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
    const { lyricTimestamps, content } = line.groups;

    for (const timestamp of lyricTimestamps.matchAll(extractTimestampRegex)) {
      const { min, sec, ms } = timestamp.groups;
      const validMs = ms?.slice(0, 2) ?? '00';
      const rawTime = `[${min}:${sec}.${validMs}]`;
      const time = Number(min) * 60 + Number(sec) + Number(validMs) * 0.01;

      /** @type {ParsedLyric} */
      const parsedLyric = { rawTime, time, content: trimContent(content) };
      parsedLyrics.splice(binarySearch(parsedLyric), 0, parsedLyric);
    }
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

/**
 * @param {string} lyric
 */
export async function copyLyric(lyric) {
  const textToCopy = lyric;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch (err) {
      alert('复制失败，请手动复制！');
    }
  } else {
    const tempInput = document.createElement('textarea');
    tempInput.value = textToCopy;
    tempInput.style.position = 'absolute';
    tempInput.style.left = '-9999px';
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      alert('复制失败，请手动复制！');
    }
    document.body.removeChild(tempInput);
  }
}
