<template>
  <div id="app">
    <Navbar ref="navbar" />
    <main>
      <keep-alive>
        <router-view v-if="$route.meta.keepAlive"></router-view>
      </keep-alive>
      <router-view v-if="!$route.meta.keepAlive"></router-view>
    </main>
    <transition name="slide-up">
      <Player
        v-if="this.$store.state.player.enable"
        ref="player"
        v-show="
          ['mv', 'loginUsername', 'login', 'loginAccount'].includes(
            this.$route.name
          ) === false
        "
    /></transition>
    <Toast />
    <GlobalEvents :filter="globalEventFilter" @keydown.space="play" />
    <ModalAddTrackToPlaylist />
    <ModalNewPlaylist />
  </div>
</template>

<script>
import ModalAddTrackToPlaylist from "./components/ModalAddTrackToPlaylist.vue";
import ModalNewPlaylist from "./components/ModalNewPlaylist.vue";
import Navbar from "./components/Navbar.vue";
import Player from "./components/Player.vue";
import Toast from "./components/Toast.vue";
import GlobalEvents from "vue-global-events";
import { ipcRenderer } from "./electron/ipcRenderer";

export default {
  name: "App",
  components: {
    Navbar,
    Player,
    GlobalEvents,
    Toast,
    ModalAddTrackToPlaylist,
    ModalNewPlaylist,
  },
  data() {
    return {
      isElectron: process.env.IS_ELECTRON, // true || undefined
    };
  },
  created() {
    if (this.isElectron) {
      ipcRenderer(this);
    }
  },
  methods: {
    play(e) {
      e.preventDefault();
      this.$refs.player.play();
    },
    globalEventFilter(event) {
      if (event.target.tagName === "INPUT") return false;
      if (this.$route.name === "mv") return false;
      return true;
    },
  },
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,500;0,600;0,700;0,800;0,900;1,500;1,600;1,700;1,800;1,900&display=swap");

:root {
  --color-body-bg: #ffffff;
  --color-text: #000;
  --color-primary: #335eea;
  --color-primary-bg: #eaeffd;
  --color-secondary: #7a7a7b;
  --color-secondary-bg: #f5f5f7;
  --color-navbar-bg: rgba(255, 255, 255, 0.86);
  --color-primary-bg-for-transparent: rgba(189, 207, 255, 0.28);
  --color-secondary-bg-for-transparent: rgba(209, 209, 214, 0.28);
}

[data-theme="dark"] {
  --color-body-bg: #222222;
  --color-text: #ffffff;
  --color-primary: #335eea;
  --color-primary-bg: #bbcdff;
  --color-secondary: #7a7a7b;
  --color-secondary-bg: #323232;
  --color-navbar-bg: #335eea;
  --color-navbar-bg: rgba(34, 34, 34, 0.86);
  --color-primary-bg-for-transparent: rgba(255, 255, 255, 0.12);
  --color-secondary-bg-for-transparent: rgba(255, 255, 255, 0.08);
}

#app {
  font-family: "Barlow", -apple-system, BlinkMacSystemFont, Helvetica Neue,
    PingFang SC, Microsoft YaHei, Source Han Sans SC, Noto Sans CJK SC,
    WenQuanYi Micro Hei, sans-serif;
  width: 100%;
  transition: all 0.4s;
}
body {
  background-color: var(--color-body-bg);
}

html {
  overflow-y: overlay;
  min-width: 1000px;
}

main {
  margin-top: 96px;
  margin-bottom: 96px;
  padding: {
    right: 10vw;
    left: 10vw;
  }
}

select,
button {
  font-family: inherit;
}

button {
  background: none;
  border: none;
  cursor: pointer;
}
input,
button {
  &:focus {
    outline: none;
  }
}
a {
  color: inherit;
  text-decoration: none;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
}

/* Let's get this party started */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
  border-left: 1px solid rgba(128, 128, 128, 0.18);
  background: var(--color-body-bg);
}

::-webkit-scrollbar-thumb {
  -webkit-border-radius: 10px;
  border-radius: 10px;
  background: var(--color-secondary-bg);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s;
}
.slide-up-enter, .slide-up-leave-to /* .fade-leave-active below version 2.1.8 */ {
  transform: translateY(100%);
}

[data-electron="yes"] {
  button,
  .navigation-links a,
  .playlist-info .description {
    cursor: default !important;
  }
}
</style>
