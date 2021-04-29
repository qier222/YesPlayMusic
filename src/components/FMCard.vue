<template>
  <div class="fm">
    <img
      class="cover"
      :src="track.album && track.album.picUrl | resizeImage(512)"
      @click="goToAlbum"
    />
    <div class="right-part">
      <div class="info">
        <div class="title">{{ track.name }}</div>
        <div class="artist"><ArtistsInLine :artists="artists" /></div>
      </div>
      <div class="controls">
        <div class="buttons">
          <button-icon title="不喜欢" @click.native="moveToFMTrash"
            ><svg-icon id="thumbs-down" icon-class="thumbs-down"
          /></button-icon>
          <button-icon
            :title="$t(isPlaying ? 'player.pause' : 'player.play')"
            class="play"
            @click.native="play"
          >
            <svg-icon :icon-class="isPlaying ? 'pause' : 'play'"
          /></button-icon>
          <button-icon :title="$t('player.next')" @click.native="next"
            ><svg-icon icon-class="next" /></button-icon
        ></div>
        <div class="card-name"><svg-icon icon-class="fm" />私人FM</div>
      </div>
    </div>
  </div>
</template>

<script>
import ButtonIcon from '@/components/ButtonIcon.vue';
import ArtistsInLine from '@/components/ArtistsInLine.vue';
import { mapState } from 'vuex';

export default {
  name: 'FMCard',
  components: { ButtonIcon, ArtistsInLine },
  computed: {
    ...mapState(['player']),
    track() {
      return this.player.personalFMTrack;
    },
    isPlaying() {
      return this.player.playing && this.player.isPersonalFM;
    },
    artists() {
      return this.track.artists || this.track.ar || [];
    },
  },
  methods: {
    play() {
      this.player.playPersonalFM();
    },
    next() {
      this.player.playNextTrack(true);
    },
    goToAlbum() {
      if (this.track.album.id === 0) return;
      this.$router.push({ path: '/album/' + this.track.album.id });
    },
    moveToFMTrash() {
      this.player.moveToFMTrash();
    },
  },
};
</script>

<style lang="scss" scoped>
.fm {
  padding: 1rem;
  background: var(--color-secondary-bg);
  border-radius: 1rem;
  display: flex;
}
.cover {
  height: 164px;
  clip-path: border-box;
  border-radius: 0.75rem;
  margin-right: 1.2rem;
  border: 1px solid rgb(243, 243, 243);
  cursor: pointer;
  user-select: none;
}
.right-part {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: var(--color-text);
  width: 100%;
  .title {
    font-size: 1.6rem;
    font-weight: 600;
    margin-bottom: 0.6rem;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    word-break: break-all;
  }
  .artist {
    opacity: 0.68;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    word-break: break-all;
  }
  .controls {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-left: -0.4rem;
    .buttons {
      display: flex;
    }
    .button-icon {
      margin: 0 8px 0 0;
    }
    .svg-icon {
      width: 24px;
      height: 24px;
    }
    .svg-icon#thumbs-down {
      width: 22px;
      height: 22px;
    }
    .card-name {
      font-size: 1rem;
      opacity: 0.18;
      display: flex;
      align-items: center;
      font-weight: 600;
      user-select: none;
      .svg-icon {
        width: 18px;
        height: 18px;
        margin-right: 6px;
      }
    }
  }
}
</style>
