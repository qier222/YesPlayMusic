import { Howl } from "howler";
import state from "./state";
import { shuffleAList } from "@/utils/common";

export default {
  updatePlayerState(state, { key, value }) {
    state.player[key] = value;
  },
  updateCurrentTrack(state, track) {
    state.player.currentTrack = track;
  },
  replaceMP3(state, mp3) {
    state.Howler.unload();
    state.howler = new Howl({
      src: [mp3],
      autoplay: true,
      html5: true,
    });
    state.howler.play();
  },
  updatePlayerList(state, list) {
    state.player.list = list;
    if (state.player.enable !== true) state.player.enable = true;
  },
  updateListInfo(state, info) {
    state.player.listInfo = info;
  },
  updateRepeatStatus(state, status) {
    state.player.repeat = status;
  },
  appendTrackToPlayerList(state, { track, playNext = false }) {
    let existTrack = state.player.list.find((t) => t.id === track.id);
    if (
      (existTrack === null || existTrack === undefined) &&
      playNext === false
    ) {
      state.player.list.push(track);
      return;
    }

    // 把track加入到正在播放歌曲的下一首位置
    state.player.list = state.player.list.map((t) => {
      if (t.sort > state.player.currentTrack.sort) {
        t.sort = t.sort + 1;
      }
      return t;
    });
    track.sort = state.player.currentTrack.sort + 1;
    state.player.list.push(track);
  },
  turnOnShuffleMode(state) {
    state.player.notShuffledList = JSON.parse(
      JSON.stringify(state.player.list)
    );
    state.player.shuffle = true;

    let newSorts = shuffleAList(
      state.player.list.filter((t) => t.sort > state.player.currentTrack.sort)
    );

    state.player.list = state.player.list.map((track) => {
      if (newSorts[track.id] !== undefined) track.sort = newSorts[track.id];
      return track;
    });
  },
  turnOffShuffleMode(state) {
    state.player.shuffle = false;
    state.player.list = JSON.parse(
      JSON.stringify(state.player.notShuffledList)
    );
    state.player.currentTrack.sort = state.player.list.find(
      (t) => t.id === state.player.currentTrack.id
    ).sort;
  },
  shuffleTheListBeforePlay(state) {
    state.player.notShuffledList = JSON.parse(
      JSON.stringify(state.player.list)
    );
    let newSorts = shuffleAList(state.player.list);
    state.player.list = state.player.list.map((track) => {
      track.sort = newSorts[track.id];
      return track;
    });
  },
  updateUser(state, user) {
    state.settings.user = user;
  },
  updateUserInfo(sate, { key, value }) {
    state.settings.user[key] = value;
  },
  updateLikedSongs(state, trackIDs) {
    state.liked.songs = trackIDs;
  },
  switchSortBetweenTwoTracks(state, { trackID1, trackID2 }) {
    let t1 = state.player.list.find((t) => t.id === trackID1);
    let t2 = state.player.list.find((t) => t.id === trackID2);
    let sorts = [t1.sort, t2.sort];
    state.player.list = state.player.list.map((t) => {
      if (t.id === t1.id) t.sort = sorts[1];
      if (t.id === t2.id) t.sort = sorts[0];
      return t;
    });
  },
};
