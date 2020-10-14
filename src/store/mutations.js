import { Howl } from "howler";
import state from "./state";

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
  updateShuffleStatus(state, status) {
    state.player.shuffle = status;
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
  shuffleTheList(state) {
    let getOneRandomly = (arr) => arr[Math.floor(Math.random() * arr.length)];
    state.player.notShuffledList = JSON.parse(
      JSON.stringify(state.player.list)
    );

    let sorts = Array.from(new Array(state.player.list.length).keys());
    sorts = sorts.filter((no) => no != 0);
    let shuffledList = state.player.list.map((track) => {
      if (track.id === state.player.currentTrack.id) {
        // 确保正在播放的歌的sort是第一个
        track.sort = 0;
        return track;
      }
      let sortNo = getOneRandomly(sorts);
      sorts = sorts.filter((no) => no != sortNo);
      track.sort = sortNo;
      return track;
    });

    state.player.list = shuffledList;

    // 更新当前播放歌曲的sort
    let currentTrack = state.player.list.find(
      (t) => t.id === state.player.currentTrack.id
    );
    state.player.currentTrack.sort = currentTrack.sort;

    state.player.shuffle = true;
  },
  updateUser(state, user) {
    state.settings.user = user;
  },
  updateUserInfo(sate, { key, value }) {
    state.settings.user[key] = value;
  },
};
