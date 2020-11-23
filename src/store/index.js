import Vue from "vue";
import Vuex from "vuex";
import state from "./state";
import mutations from "./mutations";
import actions from "./actions";
import initLocalStorage from "./initLocalStorage";
import { Howl, Howler } from "howler";
import { changeAppearance } from "@/utils/common";
import updateApp from "@/utils/updateApp";
import pkg from "../../package.json";
// vuex 自定义插件
import vuexBroadCast from "./plugins/broadcast";
import saveToLocalStorage from "./plugins/localStorage";

if (localStorage.getItem("appVersion") === null) {
  localStorage.setItem("player", JSON.stringify(initLocalStorage.player));
  localStorage.setItem("settings", JSON.stringify(initLocalStorage.settings));
  localStorage.setItem("data", JSON.stringify(initLocalStorage.data));
  localStorage.setItem("appVersion", pkg.version);
  window.location.reload();
}

updateApp();

Vue.use(Vuex);

const options = {
  state,
  mutations,
  actions,
  plugins: [saveToLocalStorage, vuexBroadCast],
};

const store = new Vuex.Store(options);

store.state.howler = new Howl({
  src: [
    `https://music.163.com/song/media/outer/url?id=${store.state.player.currentTrack.id}`,
  ],
  html5: true,
  format: ["webm", "mp3"],
});

Howler.volume(store.state.player.volume);

if ([undefined, null].includes(store.state.settings.lang)) {
  let lang = "en";
  if (navigator.language.slice(0, 2) === "zh") lang = "zh-CN";
  store.state.settings.lang = lang;
  localStorage.setItem("settings", JSON.stringify(store.state.settings));
}

changeAppearance(store.state.settings.appearance);

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", () => {
    if (store.state.settings.appearance === "auto") {
      changeAppearance(store.state.settings.appearance);
    }
  });

export default store;
