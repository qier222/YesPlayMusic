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
};
