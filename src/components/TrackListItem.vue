<template>
  <div class="track" :class="trackClass" :style="trackStyle">
    <img :src="imgUrl | resizeImage" v-if="!isAlbum" @click="goToAlbum" />
    <div class="no" v-if="isAlbum">{{ track.no }}</div>
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
            ><ExplicitSymbol
          /></span>
          <ArtistsInLine :artists="artists" />
        </div>
      </div>
      <div></div>
    </div>
    <div class="album" v-if="!isTracklist && !isAlbum">
      <div class="container">
        <router-link :to="`/album/${track.al.id}`">{{
          track.al.name
        }}</router-link>
      </div>
      <div></div>
    </div>
    <div class="time" v-if="!isTracklist">
      {{ track.dt | formatTime }}
    </div>
  </div>
</template>

<script>
import ArtistsInLine from "@/components/ArtistsInLine.vue";
import ExplicitSymbol from "@/components/ExplicitSymbol.vue";

export default {
  name: "TrackListItem",
  components: { ArtistsInLine, ExplicitSymbol },
  props: {
    track: Object,
  },
  data() {
    return {
      trackClass: [],
      trackStyle: {},
    };
  },
  created() {
    this.trackClass.push(this.type);
    if (!this.track.playable) this.trackClass.push("disable");
    if (this.$parent.itemWidth !== -1)
      this.trackStyle = { width: this.$parent.itemWidth + "px" };
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
  },
  methods: {
    goToAlbum() {
      this.$router.push({ path: "/album/" + this.track.al.id });
    },
  },
};
</script>

<style lang="scss" scoped>
.track {
  display: flex;
  align-items: center;

  padding: 8px;
  border-radius: 12px;

  .no {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    margin: 0 20px 0 10px;
    width: 12px;
    color: rgba(0, 0, 0, 0.58);
    cursor: default;
  }

  .explicit-symbol {
    color: rgba(0, 0, 0, 0.28);
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
    border: 1px solid rgba(0, 0, 0, 0.04);
    cursor: pointer;
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
      color: rgba(0, 0, 0, 0.88);
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
        color: rgba(0, 0, 0, 0.72);
      }
    }
    .artist {
      margin-top: 2px;
      font-size: 13px;
      color: rgba(0, 0, 0, 0.68);
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
      a {
        span {
          margin-right: 3px;
          color: rgba(0, 0, 0, 0.8);
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
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    .container {
      display: flex;
      flex-direction: column;
      &:hover {
        text-decoration: underline;
        cursor: pointer;
      }
    }
    font-size: 16px;
    color: rgba(0, 0, 0, 0.88);
  }
  .time {
    font-size: 16px;
    width: 50px;
    cursor: default;
    display: flex;
    justify-content: flex-end;
    margin-right: 10px;
    font-variant-numeric: tabular-nums;
  }
  &:hover {
    transition: all 0.3s;
    background: #f5f5f7;
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
  .featured {
    color: rgba(0, 0, 0, 0.28) !important;
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
</style>
