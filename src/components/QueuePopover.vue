<template>
  <div
    class="queue-popover"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <button-icon :title="$t('player.next')" @click.native="goToNextTracksPage">
      <svg-icon icon-class="list" />
    </button-icon>

    <transition name="queue-pop">
      <div v-if="show" class="queue-popover-panel">
        <div class="queue-section">
          <div class="queue-section-title">
            <span class="bars" :class="{ playing: isPlaying }">
              <i /><i /><i />
            </span>
            {{ $t('next.nowPlaying') }}
          </div>
          <div
            v-if="currentTrack.id"
            class="queue-item is-current"
            @click="playTrack(currentTrack.id)"
          >
            <span class="queue-item-name">{{ currentTrack.name }}</span>
            <span class="queue-item-artist">{{
              currentTrack.ar?.map(a => a.name).join('/') || ''
            }}</span>
          </div>
        </div>

        <div v-if="playNextList.length > 0" class="queue-section">
          <div class="queue-section-title">
            {{ $t('queue.playNext') }}
            <button class="queue-clear" @click.stop="clearPlayNextList">
              {{ $t('queue.clearQueue') }}
            </button>
          </div>
          <div
            v-for="tid in playNextList"
            :key="'pn-' + tid"
            class="queue-item"
            @click="playTrack(tid)"
          >
            <span class="queue-item-name">{{ trackNameOf(tid) || '...' }}</span>
          </div>
        </div>

        <div class="queue-section">
          <div class="queue-section-title">{{ $t('next.nextUp') }}</div>
          <div v-if="loading" class="queue-empty">
            {{ $t('queue.loading') }}
          </div>
          <div v-else-if="loadFailed" class="queue-empty">
            {{ $t('queue.loadFailed') }}
            <button class="queue-clear" @click.stop="loadTracks">
              {{ $t('queue.retry') }}
            </button>
          </div>
          <div v-else-if="upcomingTracks.length === 0" class="queue-empty">
            {{ $t('queue.empty') }}
          </div>
          <div
            v-for="track in upcomingTracks"
            :key="'up-' + track.id"
            class="queue-item"
            @click="playTrack(track.id)"
          >
            <span class="queue-item-name">{{ track.name }}</span>
            <span class="queue-item-artist">{{
              track.ar?.map(a => a.name).join('/') || ''
            }}</span>
            <span class="queue-item-duration">{{
              formatTrackTime(track.dt)
            }}</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { getTrackDetail } from '@/api/track';
import { formatTrackTime } from '@/utils/common';
import ButtonIcon from '@/components/ButtonIcon.vue';

export default {
  name: 'QueuePopover',
  components: { ButtonIcon },
  data() {
    return {
      show: false,
      tracks: [],
      loading: false,
      loadFailed: false,
      openTimer: null,
      closeTimer: null,
    };
  },
  computed: {
    ...mapState(['player']),
    currentTrack() {
      return this.player.currentTrack ?? {};
    },
    isPlaying() {
      return this.player.playing;
    },
    playNextList() {
      return this.player.playNextList ?? [];
    },
    upcomingIds() {
      const list = this.player.list ?? [];
      const current = this.player.current ?? 0;
      return list.slice(current + 1, current + 101);
    },
    upcomingTracks() {
      return this.upcomingIds
        .map(tid => this.tracks.find(t => t.id === tid))
        .filter(t => t);
    },
  },
  methods: {
    onMouseEnter() {
      clearTimeout(this.closeTimer);
      this.openTimer = setTimeout(() => {
        this.show = true;
        this.loadTracks();
      }, 120);
    },
    onMouseLeave() {
      clearTimeout(this.openTimer);
      this.closeTimer = setTimeout(() => {
        this.show = false;
      }, 200);
    },
    loadTracks() {
      const trackIDs = [...this.upcomingIds, ...this.playNextList];
      if (trackIDs.length === 0) {
        this.tracks = [];
        this.loading = false;
        this.loadFailed = false;
        return;
      }
      this.loading = true;
      this.loadFailed = false;
      getTrackDetail(trackIDs.join(','))
        .then(data => {
          this.tracks = data.songs ?? [];
        })
        .catch(() => {
          this.loadFailed = true;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    trackNameOf(id) {
      const t = this.tracks.find(item => item.id === id);
      return t ? t.name : '';
    },
    playTrack(id) {
      this.player.playTrackOnListByID(id);
      this.loadTracks();
    },
    clearPlayNextList() {
      this.player.clearPlayNextList();
      this.loadTracks();
    },
    goToNextTracksPage() {
      this.$router.push({ name: 'next' });
    },
    formatTrackTime,
  },
};
</script>

<style lang="scss" scoped>
.queue-popover {
  position: relative;
  display: flex;
}

.queue-popover-panel {
  position: absolute;
  bottom: calc(100% + 12px);
  right: 0;
  width: 320px;
  max-height: 420px;
  overflow-y: auto;
  padding: 14px 8px;
  border-radius: 12px;
  // ⚠️ There is no `--color-bg` in this project: the real tokens are
  // `--color-body-bg` / `--color-text` (see src/assets/css/global.scss). Using
  // the wrong name made every theme fall back to the dark #222 panel.
  background: var(--color-body-bg);
  color: var(--color-text);
  border: 1px solid var(--color-secondary-bg);
  box-shadow: 0 10px 30px -8px rgba(0, 0, 0, 0.5);
  z-index: 100;
  cursor: default;
  text-align: left;
}

.queue-section + .queue-section {
  margin-top: 14px;
}

.queue-section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px 6px;
  font-size: 12px;
  font-weight: 600;
  opacity: 0.66;
  text-transform: uppercase;
}

.bars {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  height: 10px;
  i {
    width: 2px;
    height: 4px;
    background: var(--color-primary);
    border-radius: 1px;
  }
  &.playing i {
    animation: bar-bounce 0.9s ease-in-out infinite;
    &:nth-child(2) {
      animation-delay: 0.15s;
    }
    &:nth-child(3) {
      animation-delay: 0.3s;
    }
  }
}

@keyframes bar-bounce {
  0%,
  100% {
    height: 4px;
  }
  50% {
    height: 10px;
  }
}

.queue-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: var(--color-secondary-bg-for-transparent);
  }
  &.is-current {
    color: var(--color-primary);
  }
}

.queue-item-name {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.queue-item-artist {
  font-size: 11px;
  opacity: 0.6;
  max-width: 40%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.queue-item-duration {
  font-size: 11px;
  opacity: 0.5;
}

.queue-empty {
  padding: 10px 8px;
  font-size: 12px;
  opacity: 0.6;
}

.queue-clear {
  margin-left: auto;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 6px;
  // A bare <button> keeps the UA's light background in the dark theme.
  border: none;
  background: transparent;
  color: inherit;
  font-family: inherit;
  opacity: 0.7;
  cursor: pointer;
  &:hover {
    opacity: 1;
    background: var(--color-secondary-bg);
  }
}

.queue-pop-enter-active,
.queue-pop-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
}
.queue-pop-enter,
.queue-pop-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
