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
        <img
          :src="currentTrack.al.picUrl | resizeImage(224)"
          @click="goToAlbum"
        />
        <div class="track-info">
          <div class="name" @click="goToList">
            {{ currentTrack.name }}
          </div>
          <div class="artist">
            <span
              v-for="(ar, index) in currentTrack.ar"
              :key="ar.id"
              @click="goToArtist(ar.id)"
            >
              <span class="ar">{{ ar.name }}</span
              ><span v-if="index !== currentTrack.ar.length - 1">, </span>
            </span>
          </div>
        </div>
        <!-- 账号登录才会显示 like 图标 -->
        <div class="like-button" v-show="accountLogin">
          <button-icon
            @click.native="likeCurrentSong"
            :title="$t('player.like')"
          >
            <svg-icon
              icon-class="heart"
              v-show="!liked.songs.includes(currentTrack.id)"
            ></svg-icon>
            <svg-icon
              icon-class="heart-solid"
              v-show="liked.songs.includes(currentTrack.id)"
            ></svg-icon>
          </button-icon>
        </div>
      </div>
      <div class="middle-control-buttons">
        <button-icon @click.native="previous" :title="$t('player.previous')"
          ><svg-icon icon-class="previous"
        /></button-icon>
        <button-icon
          class="play"
          @click.native="play"
          :title="$t(playing ? 'player.pause' : 'player.play')"
        >
          <svg-icon :iconClass="playing ? 'pause' : 'play'"
        /></button-icon>
        <button-icon @click.native="next" :title="$t('player.next')"
          ><svg-icon icon-class="next"
        /></button-icon>
      </div>
      <div class="right-control-buttons">
        <button-icon
          @click.native="goToNextTracksPage"
          :title="$t('player.nextUp')"
          :class="{ active: this.$route.name === 'next' }"
          ><svg-icon icon-class="list"
        /></button-icon>
        <button-icon
          :title="$t('player.repeat')"
          @click.native="repeat"
          :class="{ active: player.repeat !== 'off' }"
        >
          <svg-icon icon-class="repeat" v-show="player.repeat !== 'one'" />
          <svg-icon icon-class="repeat-1" v-show="player.repeat === 'one'" />
        </button-icon>
        <button-icon
          @click.native="shuffle"
          :class="{ active: player.shuffle }"
          :title="$t('player.shuffle')"
          ><svg-icon icon-class="shuffle"
        /></button-icon>
        <div class="volume-control">
          <button-icon :title="$t('player.mute')" @click.native="mute">
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
import { updateMediaSessionMetaData } from "@/utils/mediaSession";
import { mapState, mapMutations, mapActions } from "vuex";
import { isAccountLoggedIn } from "@/utils/auth";
import { userLikedSongsIDs } from "@/api/user";
import { likeATrack } from "@/api/track";
import "@/assets/css/slider.css";
import { Howler } from "howler";

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
    if (isAccountLoggedIn()) {
      userLikedSongsIDs(this.settings.user.userId).then((data) => {
        this.updateLikedSongs(data.ids);
      });
    }
  },
  computed: {
    ...mapState(["player", "howler", "settings", "liked", "accountLogin"]),
    currentTrack() {
      return this.player.currentTrack;
    },
    volume: {
      get() {
        return this.player.volume;
      },
      set(value) {
        this.updatePlayerState({ key: "volume", value });
        Howler.volume(value);
      },
    },
    playing() {
      if (this.howler.state() === "loading") {
        return true;
      }
      return this.howler.playing();
    },
    progressMax() {
      let max = ~~(this.currentTrack.dt / 1000);
      return max > 1 ? max - 1 : max;
    },
  },
  methods: {
    ...mapMutations([
      "turnOnShuffleMode",
      "turnOffShuffleMode",
      "updatePlayerState",
      "updateRepeatStatus",
      "updateLikedSongs",
    ]),
    ...mapActions([
      "nextTrack",
      "previousTrack",
      "playTrackOnListByID",
      "addNextTrackEvent",
    ]),
    play() {
      if (this.playing) {
        this.howler.pause();
      } else {
        if (this.howler.state() === "unloaded") {
          this.playTrackOnListByID(this.currentTrack.id);
        }
        this.howler.play();
        if (this.howler._onend.length === 0) {
          this.addNextTrackEvent();
          updateMediaSessionMetaData(this.currentTrack);
        }
      }
    },
    next() {
      this.progress = 0;
      this.nextTrack(true);
    },
    previous() {
      this.progress = 0;
      this.previousTrack();
    },
    shuffle() {
      if (this.player.shuffle === true) {
        this.turnOffShuffleMode();
      } else {
        this.turnOnShuffleMode();
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
    likeCurrentSong() {
      let id = this.currentTrack.id;
      let like = true;
      if (this.liked.songs.includes(id)) like = false;
      likeATrack({ id, like }).then(() => {
        if (like === false) {
          this.updateLikedSongs(this.liked.songs.filter((d) => d !== id));
        } else {
          let newLikeSongs = this.liked.songs;
          newLikeSongs.push(id);
          this.updateLikedSongs(newLikeSongs);
        }
      });
    },
    goToList() {
      if (this.player.listInfo.id === this.settings.user.likedSongPlaylistID)
        this.$router.push({ path: "/library/liked-songs" });
      else
        this.$router.push({
          path: "/" + this.player.listInfo.type + "/" + this.player.listInfo.id,
        });
    },
    goToAlbum() {
      this.$router.push({ path: "/album/" + this.currentTrack.al.id });
    },
    goToArtist(id) {
      this.$router.push({ path: "/artist/" + id });
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
  // background-color: rgba(255, 255, 255, 0.86);
  background-color: #222222db;
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
    cursor: pointer;
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
      opacity: 0.88;
      color: var(--color-text);
      margin-bottom: 4px;
      cursor: pointer;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
      word-break: break-all;
      &:hover {
        text-decoration: underline;
      }
    }
    .artist {
      font-size: 12px;
      opacity: 0.58;
      color: var(--color-text);
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
      word-break: break-all;
      span.ar {
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
    height: 42px;
    width: 42px;
    .svg-icon {
      width: 24px;
      height: 24px;
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
    color: var(--color-primary);
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

.like-button {
  margin-left: 16px;
}
</style>
