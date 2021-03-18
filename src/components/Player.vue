<template>
  <div class="player" @click="toggleLyrics">
    <div
      class="progress-bar"
      :class="{ nyancat: settings.nyancatStyle }"
      @click.stop
    >
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
        <div class="container" @click.stop>
          <img
            :src="currentTrack.al && currentTrack.al.picUrl | resizeImage(224)"
            @click="goToAlbum"
          />
          <div class="track-info" :title="audioSource">
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
          <div class="like-button">
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
        <div class="blank"></div>
      </div>
      <div class="middle-control-buttons">
        <div class="blank"></div>
        <div class="container" @click.stop>
          <button-icon
            v-show="!player.isPersonalFM"
            @click.native="previous"
            :title="$t('player.previous')"
            ><svg-icon icon-class="previous"
          /></button-icon>
          <button-icon
            v-show="player.isPersonalFM"
            @click.native="moveToFMTrash"
            title="不喜欢"
            ><svg-icon icon-class="thumbs-down"
          /></button-icon>
          <button-icon
            class="play"
            @click.native="play"
            :title="$t(player.playing ? 'player.pause' : 'player.play')"
          >
            <svg-icon :iconClass="player.playing ? 'pause' : 'play'"
          /></button-icon>
          <button-icon @click.native="next" :title="$t('player.next')"
            ><svg-icon icon-class="next"
          /></button-icon>
        </div>
        <div class="blank"></div>
      </div>
      <div class="right-control-buttons">
        <div class="blank"></div>
        <div class="container" @click.stop>
          <button-icon
            @click.native="goToNextTracksPage"
            :title="$t('player.nextUp')"
            :class="{
              active: this.$route.name === 'next',
              disabled: player.isPersonalFM,
            }"
            ><svg-icon icon-class="list"
          /></button-icon>
          <button-icon
            :title="
              player.repeatMode === 'one'
                ? $t('player.repeatTrack')
                : $t('player.repeat')
            "
            @click.native="repeat"
            :class="{
              active: player.repeatMode !== 'off',
              disabled: player.isPersonalFM,
            }"
          >
            <svg-icon
              icon-class="repeat"
              v-show="player.repeatMode !== 'one'"
            />
            <svg-icon
              icon-class="repeat-1"
              v-show="player.repeatMode === 'one'"
            />
          </button-icon>
          <button-icon
            @click.native="shuffle"
            :class="{ active: player.shuffle, disabled: player.isPersonalFM }"
            :title="$t('player.shuffle')"
            ><svg-icon icon-class="shuffle"
          /></button-icon>
          <div class="volume-control">
            <button-icon :title="$t('player.mute')" @click.native="player.mute">
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

          <button-icon
            class="lyrics-button"
            title="歌词"
            style="margin-left: 12px"
            @click.native.stop="toggleLyrics"
            ><svg-icon icon-class="arrow-up"
          /></button-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
import { isAccountLoggedIn } from "@/utils/auth";
import { userLikedSongsIDs } from "@/api/user";
import { likeATrack } from "@/api/track";
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
    };
  },
  mounted() {
    setInterval(() => {
      this.progress = this.player.seek();
    }, 1000);
    if (isAccountLoggedIn()) {
      userLikedSongsIDs(this.data.user.userId).then((data) => {
        this.updateLikedSongs(data.ids);
      });
    }
  },
  computed: {
    ...mapState(["player", "settings", "liked", "data"]),
    currentTrack() {
      return this.player.currentTrack;
    },
    volume: {
      get() {
        return this.player.volume;
      },
      set(value) {
        this.player.volume = value;
      },
    },
    playing() {
      return this.player.playing;
    },
    progressMax() {
      let max = ~~(this.player.currentTrack.dt / 1000);
      return max > 1 ? max - 1 : max;
    },
    isCurrentTrackLiked() {
      return this.liked.songs.includes(this.currentTrack.id);
    },
    audioSource() {
      return this.player._howler?._src.includes("kuwo.cn")
        ? "音源来自酷我音乐"
        : "";
    },
  },
  methods: {
    ...mapMutations(["updateLikedSongs", "toggleLyrics"]),
    ...mapActions(["showToast"]),
    play() {
      this.player.playing ? this.player.pause() : this.player.play();
    },
    next() {
      if (this.player.playNextTrack()) this.progress = 0;
    },
    previous() {
      if (this.player.playPrevTrack()) this.progress = 0;
    },
    shuffle() {
      if (this.player.isPersonalFM) return;
      this.player.shuffle = !this.player.shuffle;
    },
    repeat() {
      if (this.player.isPersonalFM) return;
      if (this.player.repeatMode === "on") {
        this.player.repeatMode = "one";
      } else if (this.player.repeatMode === "one") {
        this.player.repeatMode = "off";
      } else {
        this.player.repeatMode = "on";
      }
    },
    setSeek() {
      this.progress = this.$refs.progress.getValue();
      this.player.seek(this.$refs.progress.getValue());
    },
    setProgress(value) {
      this.progress = value;
    },
    goToNextTracksPage() {
      if (this.player.isPersonalFM) return;
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
      if (!isAccountLoggedIn()) {
        this.showToast("此操作需要登录网易云账号");
        return;
      }
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
    moveToFMTrash() {
      this.player.moveToFMTrash();
    },
    goToList() {
      if (this.player.playlistSource.id === this.data.likedSongPlaylistID) {
        this.$router.push({ path: "/library/liked-songs" });
      } else if (this.player.playlistSource.type === "url") {
        this.$router.push({ path: this.player.playlistSource.id });
      } else {
        this.$router.push({
          path:
            "/" +
            this.player.playlistSource.type +
            "/" +
            this.player.playlistSource.id,
        });
      }
    },
    goToAlbum() {
      if (this.player.currentTrack.al.id === 0) return;
      this.$router.push({ path: "/album/" + this.player.currentTrack.al.id });
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
  background-color: var(--color-navbar-bg);
  z-index: 100;
}

@supports (-moz-appearance: none) {
  .player {
    background-color: var(--color-body-bg);
  }
}

.progress-bar {
  margin-top: -6px;
  margin-bottom: -6px;
  width: 100%;
}

.controls {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  height: 100%;
  padding: {
    right: 10vw;
    left: 10vw;
  }
}

@media (max-width: 1336px) {
  .controls {
    padding: 0 5vw;
  }
}

.blank {
  flex-grow: 1;
}

.playing {
  display: flex;
}

.playing .container {
  display: flex;
  align-items: center;
  img {
    height: 46px;
    border-radius: 5px;
    box-shadow: 0 6px 8px -2px rgba(0, 0, 0, 0.16);
    cursor: pointer;
    user-select: none;
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
  display: flex;
}

.middle-control-buttons .container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 8px;
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
  display: flex;
}

.right-control-buttons .container {
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

.button-icon.disabled {
  cursor: default;
  opacity: 0.38;
  &:hover {
    background: none;
  }
  &:active {
    transform: unset;
  }
}
</style>
