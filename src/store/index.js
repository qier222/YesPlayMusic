import Vue from "vue";
import Vuex from "vuex";
import state from "./state";
import mutations from "./mutations";
import actions from "./actions";
import initState from "./initState";
import { Howl, Howler } from "howler";

if (localStorage.getItem("appVersion") === null) {
  localStorage.setItem("player", JSON.stringify(initState.player));
  localStorage.setItem("settings", JSON.stringify(initState.settings));
  localStorage.setItem("appVersion", "0.1");
  window.location.reload();
}

const saveToLocalStorage = (store) => {
  store.subscribe((mutation, state) => {
    // console.log(mutation);
    localStorage.setItem("player", JSON.stringify(state.player));
    localStorage.setItem("settings", JSON.stringify(state.settings));
  });
};

Vue.use(Vuex);
const store = new Vuex.Store({
  state: state,
  mutations,
  actions,
  plugins: [saveToLocalStorage],
});

store.state.howler = new Howl({
  src: [
    `https://music.163.com/song/media/outer/url?id=${store.state.player.currentTrack.id}`,
  ],
  html5: true,
  format: ["mp3"],
});
Howler.volume(store.state.player.volume);

if ([undefined, null].includes(store.state.settings.lang)) {
  let lang = "en";
  if (navigator.language.slice(0, 2) === "zh") lang = "zh-CN";
  store.state.settings.lang = lang;
  localStorage.setItem("settings", JSON.stringify(store.state.settings));
}

if (
  store.state.settings.appearance !== "auto" &&
  store.state.settings.appearance !== undefined
) {
  document.body.setAttribute("data-theme", store.state.settings.appearance);
} else {
  document.body.setAttribute(
    "data-theme",
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );
}
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    if (store.state.settings.appearance === "auto") {
      store.commit("updateTmpAppearance", e.matches ? "dark" : "light");
      document.body.setAttribute("data-theme", e.matches ? "dark" : "light");
    }
  });

export default store;
