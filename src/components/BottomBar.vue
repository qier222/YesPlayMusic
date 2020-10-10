<template>
  <div class="player">
    <div class="progress-bar">
      <vue-slider
        v-model="progress"
        :min="0"
        :max="progressMax"
        :interval="1"
        :drag-on-click="true"
        :duration="0"
        :dotSize="12"
        :height="2"
        :tooltipFormatter="formatTrackTime"
        @drag-end="setSeek"
        ref="progress"
      ></vue-slider>
    </div>
    <div class="controls">
      <div class="playing">
        <router-link :to="`/album/${player.currentTrack.album.id}`"
          ><img :src="player.currentTrack.album.picUrl | resizeImage" />
        </router-link>
        <div class="track-info">
          <div class="name">
            <router-link
              :to="'/' + player.listInfo.type + '/' + player.listInfo.id"
              >{{ player.currentTrack.name }}</router-link
            >
          </div>
          <div class="artist">
            <span
              v-for="(ar, index) in player.currentTrack.artists"
              :key="ar.id"
            >
              <router-link :to="`/artist/${ar.id}`">{{ ar.name }}</router-link>
              <span v-if="index !== player.currentTrack.artists.length - 1"
                >,
              </span>
            </span>
          </div>
        </div>
      </div>
      <div class="middle-control-buttons">
        <button-icon @click.native="previous" title="Previous Song"
          ><svg-icon icon-class="previous"
        /></button-icon>
        <button-icon
          class="play"
          @click.native="play"
          :title="playing ? 'Pause' : 'Play'"
        >
          <svg-icon :iconClass="playing ? 'pause' : 'play'"
        /></button-icon>
        <button-icon @click.native="next" title="Next Song"
          ><svg-icon icon-class="next"
        /></button-icon>
      </div>
      <div class="right-control-buttons">
        <button-icon
          @click.native="goToNextTracksPage"
          title="Next Up"
          :class="{ active: this.$route.name === 'next' }"
          ><svg-icon icon-class="list"
        /></button-icon>
        <button-icon
          title="Repeat"
          @click.native="repeat"
          :class="{ active: player.repeat !== 'off' }"
        >
          <svg-icon icon-class="repeat" v-show="player.repeat !== 'one'" />
          <svg-icon icon-class="repeat-1" v-show="player.repeat === 'one'" />
        </button-icon>
        <button-icon
          @click.native="shuffle"
          :class="{ active: player.shuffle }"
          title="Shuffle"
          ><svg-icon icon-class="shuffle"
        /></button-icon>
        <div class="volume-control">
          <button-icon title="Mute" @click.native="mute">
            <svg-icon icon-class="volume" v-show="volume > 0.5" />
            <svg-icon icon-class="volume-mute" v-show="volume === 0" />
            <svg-icon
              icon-class="volume-half"
              v-show="volume <= 0.5 && volume !== 0"
            />
          </button-icon>
          <div class="volume-bar">
            <vue-slider
              v-model="volume"
              :min="0"
              :max="1"
              :interval="0.01"
              :drag-on-click="true"
              :duration="0"
              :tooltip="`none`"
              :dotSize="12"
            ></vue-slider>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
import "@/assets/css/slider.css";

import ButtonIcon from "@/components/ButtonIcon.vue";
import VueSlider from "vue-slider-component";

export default {
  name: "Player",
  components: {
    ButtonIcon,
    VueSlider,
  },
  data() {
    return {
      interval: null,
      progress: 0,
      oldVolume: 0.5,
    };
  },
  created() {
    setInterval(() => {
      this.progress = ~~this.howler.seek();
    }, 1000);
  },
  computed: {
    ...mapState(["player", "howler", "Howler"]),
    volume: {
      get() {
        return this.player.volume;
      },
      set(value) {
        this.updatePlayerState({ key: "volume", value });
        this.Howler.volume(value);
      },
    },
    playing() {
      if (this.howler.state() === "loading") {
        return true;
      }
      return this.howler.playing();
    },
    progressMax() {
      let max = ~~(this.player.currentTrack.time / 1000);
      return max > 1 ? max - 1 : max;
    },
  },
  methods: {
    ...mapMutations([
      "updatePlayingStatus",
      "updateShuffleStatus",
      "updatePlayerList",
      "shuffleTheList",
      "updatePlayerState",
      "updateRepeatStatus",
    ]),
    ...mapActions(["nextTrack", "previousTrack", "playTrackOnListByID"]),
    play() {
      if (this.playing) {
        this.howler.pause();
      } else {
        if (this.howler.state() === "unloaded") {
          this.playTrackOnListByID(this.player.currentTrack.id);
        }
        this.howler.play();
      }
    },
    next() {
      this.nextTrack(true);
      this.progress = 0;
    },
    previous() {
      this.previousTrack();
      this.progress = 0;
    },
    shuffle() {
      if (this.player.shuffle === true) {
        this.updateShuffleStatus(false);
        this.updatePlayerList(this.player.notShuffledList);
      } else {
        this.updateShuffleStatus(true);
        this.shuffleTheList();
      }
    },
    repeat() {
      if (this.player.repeat === "on") {
        this.updateRepeatStatus("one");
      } else if (this.player.repeat === "one") {
        this.updateRepeatStatus("off");
      } else {
        this.updateRepeatStatus("on");
      }
    },
    mute() {
      if (this.volume === 0) {
        this.volume = this.oldVolume;
      } else {
        this.oldVolume = this.volume;
        this.volume = 0;
      }
    },
    setSeek() {
      this.progress = this.$refs.progress.getValue();
      this.howler.seek(this.$refs.progress.getValue());
    },
    goToNextTracksPage() {
      this.$route.name === "next"
        ? this.$router.go(-1)
        : this.$router.push({ name: "next" });
    },
    formatTrackTime(value) {
      if (!value) return "";
      let min = ~~((value / 60) % 60);
      let sec = (~~(value % 60)).toString().padStart(2, "0");
      return `${min}:${sec}`;
    },
  },
};
</script>

<style lang="scss" scoped>
.player {
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 64px;
  backdrop-filter: saturate(180%) blur(30px);
  background-color: rgba(255, 255, 255, 0.86);
  z-index: 100;
}

.progress-bar {
  margin-top: -6px;
  margin-bottom: -4px;
  width: 100%;
}

.controls {
  flex: 1;
  display: flex;
  justify-content: flex;
  align-items: center;
  padding: {
    right: 10vw;
    left: 10vw;
  }
}

.playing {
  flex: 1;
  display: flex;
  align-items: center;
  img {
    height: 46px;
    border-radius: 5px;
    box-shadow: 0 6px 8px -2px rgba(0, 0, 0, 0.16);
  }
  .track-info {
    height: 46px;
    margin-left: 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .name {
      font-weight: 600;
      font-size: 16px;
      color: rgba(0, 0, 0, 0.88);
      margin-bottom: 4px;
      cursor: pointer;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
      &:hover {
        text-decoration: underline;
      }
    }
    .artist {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.58);
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
      a {
        cursor: pointer;
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}

.middle-control-buttons {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  .button-icon {
    margin: 0 8px;
  }
  .play {
    height: 48px;
    width: 48px;
    .svg-icon {
      width: 28px;
      height: 28px;
    }
  }
}
.right-control-buttons {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  .expand {
    margin-left: 24px;
    .svg-icon {
      height: 24px;
      width: 24px;
    }
  }
  .active .svg-icon {
    color: #335eea;
  }
  .volume-control {
    margin-left: 4px;
    display: flex;
    align-items: center;
    .volume-bar {
      width: 84px;
    }
  }
}
</style>
