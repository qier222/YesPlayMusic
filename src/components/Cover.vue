<template>
  <div style="position: relative">
    <transition name="zoom">
      <div
        class="cover"
        @mouseover="focus = true"
        @mouseleave="focus = false"
        :style="coverStyle"
        :class="{
          'hover-float': hoverEffect,
          'hover-play-button': showPlayButton,
        }"
        @click="clickToPlay ? play() : goTo()"
      >
        <button
          class="play-button"
          v-if="showPlayButton"
          :style="playButtonStyle"
          @click.stop="playButtonClicked"
        >
          <svg-icon icon-class="play" />
        </button>
      </div>
    </transition>

    <transition name="fade" v-if="hoverEffect">
      <img class="shadow" v-show="focus" :src="url" :style="shadowStyle"
    /></transition>
    <img
      class="shadow"
      v-if="alwaysShowShadow"
      :src="url"
      :style="shadowStyle"
    />
  </div>
</template>

<script>
import { playAlbumByID, playPlaylistByID, playArtistByID } from "@/utils/play";

export default {
  name: "Cover",
  props: {
    id: Number,
    type: String,
    url: String,
    hoverEffect: Boolean,
    showPlayButton: Boolean,
    alwaysShowShadow: Boolean,
    showBlackShadow: Boolean,
    clickToPlay: Boolean,
    size: {
      type: Number,
      default: 208,
    },
    shadowMargin: {
      type: Number,
      default: 12,
    },
    radius: {
      type: Number,
      default: 12,
    },
    playButtonSize: {
      type: Number,
      default: 48,
    },
  },
  data() {
    return {
      focus: false,
      shadowStyle: {},
      playButtonStyle: {},
    };
  },
  created() {
    this.shadowStyle = {
      height: `${this.size}px`,
      width: `${this.size}px`,
      top: `${this.shadowMargin}px`,
      borderRadius: `${this.radius}px`,
    };
    this.playButtonStyle = {
      height: `${this.playButtonSize}px`,
      width: `${this.playButtonSize}px`,
    };
  },
  computed: {
    coverStyle() {
      return {
        backgroundImage: `url('${this.url}')`,
        boxShadow: this.showBlackShadow
          ? "0 12px 16px -8px rgba(0, 0, 0, 0.2)"
          : "",
        height: `${this.size}px`,
        width: `${this.size}px`,
        borderRadius: `${this.radius}px`,
        cursor: this.clickToPlay ? "default" : "pointer",
      };
    },
  },
  methods: {
    play() {
      if (this.type === "album") {
        playAlbumByID(this.id);
      } else if (this.type === "playlist") {
        playPlaylistByID(this.id);
      }
    },
    playButtonClicked() {
      if (this.type === "album") {
        playAlbumByID(this.id);
      } else if (this.type === "playlist") {
        playPlaylistByID(this.id);
      } else if (this.type === "artist") {
        playArtistByID(this.id);
      }
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
  padding: 0;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.3s;
}

.hover-float {
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 12px 16px -8px rgba(0, 0, 0, 0.05);
  }
}

.hover-play-button {
  &:hover {
    .play-button {
      visibility: visible;
      transform: unset;
    }
  }
  .play-button {
    &:hover {
      transform: scale(1.06);
    }
    &:active {
      transform: scale(0.94);
    }
  }
}

.shadow {
  position: absolute;
  filter: blur(16px) opacity(0.6);
  z-index: -1;
  height: 208px;
}
.play-button {
  visibility: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  // right: 72px;
  // top: 72px;
  border: none;
  backdrop-filter: blur(12px) brightness(96%);
  background: transparent;
  color: white;
  border-radius: 50%;
  cursor: default;
  transition: 0.2s;
  .svg-icon {
    height: 50%;
    margin: {
      left: 3px;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
