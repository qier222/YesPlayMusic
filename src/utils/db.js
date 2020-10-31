import axios from "axios";
import localforage from "localforage";
import { getMP3 } from "@/api/track";

export function cacheTrack(id) {
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
  return getMP3(id).then((data) => {
    return axios
      .get(data.data[0].url.replace(/^http:/, "https:"), {
        responseType: "blob",
      })
      .then((data) => {
        tracks.setItem(`${id}`, { mp3: data.data });
        return { mp3: data.data };
      });
  });
}

export function countDBSize(dbName) {
  let db = localforage.createInstance({
    name: dbName,
  });
  let trackSizes = [];
  return db
    .iterate((value) => {
      trackSizes.push(value.mp3.size);
    })
    .then(() => {
      return {
        bytes: trackSizes.reduce((s1, s2) => s1 + s2),
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
