<template>
  <span class="play-mode-menu" :class="variant">
    <button
      v-if="variant === 'circle'"
      class="play-mode-button-circle"
      :title="$t('player.playModeMenu')"
      :aria-label="$t('player.playModeMenu')"
      @click.stop="openMenu"
    >
      <svg-icon icon-class="shuffle" />
    </button>
    <button-two-tone
      v-else
      :title="$t('player.playModeMenu')"
      :aria-label="$t('player.playModeMenu')"
      @click.native.stop="openMenu"
    >
      <svg-icon icon-class="shuffle" />
      <span v-if="!iconButton">{{ $t('player.playModeMenu') }}</span>
    </button-two-tone>

    <ContextMenu ref="playModeMenu">
      <div
        class="item"
        :class="{ 'is-current': mode === 'cardiac' }"
        @click="play('cardiac')"
      >
        <svg-icon icon-class="heart" />
        {{ $t('contextMenu.cardiacMode') }}
      </div>
      <hr />
      <div
        class="item"
        :class="{ 'is-current': mode === 'order' }"
        @click="play('order')"
      >
        <svg-icon icon-class="order" />
        {{ $t('player.playModeOrder') }}
      </div>
      <div
        class="item"
        :class="{ 'is-current': mode === 'shuffle' }"
        @click="play('shuffle')"
      >
        <svg-icon icon-class="shuffle" />
        {{ $t('player.playModeShuffle') }}
      </div>
    </ContextMenu>
  </span>
</template>

<script>
import { mapState } from 'vuex';
import ContextMenu from '@/components/ContextMenu.vue';
import ButtonTwoTone from '@/components/ButtonTwoTone.vue';

export default {
  name: 'PlayModeMenu',
  components: {
    ContextMenu,
    ButtonTwoTone,
  },
  props: {
    playlistId: {
      type: Number,
      default: 0,
    },
    variant: {
      type: String,
      default: 'circle', // circle：音乐库卡片；tone：歌单页按钮
    },
    iconButton: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      mode: 'order',
    };
  },
  computed: {
    ...mapState(['player']),
  },
  methods: {
    openMenu(e) {
      this.mode = this.player.shuffle
        ? 'shuffle'
        : this.player.repeatMode === 'one'
        ? 'cardiac'
        : 'order';
      this.$refs.playModeMenu.openMenu(e);
    },
    play(mode) {
      if (!this.playlistId) {
        this.$store.dispatch('showToast', '播放列表 ID 无效');
        return;
      }
      const options = { trackID: 'first', noCache: true };
      if (mode === 'cardiac') {
        options.shuffle = false;
        options.repeatMode = 'on';
        this.$store.state.player.playIntelligenceListById(
          this.playlistId,
          'first',
          true
        );
        return;
      }
      if (mode === 'shuffle') {
        options.shuffle = true;
        options.repeatMode = 'on';
      } else {
        options.shuffle = false;
        options.repeatMode = 'on';
      }
      this.$store.state.player.playPlaylistByIDWithMode(
        this.playlistId,
        options
      );
      this.mode = mode;
    },
  },
};
</script>

<style lang="scss" scoped>
.play-mode-menu {
  display: inline-flex;
  align-items: center;
}

.play-mode-button-circle {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 32px;
  width: 32px;
  margin-left: 10px;
  border-radius: 50%;
  background: var(--color-secondary-bg);
  cursor: pointer;
  transition: 0.2s;
  .svg-icon {
    height: 14px;
    width: 14px;
  }
  &:hover {
    transform: scale(1.06);
    background: var(--color-primary-bg);
  }
  &:active {
    transform: scale(0.94);
  }
}

.item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 4px 8px;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  .svg-icon {
    height: 14px;
    width: 14px;
    opacity: 0.7;
  }
  &:hover {
    background: var(--color-secondary-bg-for-transparent);
  }
  &.is-current {
    color: var(--color-primary);
    .svg-icon {
      opacity: 1;
    }
  }
}
</style>
