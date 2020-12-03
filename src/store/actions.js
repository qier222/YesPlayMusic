import { updateMediaSessionMetaData } from "@/utils/mediaSession";
import { getTrackDetail, scrobble, getMP3 } from "@/api/track";
import { isAccountLoggedIn } from "@/utils/auth";
import { updateHttps } from "@/utils/common";
import localforage from "localforage";
import store from "@/store";
import { cacheTrack } from "@/utils/db";

const electron =
  process.env.IS_ELECTRON === true ? window.require("electron") : null;
const ipcRenderer =
  process.env.IS_ELECTRON === true ? electron.ipcRenderer : null;

export default {
  switchTrack({ state, dispatch, commit }, basicTrack) {
    getTrackDetail(basicTrack.id).then((data) => {
      let track = data.songs[0];
      track.sort = basicTrack.sort;

      // 获取当前的播放时间。初始化为 loading 状态时返回 howler 的实例而不是浮点数时间，比如 1.332
      let time = state.howler.seek();
      let currentTime = 0;
      if (time === 0) {
        // state.howler._duration 可以获得当前实例的播放时长
        currentTime = 180;
      }
      if (time.toString() === "[object Object]") {
        currentTime = 0;
      }
      if (time > 0) {
        currentTime = time;
      }
      scrobble({
        id: state.player.currentTrack.id,
        sourceid: state.player.listInfo.id,
        time: currentTime,
      });

      commit("updateCurrentTrack", track);
      updateMediaSessionMetaData(track);
      document.title = `${track.name} · ${track.ar[0].name} - YesPlayMusic`;

      if (track.playable === false) {
        let res = undefined;
        if (process.env.IS_ELECTRON === true) {
          res = ipcRenderer.sendSync("unblock-music", track.id);
        }
        if (res?.url) {
          commitMP3(res.url);
        } else {
          dispatch("nextTrack");
        }
        return;
      }

      function commitMP3(mp3) {
        commit("replaceMP3", mp3);
        state.howler.once("end", () => {
          dispatch("nextTrack");
        });
      }
      if (isAccountLoggedIn()) {
        if (store.state.settings.automaticallyCacheSongs === true) {
          let tracks = localforage.createInstance({
            name: "tracks",
          });
          tracks.getItem(`${track.id}`).then((t) => {
            if (t !== null) {
              commitMP3(URL.createObjectURL(t.mp3));
            } else {
              cacheTrack(`${track.id}`).then((t) => {
                commitMP3(URL.createObjectURL(t.mp3));
              });
            }
          });
        } else {
          getMP3(track.id).then((data) => {
            // 未知情况下会没有返回数据导致报错，增加防范逻辑
            if (data.data[0]) {
              const url = updateHttps(data.data[0].url);
              commitMP3(url);
            }
          });
        }
      } else {
        commitMP3(`https://music.163.com/song/media/outer/url?id=${track.id}`);
      }
    });
  },
  playFirstTrackOnList({ state, dispatch }) {
    dispatch(
      "switchTrack",
      state.player.list.find((t) => t.sort === 0)
    );
  },
  playTrackOnListByID({ state, commit, dispatch }, trackID) {
    let track = state.player.list.find((t) => t.id === trackID);
    dispatch("switchTrack", track);
    if (state.player.shuffle) {
      // 当随机模式开启时，双击列表的一首歌进行播放，此时要把这首歌的sort调到第一(0)，这样用户就能随机播放完整的歌单
      let otherTrack = state.player.list.find((t) => t.sort === 0);
      commit("switchSortBetweenTwoTracks", {
        trackID1: track.id,
        trackID2: otherTrack.id,
      });
    }
  },
  nextTrack({ state, dispatch }, realNext = false) {
    let nextTrack = state.player.list.find(
      (track) => track.sort === state.player.currentTrack.sort + 1
    );

    if (state.player.repeat === "one" && realNext === false) {
      nextTrack = state.player.currentTrack;
    }

    if (nextTrack === undefined) {
      if (state.player.repeat !== "off") {
        nextTrack = state.player.list.find((t) => t.sort === 0);
      } else {
        document.title = "YesPlayMusic";
        return;
      }
    }

    dispatch("switchTrack", nextTrack);
  },
  previousTrack({ state, dispatch }) {
    let previousTrack = state.player.list.find(
      (track) => track.sort === state.player.currentTrack.sort - 1
    );
    if (previousTrack == undefined) {
      if (state.player.repeat !== "off") {
        previousTrack = state.player.list.reduce((x, y) => (x > y ? x : y));
      } else {
        previousTrack = state.player.list.find((t) => t.sort === 0);
      }
    }
    dispatch("switchTrack", previousTrack);
  },
  addNextTrackEvent({ state, dispatch }) {
    state.howler.once("end", () => {
      dispatch("nextTrack");
    });
  },
};
