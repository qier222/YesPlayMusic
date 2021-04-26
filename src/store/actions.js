// import store, { state, dispatch, commit } from "@/store";
import { isAccountLoggedIn } from "@/utils/auth";
import { likeATrack } from "@/api/track";

export default {
  showToast({ state, commit }, text) {
    if (state.toast.timer !== null) {
      clearTimeout(state.toast.timer);
      commit("updateToast", { show: false, text: "", timer: null });
    }
    commit("updateToast", {
      show: true,
      text,
      timer: setTimeout(() => {
        commit("updateToast", {
          show: false,
          text: state.toast.text,
          timer: null,
        });
      }, 3200),
    });
  },
  likeASong({ state, commit, dispatch }, id) {
    if (!isAccountLoggedIn()) {
      dispatch("showToast", "此操作需要登录网易云账号");
      return;
    }
    let like = true;
    if (state.liked.songs.includes(id)) like = false;
    likeATrack({ id, like }).then(() => {
      if (like === false) {
        commit(
          "updateLikedSongs",
          state.liked.songs.filter((d) => d !== id)
        );
      } else {
        let newLikeSongs = state.liked.songs;
        newLikeSongs.push(id);
        commit("updateLikedSongs", newLikeSongs);
      }
    });
  },
};
