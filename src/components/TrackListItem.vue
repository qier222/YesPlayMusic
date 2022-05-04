<template>
  <div
    class="track"
    :class="trackClass"
    :style="trackStyle"
    :title="showUnavailableSongInGreyStyle ? track.reason : ''"
    @mouseover="hover = true"
    @mouseleave="hover = false"
  >
    <img
      v-if="!isAlbum"
      :src="imgUrl"
      loading="lazy"
      :class="{ hover: focus }"
      @click="goToAlbum"
    />
    <div v-if="showOrderNumber" class="no">
      <button v-show="focus && playable && !isPlaying" @click="playTrack">
        <svg-icon
          icon-class="play"
          style="height: 14px; width: 14px"
        ></svg-icon>
      </button>
      <span v-show="(!focus || !playable) && !isPlaying">{{ track.no }}</span>
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
          <span v-if="isAlbum" class="featured">
            <ArtistsInLine
              :artists="track.ar"
              :exclude="$parent.albumObject.artist.name"
              prefix="-"
          /></span>
          <span v-if="isAlbum && track.mark === 1318912" class="explicit-symbol"
            ><ExplicitSymbol
          /></span>
          <span v-if="isSubTitle" :title="subTitle" class="sub-title">
            ({{ subTitle }})
          </span>
        </div>
        <div v-if="!isAlbum" class="artist">
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

    <div v-if="showAlbumName" class="album">
      <router-link v-if="album && album.id" :to="`/album/${album.id}`">{{
        album.name
      }}</router-link>
      <div></div>
    </div>

    <div v-if="showLikeButton" class="actions">
      <button @click="likeThisSong">
        <svg-icon
          icon-class="heart"
          :style="{
            visibility: focus && !isLiked ? 'visible' : 'hidden',
          }"
        ></svg-icon>
        <svg-icon v-show="isLiked" icon-class="heart-solid"></svg-icon>
      </button>
    </div>
    <div v-if="showTrackTime" class="time">
      {{ track.dt | formatTime }}
    </div>

    <div v-if="track.playCount" class="count"> {{ track.playCount }}</div>
  </div>
</template>

<script>
import ArtistsInLine from '@/components/ArtistsInLine.vue';
import ExplicitSymbol from '@/components/ExplicitSymbol.vue';
import { mapState } from 'vuex';
import { isNil } from 'lodash';

export default {
  name: 'TrackListItem',
  components: { ArtistsInLine, ExplicitSymbol },

  props: {
    trackProp: Object,
    highlightPlayingTrack: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return { hover: false, trackStyle: {} };
  },

  computed: {
    ...mapState(['settings']),
    track() {
      return this.type === 'cloudDisk'
        ? this.trackProp.simpleSong
        : this.trackProp;
    },
    playable() {
      return this.track?.privilege?.pl > 0 || this.track?.playable;
    },
    imgUrl() {
      let image =
        this.track?.al?.picUrl ??
        this.track?.album?.picUrl ??
        'https://p2.music.126.net/UeTuwE7pvjBpypWLudqukA==/3132508627578625.jpg';
      return image + '?param=224y224';
    },
    artists() {
      const { ar, artists } = this.track;
      if (!isNil(ar)) return ar;
      if (!isNil(artists)) return artists;
      return [];
    },
    album() {
      return this.track.album || this.track.al || this.track?.simpleSong?.al;
    },
    subTitle() {
      let tn = undefined;
      if (
        this.track?.tns?.length > 0 &&
        this.track.name !== this.track.tns[0]
      ) {
        tn = this.track.tns[0];
      }

      //优先显示alia
      if (this.$store.state.settings.subTitleDefault) {
        return this.track?.alia?.length > 0 ? this.track.alia[0] : tn;
      } else {
        return tn === undefined ? this.track.alia[0] : tn;
      }
    },
    type() {
      return this.$parent.type;
    },
    isAlbum() {
      return this.type === 'album';
    },
    isSubTitle() {
      return (
        (this.track?.tns?.length > 0 &&
          this.track.name !== this.track.tns[0]) ||
        this.track.alia?.length > 0
      );
    },
    isPlaylist() {
      return this.type === 'playlist';
    },
    isLiked() {
      return this.$parent.liked.songs.includes(this.track?.id);
    },
    isPlaying() {
      return this.$store.state.player.currentTrack.id === this.track?.id;
    },
    trackClass() {
      let trackClass = [this.type];
      if (!this.playable && this.showUnavailableSongInGreyStyle)
        trackClass.push('disable');
      if (this.isPlaying && this.highlightPlayingTrack)
        trackClass.push('playing');
      if (this.focus) trackClass.push('focus');
      return trackClass;
    },
    isMenuOpened() {
      return this.$parent.rightClickedTrack.id === this.track.id ? true : false;
    },
    focus() {
      return (
        (this.hover && this.$parent.rightClickedTrack.id === 0) ||
        this.isMenuOpened
      );
    },
    showUnavailableSongInGreyStyle() {
      return process.env.IS_ELECTRON
        ? !this.$store.state.settings.enableUnblockNeteaseMusic
        : true;
    },
    showLikeButton() {
      return this.type !== 'tracklist' && this.type !== 'cloudDisk';
    },
    showOrderNumber() {
      return this.type === 'album';
    },
    showAlbumName() {
      return this.type !== 'album' && this.type !== 'tracklist';
    },
    showTrackTime() {
      return this.type !== 'tracklist';
    },
  },

  methods: {
    goToAlbum() {
      if (this.track.al.id === 0) return;
      this.$router.push({ path: '/album/' + this.track.al.id });
    },
    playTrack() {
      this.$parent.playThisList(this.track.id);
    },
    likeThisSong() {
      this.$parent.likeATrack(this.track.id);
    },
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
  &:hover {
    transform: scale(1.12);
  }
  &:active {
    transform: scale(0.96);
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
    color: var(--color-text);
    cursor: default;
    span {
      opacity: 0.58;
    }
  }

  .explicit-symbol {
    opacity: 0.28;
    color: var(--color-text);
    .svg-icon {
      margin-bottom: -3px;
    }
  }

  .explicit-symbol.before-artist {
    .svg-icon {
      margin-bottom: -3px;
    }
  }

  img {
    border-radius: 8px;
    height: 46px;
    width: 46px;
    margin-right: 20px;
    border: 1px solid rgba(0, 0, 0, 0.04);
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
      color: var(--color-text);
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
        opacity: 0.72;
      }
      .sub-title {
        color: #aeaeae;
        margin-left: 4px;
      }
    }
    .artist {
      margin-top: 2px;
      font-size: 13px;
      opacity: 0.68;
      color: var(--color-text);
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
      a {
        span {
          margin-right: 3px;
          opacity: 0.8;
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
    opacity: 0.88;
    color: var(--color-text);
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
  .time,
  .count {
    font-size: 16px;
    width: 50px;
    cursor: default;
    display: flex;
    justify-content: flex-end;
    margin-right: 10px;
    font-variant-numeric: tabular-nums;
    opacity: 0.88;
    color: var(--color-text);
  }
  .count {
    font-weight: bold;
    font-size: 22px;
    line-height: 22px;
  }
}

.track.focus {
  transition: all 0.3s;
  background: var(--color-secondary-bg);
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
    opacity: 0.28 !important;
  }
  &:hover {
    background: none;
  }
}

.track.tracklist {
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
  background: var(--color-primary-bg);
  color: var(--color-primary);
  .title,
  .album,
  .time,
  .title-and-artist .sub-title {
    color: var(--color-primary);
  }
  .title .featured,
  .artist,
  .explicit-symbol,
  .count {
    color: var(--color-primary);
    opacity: 0.88;
  }
  .no span {
    color: var(--color-primary);
    opacity: 0.78;
  }
}
</style>
