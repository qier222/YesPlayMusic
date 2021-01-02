<template>
  <div
    class="cover"
    @mouseover="focus = true"
    @mouseleave="focus = false"
    :class="{ 'cover-hover': coverHover }"
    @click="clickCoverToPlay ? play() : goTo()"
  >
    <div class="cover-container">
      <div class="shade">
        <button
          v-show="focus"
          class="play-button"
          @click.stop="play()"
          :style="playButtonStyles"
          ><svg-icon icon-class="play" />
        </button>
      </div>
      <img :src="imageUrl" :style="imageStyles" />
      <transition name="fade" v-if="coverHover || alwaysShowShadow">
        <div
          class="shadow"
          v-show="focus || alwaysShowShadow"
          :style="shadowStyles"
        ></div>
      </transition>
    </div>
  </div>
</template>

<script>
import { playAlbumByID, playPlaylistByID, playArtistByID } from "@/utils/play";

export default {
  props: {
    id: { type: Number, required: true },
    type: { type: String, required: true },
    imageUrl: { type: String, required: true },
    fixedSize: { type: Number, default: 0 },
    playButtonSize: { type: Number, default: 22 },
    coverHover: { type: Boolean, default: true },
    alwaysShowPlayButton: { type: Boolean, default: true },
    alwaysShowShadow: { type: Boolean, default: false },
    clickCoverToPlay: { type: Boolean, default: false },
    shadowMargin: { type: Number, default: 12 },
    radius: { type: Number, default: 12 },
  },
  data() {
    return {
      focus: false,
    };
  },
  computed: {
    imageStyles() {
      let styles = {};
      if (this.fixedSize !== 0) {
        styles.width = this.fixedSize + "px";
      }
      if (this.type === "artist") styles.borderRadius = "50%";
      return styles;
    },
    playButtonStyles() {
      let styles = {};
      styles.width = this.playButtonSize + "%";
      styles.height = this.playButtonSize + "%";
      return styles;
    },
    shadowStyles() {
      let styles = {};
      styles.backgroundImage = `url(${this.imageUrl})`;
      if (this.type === "artist") styles.borderRadius = "50%";
      return styles;
    },
  },
  methods: {
    play() {
      const playActions = {
        album: playAlbumByID,
        playlist: playPlaylistByID,
        artist: playArtistByID,
      };
      playActions[this.type](this.id);
    },
    goTo() {
      this.$router.push({ name: this.type, params: { id: this.id } });
    },
  },
};
</script>

<style lang="scss" scoped>
.cover {
  position: relative;
  transition: transform 0.3s;
}
.cover-container {
  position: relative;
}
img {
  border-radius: 0.75em;
  width: 100%;
  user-select: none;
}

.cover-hover {
  &:hover {
    cursor: pointer;
    transform: scale(1.02);
  }
}

.shade {
  position: absolute;
  top: 0;
  height: calc(100% - 3px);
  width: 100%;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
}
.play-button {
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  backdrop-filter: blur(12px) brightness(96%);
  background: transparent;
  height: 22%;
  width: 22%;
  border-radius: 50%;
  cursor: default;
  transition: 0.2s;
  .svg-icon {
    height: 44%;
    margin: {
      left: 4px;
    }
  }
  &:hover {
    transform: scale(1.06);
  }
  &:active {
    transform: scale(0.94);
  }
}

.shadow {
  position: absolute;
  top: 12px;
  height: 100%;
  width: 100%;
  filter: blur(16px) opacity(0.6);
  transform: scale(0.92, 0.96);
  z-index: -1;
  background-size: cover;
  border-radius: 0.75em;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
