// import { getMP3 } from "@/api/track";
import { updateMediaSessionMetaData } from "@/utils/mediaSession";
import { getTrackDetail, scrobble } from "@/api/track";

export default {
  switchTrack({ state, dispatch, commit }, basicTrack) {
    getTrackDetail(basicTrack.id).then((data) => {
      let track = data.songs[0];
      track.sort = basicTrack.sort;
      console.log(track);

      if (track.playable === false) {
        dispatch("nextTrack");
        return;
      }

      let time = state.howler.seek();
      scrobble({
        id: state.player.currentTrack.id,
        sourceid: state.player.listInfo.id,
        time: time === 0 ? 180 : time,
      }).then((data) => {
        console.log("scrobble", data);
      });

      commit("updateCurrentTrack", track);
      updateMediaSessionMetaData(track);
      document.title = `${track.name} · ${track.ar[0].name} - YesPlayMusic`;

      commit(
        "replaceMP3",
        `https://music.163.com/song/media/outer/url?id=${track.id}`
      );
      state.howler.once("end", () => {
        dispatch("nextTrack");
      });
    });
  },
  playFirstTrackOnList({ state, dispatch }) {
    dispatch("switchTrack", state.player.list[0]);
  },
  playTrackOnListByID(context, trackID) {
    let track = context.state.player.list.find((t) => t.id === trackID);
    context.dispatch("switchTrack", track);
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
