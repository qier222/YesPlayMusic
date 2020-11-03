export default (store) => {
  store.subscribe((mutation, state) => {
    // console.log(mutation);
    localStorage.setItem("player", JSON.stringify(state.player));
    localStorage.setItem("settings", JSON.stringify(state.settings));
    localStorage.setItem("data", JSON.stringify(state.data));
  });
};