// copy from https://github.com/sl1673495/vue-netease-music/blob/master/src/utils/lrcparse.js

export function lyricParser(lrc) {
  return {
    lyric: parseLyric(lrc?.lrc?.lyric || ''),
    tlyric: parseLyric(lrc?.tlyric?.lyric || ''),
    lyricuser: lrc.lyricUser,
    transuser: lrc.transUser,
  };
}

export function parseLyric(lrc) {
  const lyrics = lrc.split('\n');
  const lrcObj = [];
  for (let i = 0; i < lyrics.length; i++) {
    const lyric = decodeURIComponent(lyrics[i]);
    const timeReg = /\[\d*:\d*((\.|:)\d*)*\]/g;
    const timeRegExpArr = lyric.match(timeReg);
    if (!timeRegExpArr) continue;
    const content = lyric.replace(timeReg, '');
    for (let k = 0, h = timeRegExpArr.length; k < h; k++) {
      const t = timeRegExpArr[k];
      const min = Number(String(t.match(/\[\d*/i)).slice(1));
      const sec = Number(String(t.match(/:\d*/i)).slice(1));
      const ms = Number(t.match(/\d*\]/i)[0].slice(0, 2)) / 100;
      const time = min * 60 + sec + ms;
      if (content !== '') {
        lrcObj.push({ time: time, rawTime: timeRegExpArr[0], content });
      }
    }
  }
  return lrcObj;
}
