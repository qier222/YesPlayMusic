<template>
  <div class="media-controls">
    <button-icon
      v-show="!player.isPersonalFM"
      :title="
        player.repeatMode === 'one'
          ? $t('player.repeatTrack')
          : $t('player.repeat')
      "
      :class="{ active: player.repeatMode !== 'off' }"
      @click.native="player.switchRepeatMode"
    >
      <svg-icon v-show="player.repeatMode !== 'one'" icon-class="repeat" />
      <svg-icon v-show="player.repeatMode === 'one'" icon-class="repeat-1" />
    </button-icon>
    <div class="middle">
      <button-icon
        v-show="!player.isPersonalFM"
        :title="$t('player.previous')"
        @click.native="player.playPrevTrack"
      >
        <svg-icon icon-class="previous" />
      </button-icon>
      <button-icon
        v-show="player.isPersonalFM"
        title="不喜欢"
        @click.native="player.moveToFMTrash"
      >
        <svg-icon icon-class="thumbs-down" />
      </button-icon>
      <button-icon
        id="play"
        :title="$t(player.playing ? 'player.pause' : 'player.play')"
        @click.native="player.playOrPause"
      >
        <svg-icon :icon-class="player.playing ? 'pause' : 'play'" />
      </button-icon>
      <button-icon
        :title="$t('player.next')"
        @click.native="player.playNextTrack"
      >
        <svg-icon icon-class="next" />
      </button-icon>
    </div>
    <button-icon
      v-show="!player.isPersonalFM"
      :title="$t('player.shuffle')"
      :class="{ active: player.shuffle }"
      @click.native="player.switchShuffle"
    >
      <svg-icon icon-class="shuffle" />
    </button-icon>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import ButtonIcon from '@/components/ButtonIcon.vue';

export default {
  name: 'MediaControls',
  components: {
    ButtonIcon,
  },
  computed: {
    ...mapState(['player']),
    currentTrack() {
      return this.player.currentTrack;
    },
  },
};
</script>

<style lang="scss" scoped>
.media-controls {
  display: flex;
  justify-content: center;
  align-items: center;

  button {
    margin: 0;
  }

  .svg-icon {
    opacity: 0.38;
    height: 14px;
    width: 14px;
  }

  .active .svg-icon {
    opacity: 0.88;
  }

  .middle {
    padding: 0 16px;
    display: flex;
    align-items: center;

    button {
      margin: 0 8px;
    }

    button#play .svg-icon {
      height: 28px;
      width: 28px;
      padding: 2px;
    }

    .svg-icon {
      opacity: 0.88;
      height: 22px;
      width: 22px;
    }
  }
}
</style>
