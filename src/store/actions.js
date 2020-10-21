import { updateMediaSessionMetaData } from "@/utils/mediaSession";
import { getTrackDetail, scrobble, getMP3 } from "@/api/track";
import { isLoggedIn } from "@/utils/auth";

export default {
  switchTrack({ state, dispatch, commit }, basicTrack) {
    getTrackDetail(basicTrack.id).then(data => {
      let track = data.songs[0];
      track.sort = basicTrack.sort;

      let time = state.howler.seek();
      scrobble({
        id: state.player.currentTrack.id,
        sourceid: state.player.listInfo.id,
        time: time === 0 ? 180 : time
      });

      commit("updateCurrentTrack", track);
      updateMediaSessionMetaData(track);
      document.title = `${track.name} · ${track.ar[0].name} - YesPlayMusic`;

      if (track.playable === false) {
        dispatch("nextTrack");
        return;
      }

      function commitMP3(mp3) {
        commit("replaceMP3", mp3);
        state.howler.once("end", () => {
          dispatch("nextTrack");
        });
      }

      if (isLoggedIn) {
        getMP3(track.id).then(data => {
          commitMP3(data.data[0].url);
        });
      } else {
        commitMP3(`https://music.163.com/song/media/outer/url?id=${track.id}`);
      }
    });
  },
  playFirstTrackOnList({ state, dispatch }) {
    dispatch(
      "switchTrack",
      state.player.list.find(t => t.sort === 0)
    );
  },
  playTrackOnListByID({ state, commit, dispatch }, trackID) {
    let track = state.player.list.find(t => t.id === trackID);
    dispatch("switchTrack", track);
    if (state.player.shuffle) {
      // 当随机模式开启时，双击列表的一首歌进行播放，此时要把这首歌的sort调到第一(0)，这样用户就能随机播放完整的歌单
      let otherTrack = state.player.list.find(t => t.sort === 0);
      commit("switchSortBetweenTwoTracks", {
        trackID1: track.id,
        trackID2: otherTrack.id
      });
    }
  },
  nextTrack({ state, dispatch }, realNext = false) {
    let nextTrack = state.player.list.find(
      track => track.sort === state.player.currentTrack.sort + 1
    );

    if (state.player.repeat === "one" && realNext === false) {
      nextTrack = state.player.currentTrack;
    }

    if (nextTrack === undefined) {
      if (state.player.repeat !== "off") {
        nextTrack = state.player.list.find(t => t.sort === 0);
      } else {
        return;
      }
    }

    dispatch("switchTrack", nextTrack);
  },
  previousTrack({ state, dispatch }) {
    let previousTrack = state.player.list.find(
      track => track.sort === state.player.currentTrack.sort - 1
    );
    if (previousTrack == undefined) {
      if (state.player.repeat !== "off") {
        previousTrack = state.player.list.reduce((x, y) => (x > y ? x : y));
      } else {
        previousTrack = state.player.list.find(t => t.sort === 0);
      }
    }
    dispatch("switchTrack", previousTrack);
  },
  addNextTrackEvent({ state, dispatch }) {
    state.howler.once("end", () => {
      dispatch("nextTrack");
    });
  }
};
