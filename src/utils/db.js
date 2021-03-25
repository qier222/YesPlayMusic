import axios from "axios";
import Dexie from "dexie";
// import pkg from "../../package.json";

const db = new Dexie("yesplaymusic");
db.version(1).stores({
  trackSources: "&id",
});

export function cacheTrackSource(trackInfo, url, bitRate, from = "netease") {
  const name = trackInfo.name;
  const artist = trackInfo.ar[0]?.name || trackInfo.artists[0]?.name;
  return axios
    .get(url, {
      responseType: "arraybuffer",
    })
    .then((response) => {
      db.trackSources.put({
        id: trackInfo.id,
        source: response.data,
        bitRate,
        from,
        name,
        artist,
      });
      console.debug(`[debug][db.js] cached track 👉 ${name} by ${artist}`);
      return { trackID: trackInfo.id, source: response.data, bitRate };
    });
}

export function getTrackSource(id) {
  return db.trackSources.get(Number(id)).then((track) => {
    if (!track) return null;
    console.debug(
      `[debug][db.js] get track from cache 👉 ${track.name} by ${track.artist}`
    );
    return track;
  });
}

export function countDBSize() {
  let trackSizes = [];
  return db.trackSources
    .each((track) => {
      trackSizes.push(track.source.byteLength);
    })
    .then(() => {
      return {
        bytes: trackSizes.reduce((s1, s2) => s1 + s2, 0),
        length: trackSizes.length,
      };
    });
}

export function clearDB() {
  return new Promise((resolve) => {
    db.tables.forEach(function (table) {
      table.clear();
    });
    resolve();
  });
}
