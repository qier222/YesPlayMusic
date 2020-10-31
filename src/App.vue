<template>
  <div id="app">
    <Navbar />
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
    <GlobalEvents :filter="globalEventFilter" @keydown.space="play" />
  </div>
</template>

<script>
import Navbar from "./components/Navbar.vue";
import Player from "./components/Player.vue";
import GlobalEvents from "vue-global-events";

export default {
  name: "App",
  components: {
    Navbar,
    Player,
    GlobalEvents,
  },
  data() {
    return {
      isElectron: process.env.IS_ELECTRON // "true" || undefined
    }
  },
  created() {
    if (this.isElectron) {
      // 添加专有的类名
      document.body.classList.add('is-electron')
      // ipc message channel
      const electron = window.require("electron");
      const ipcRenderer = electron.ipcRenderer;
      // listens to the main process 'changeRouteTo' event and changes the route from
      // inside this Vue instance, according to what path the main process requires.
      // responds to Menu click() events at the main process and changes the route accordingly.
      ipcRenderer.on("changeRouteTo", (event, path) => {
        console.log(event);
        this.$router.push(path);
      });
      ipcRenderer.on("play", () => {
        this.$refs.player.play();
      });
      ipcRenderer.on("next", () => {
        this.$refs.player.next();
      });
      ipcRenderer.on("previous", () => {
        this.$refs.player.previous();
      });
      ipcRenderer.on("increaseVolume", () => {
        if (this.$refs.player.volume + 0.1 >= 1) {
          return (this.$refs.player.volume = 1);
        }
        this.$refs.player.volume += 0.1;
      });
      ipcRenderer.on("decreaseVolume", () => {
        if (this.$refs.player.volume - 0.1 <= 0) {
          return (this.$refs.player.volume = 0);
        }
        this.$refs.player.volume -= 0.1;
      });
      ipcRenderer.on("like", () => {
        this.$refs.player.likeCurrentSong();
      });
      ipcRenderer.on("repeat", () => {
        this.$refs.player.repeat();
      });
      ipcRenderer.on("shuffle", () => {
        this.$refs.player.shuffle();
      });
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
  &:hover {
    text-decoration: underline;
  }
}

// for electron
body.is-electron::-webkit-scrollbar {
  width: 0;
}

/* Let's get this party started */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
  border-left: 1px solid rgba(128, 128, 128, 0.18);
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
</style>
