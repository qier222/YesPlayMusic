<template>
  <div>
    <div class="img" @mousedown.prevent="$emit('play-song')">
      <img :src="imgUrl" />
      <svg-icon icon-class="play"></svg-icon>
    </div>
    <div class="song-item-info" @click="goToAlbum">
      <div class="song-item-title">{{ track.name }}</div>
      <ArtistsInLine :artists="artists" class="song-item-singer" />
    </div>
  </div>
</template>

<script>
import ArtistsInLine from '@/components/ArtistsInLine.vue';

export default {
  components: { ArtistsInLine },
  props: {
    track: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    imgUrl() {
      let image =
        this.track?.al?.picUrl ??
        this.track?.album?.picUrl ??
        'https://p2.music.126.net/UeTuwE7pvjBpypWLudqukA==/3132508627578625.jpg';
      return image + '?param=224y224';
    },
    artists() {
      if (this.track.ar !== undefined) return this.track.ar;
      if (this.track.artists !== undefined) return this.track.artists;
      return [];
    },
  },
  methods: {
    goToAlbum() {
      this.$router.push({ path: '/album/' + this.track.al.id });
      // this.$nextTick(() => this.$emit('de-focus-searchBar'));
    },
  },
};
</script>

<style lang="scss" scoped>
.img {
  position: relative;
  img {
    border-radius: 8px;
    height: 38px;
    width: 38px;
    background: #7e7e7e;
    overflow: hidden;
  }
  .svg-icon {
    transform: scale(0.5);
    opacity: 0;
    position: absolute;
    left: 0;
    height: 38px;
    width: 38px;
  }
  &:hover {
    .svg-icon {
      opacity: 0.7;
    }
  }
}

.song-item-info {
  margin-left: 0.5rem;
  flex: 1;
  word-break: break-all;
  .song-item-title {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
    font-weight: 600;
  }
  .song-item-singer {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
    opacity: 0.68;
    font-size: 12px;
  }
}
</style>
