import axios from "axios";
import localforage from "localforage";

export function cacheTrack(id, url) {
  let tracks = localforage.createInstance({
    name: "tracks",
  });

  // TODO: limit cache songs number
  // tracks.length().then(function (length) {
  //   if (length > 2) {
  //     tracks.keys().then(function (keys) {
  //       tracks.removeItem(keys[keys.length - 2]);
  //     });
  //   }
  // });

  // TODO: cache track details
  return axios
    .get(url, {
      responseType: "arraybuffer",
    })
    .then((response) => {
      tracks.setItem(`${id}`, { mp3: response.data });
      return { mp3: response.data };
    });
}

export function countDBSize(dbName) {
  let db = localforage.createInstance({
    name: dbName,
  });
  let trackSizes = [];
  return db
    .iterate((value) => {
      trackSizes.push(value.mp3.byteLength);
    })
    .then(() => {
      return {
        bytes: trackSizes.reduce((s1, s2) => s1 + s2, 0),
        length: trackSizes.length,
      };
    })
    .catch((err) => {
      console.log(err);
    });
}

export function clearDB(dbName) {
  let db = localforage.createInstance({
    name: dbName,
  });
  return db.clear();
}
