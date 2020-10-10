// import { getMP3 } from "@/api/track";
import { updateMediaSessionMetaData } from "@/utils/mediaSession";

export default {
  switchTrack({ state, dispatch, commit }, track) {
    commit("updateCurrentTrack", track);
    commit("updatePlayingStatus", true);

    if (track.playable === false) {
      dispatch("nextTrack");
      return;
    }

    updateMediaSessionMetaData(track);
    document.title = `${track.name} · ${track.artists[0].name} - YesPlayMusic`;

    commit(
      "replaceMP3",
      `https://music.163.com/song/media/outer/url?id=${track.id}`
    );
    state.howler.once("end", () => {
      dispatch("nextTrack");
    });
  },
  playFirstTrackOnList({ state, dispatch }) {
    dispatch("switchTrack", state.player.list[0]);
  },
  playTrackOnListByID(context, trackID) {
    let track = context.state.player.list.find((t) => t.id === trackID);
    if (track.playable === false) return;
    context.dispatch("switchTrack", track);
  },
  nextTrack({ state, dispatch, commit }, realNext = false) {
    let nextTrack = state.player.list.find(
      (track) => track.sort === state.player.currentTrack.sort + 1
    );

    if (state.player.repeat === "on" && nextTrack === undefined) {
      nextTrack = state.player.list.find((t) => t.sort === 0);
    }

    if (state.player.repeat === "one" && realNext === false) {
      nextTrack = state.player.currentTrack;
    }

    if (state.player.repeat === "off" && nextTrack === undefined) {
      commit("updatePlayingStatus", false);
      state.howler.stop();
      return;
    }

    dispatch("switchTrack", nextTrack);
  },
  previousTrack({ state, dispatch }) {
    let previousTrack = state.player.list.find(
      (track) => track.sort === state.player.currentTrack.sort - 1
    );

    previousTrack =
      previousTrack === null || previousTrack === undefined
        ? state.player.list[-1]
        : previousTrack;
    dispatch("switchTrack", previousTrack);
  },
};
