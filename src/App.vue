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
import "@/assets/css/theme.css";

export default {
  name: "App",
  components: {
    Navbar,
    Player,
    GlobalEvents,
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

#app {
  font-family: "Barlow", -apple-system, BlinkMacSystemFont, Helvetica Neue,
    PingFang SC, Microsoft YaHei, Source Han Sans SC, Noto Sans CJK SC,
    WenQuanYi Micro Hei, sans-serif;
  width: 100%;
}

html {
  overflow-y: overlay;
  min-width: 1000px;
}

body {
  background: var(--color-bg-0);
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

/* Let's get this party started */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  -webkit-border-radius: 10px;
  border-radius: 10px;
  background: rgb(216, 216, 216);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s;
}
.slide-up-enter, .slide-up-leave-to /* .fade-leave-active below version 2.1.8 */ {
  transform: translateY(100%);
}
</style>
