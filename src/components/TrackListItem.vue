<template>
  <div
    class="track"
    :class="trackClass"
    :style="trackStyle"
    :title="track.reason"
    @mouseover="focus = true"
    @mouseleave="focus = false"
  >
    <img
      :src="imgUrl | resizeImage(224)"
      v-if="!isAlbum"
      @click="goToAlbum"
      :class="{ hover: focus }"
    />
    <div class="no" v-if="isAlbum">
      <button v-show="focus && track.playable && !isPlaying" @click="playTrack">
        <svg-icon
          icon-class="play"
          style="height: 14px; width: 14px"
        ></svg-icon>
      </button>
      <span v-show="(!focus || !track.playable) && !isPlaying">{{
        track.no
      }}</span>
      <button v-show="isPlaying">
        <svg-icon
          icon-class="volume"
          style="height: 16px; width: 16px"
        ></svg-icon>
      </button>
    </div>
    <div class="title-and-artist">
      <div class="container">
        <div class="title">
          {{ track.name }}
          <span class="featured" v-if="isAlbum && track.ar.length > 1">
            -
            <ArtistsInLine :artists="track.ar" :showFirstArtist="false"
          /></span>
          <span v-if="isAlbum && track.mark === 1318912" class="explicit-symbol"
            ><ExplicitSymbol
          /></span>
        </div>
        <div class="artist" v-if="!isAlbum">
          <span
            v-if="track.mark === 1318912"
            class="explicit-symbol before-artist"
            ><ExplicitSymbol :size="15"
          /></span>
          <ArtistsInLine :artists="artists" />
        </div>
      </div>
      <div></div>
    </div>
    <div class="album" v-if="!isTracklist && !isAlbum">
      <router-link :to="`/album/${track.al.id}`">{{
        track.al.name
      }}</router-link>
      <div></div>
    </div>
    <div class="actions" v-if="!isTracklist">
      <button v-if="isLoggedIn" @click="likeThisSong">
        <svg-icon
          icon-class="heart"
          :style="{
            visibility:
              focus && !isLiked && track.playable ? 'visible' : 'hidden',
          }"
        ></svg-icon>
        <svg-icon icon-class="heart-solid" v-show="isLiked"></svg-icon>
      </button>
    </div>
    <div class="time" v-if="!isTracklist">
      {{ track.dt | formatTime }}
    </div>
  </div>
</template>

<script>
import { isLoggedIn } from "@/utils/auth";

import ArtistsInLine from "@/components/ArtistsInLine.vue";
import ExplicitSymbol from "@/components/ExplicitSymbol.vue";

export default {
  name: "TrackListItem",
  components: { ArtistsInLine, ExplicitSymbol },
  props: {
    track: Object,
  },
  data() {
    return { focus: false, trackStyle: {} };
  },
  computed: {
    imgUrl() {
      if (this.track.al !== undefined) return this.track.al.picUrl;
      if (this.track.album !== undefined) return this.track.album.picUrl;
      return "";
    },
    artists() {
      if (this.track.ar !== undefined) return this.track.ar;
      if (this.track.artists !== undefined) return this.track.artists;
      return [];
    },
    type() {
      return this.$parent.type;
    },
    isAlbum() {
      return this.type === "album";
    },
    isTracklist() {
      return this.type === "tracklist";
    },
    isPlaylist() {
      return this.type === "playlist";
    },
    isLiked() {
      return this.$parent.liked.songs.includes(this.track.id);
    },
    isPlaying() {
      return this.$store.state.player.currentTrack.id === this.track.id;
    },
    trackClass() {
      let trackClass = [this.type];
      if (!this.track.playable) trackClass.push("disable");
      if (this.isPlaying) trackClass.push("playing");
      return trackClass;
    },
    isLoggedIn() {
      return isLoggedIn();
    },
  },
  methods: {
    goToAlbum() {
      this.$router.push({ path: "/album/" + this.track.al.id });
    },
    playTrack() {
      this.$parent.playThisList(this.track.id);
    },
    likeThisSong() {
      this.$parent.likeASong(this.track.id);
    },
  },
  created() {
    if (this.$parent.itemWidth !== -1)
      this.trackStyle = { width: this.$parent.itemWidth + "px" };
  },
};
</script>

<style lang="scss" scoped>
button {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  background: transparent;
  border-radius: 25%;
  transition: transform 0.2s;
  .svg-icon {
    height: 16px;
    width: 16px;
    color: var(--color-primary);
  }
  &:active {
    transform: scale(0.92);
  }
}

button.play-button {
  opacity: 1;
  .svg-icon {
    height: 14px;
    width: 14px;
    color: var(--color-primary);
  }
}

.track {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 12px;
  user-select: none;

  .no {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    margin: 0 20px 0 10px;
    width: 12px;
    color: var(--color-text-3);
    cursor: default;
  }

  .explicit-symbol {
    color: var(--color-text-5);
    .svg-icon {
      margin-bottom: -3px;
    }
  }

  .explicit-symbol.before-artist {
    margin-right: 2px;
    .svg-icon {
      margin-bottom: -3px;
    }
  }

  img {
    border-radius: 8px;
    height: 56px;
    width: 56px;
    margin-right: 20px;
    border: 1px solid var(--color-border);
    cursor: pointer;
  }

  img.hover {
    filter: drop-shadow(100 200 0 black);
  }

  .title-and-artist {
    flex: 1;
    display: flex;
    .container {
      display: flex;
      flex-direction: column;
    }
    .title {
      font-size: 18px;
      font-weight: 600;
      color: var(--color-text-1);
      cursor: default;
      padding-right: 16px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
      word-break: break-all;
      .featured {
        margin-right: 2px;
        font-weight: 500;
        font-size: 14px;
        color: var(--color-text-2);
      }
    }
    .artist {
      margin-top: 2px;
      font-size: 13px;
      color: var(--color-text-2);
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
      a {
        span {
          margin-right: 3px;
          color: var(--color-text-1);
        }
        &:hover {
          text-decoration: underline;
          cursor: pointer;
        }
      }
    }
  }
  .album {
    flex: 1;
    display: flex;
    font-size: 16px;
    color: var(--color-text-1);
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
  .time {
    font-size: 16px;
    width: 50px;
    cursor: default;
    display: flex;
    justify-content: flex-end;
    margin-right: 10px;
    font-variant-numeric: tabular-nums;
    color: var(--color-text-1);
  }
  &:hover {
    transition: all 0.3s;
    background: var(--color-primary-light);
  }
}
.track.disable {
  img {
    filter: grayscale(1) opacity(0.6);
  }
  .title,
  .artist,
  .album,
  .time,
  .no,
  .featured {
    color: var(--color-text-5) !important;
  }
  &:hover {
    background: none;
  }
}

.track.tracklist {
  width: 256px;
  img {
    height: 36px;
    width: 36px;
    border-radius: 6px;
    margin-right: 14px;
    cursor: pointer;
  }
  .title {
    font-size: 16px;
  }
  .artist {
    font-size: 12px;
  }
}

.track.album {
  height: 32px;
}

.actions {
  width: 80px;
  display: flex;
  justify-content: flex-end;
}

.track.playing {
  background: var(--color-primary-light);
  color: var(--color-primary);
  .title,
  .album {
    color: var(--color-primary);
  }
  .title .featured,
  .artist {
    color: var(--color-primary);
    opacity: 0.88;
  }
  .no span {
    color: var(--color-primary);
    opacity: 0.78;
  }
  .explicit-symbol {
    color: var(--color-primary);
    opacity: 0.88;
  }
}
</style>
