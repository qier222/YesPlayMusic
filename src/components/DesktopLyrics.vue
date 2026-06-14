<template>
  <div
    class="desktop-lyrics"
    :class="{ locked: settings.locked }"
    :style="styleVars"
  >
    <div
      class="controls"
      :class="{ locked: settings.locked }"
      @mouseenter="setInteractive(true)"
      @mouseleave="setInteractive(false)"
    >
      <template v-if="settings.locked">
        <button
          class="icon-button"
          :title="labels.unlock"
          @click="setLocked(false)"
        >
          <svg-icon icon-class="unlock" />
        </button>
      </template>
      <template v-else>
        <button
          class="icon-button"
          :title="labels.previous"
          @click="playerControl('previous')"
        >
          <svg-icon icon-class="previous" />
        </button>
        <button
          class="icon-button main"
          :title="labels.playPause"
          @click="playerControl('play')"
        >
          <svg-icon :icon-class="state.playing ? 'pause' : 'play'" />
        </button>
        <button
          class="icon-button"
          :title="labels.next"
          @click="playerControl('next')"
        >
          <svg-icon icon-class="next" />
        </button>
        <div class="volume-control" :title="labels.volume">
          <svg-icon :icon-class="volumeIcon" />
          <input
            :value="volumePercent"
            type="range"
            min="0"
            max="100"
            step="1"
            @input="setVolume"
          />
        </div>
        <button
          class="icon-button"
          :title="labels.settings"
          @click="send('desktop-lyrics:open-settings')"
        >
          <svg-icon icon-class="settings" />
        </button>
        <button
          class="icon-button"
          :title="labels.lock"
          @click="setLocked(true)"
        >
          <svg-icon icon-class="lock" />
        </button>
        <button
          class="icon-button close"
          :title="labels.hide"
          @click="send('desktop-lyrics:hide')"
        >
          <svg-icon icon-class="x" />
        </button>
      </template>
    </div>

    <div class="lyrics-shell">
      <div v-if="message" class="placeholder">{{ message }}</div>
      <template v-else>
        <div class="line current" :title="primaryLine">
          {{ primaryLine }}
        </div>
        <div v-if="secondaryLine" class="line secondary" :title="secondaryLine">
          {{ secondaryLine }}
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { normalizeDesktopLyricsSettings } from '@/utils/desktopLyrics';

const electron =
  process.env.IS_ELECTRON === true ? window.require('electron') : null;
const ipcRenderer = electron?.ipcRenderer;

export default {
  name: 'DesktopLyrics',
  data() {
    return {
      settings: normalizeDesktopLyricsSettings(),
      state: {
        status: 'idle',
        currentLine: null,
        nextLine: null,
        playing: false,
        volume: 1,
      },
    };
  },
  computed: {
    styleVars() {
      return {
        '--desktop-lyrics-font-size': `${this.settings.fontSize}px`,
        '--desktop-lyrics-opacity': this.settings.opacity,
        '--desktop-lyrics-current-color': this.settings.currentColor,
        '--desktop-lyrics-next-color': this.settings.nextColor,
      };
    },
    labels() {
      const labels = {
        en: {
          loading: 'Loading lyrics...',
          noLyric: 'No lyrics',
          idle: 'Nothing playing',
          previous: 'Previous Song',
          playPause: 'Play / Pause',
          next: 'Next Song',
          volume: 'Volume',
          hide: 'Hide Desktop Lyrics',
          lock: 'Lock Desktop Lyrics',
          unlock: 'Unlock Desktop Lyrics',
          settings: 'Settings',
        },
        'zh-CN': {
          loading: '歌词加载中...',
          noLyric: '暂无歌词',
          idle: '暂无播放',
          previous: '上一首',
          playPause: '播放 / 暂停',
          next: '下一首',
          volume: '音量',
          hide: '隐藏桌面歌词',
          lock: '锁定桌面歌词',
          unlock: '解锁桌面歌词',
          settings: '设置',
        },
        'zh-TW': {
          loading: '歌詞載入中...',
          noLyric: '暫無歌詞',
          idle: '暫無播放',
          previous: '上一首',
          playPause: '播放 / 暫停',
          next: '下一首',
          volume: '音量',
          hide: '隱藏桌面歌詞',
          lock: '鎖定桌面歌詞',
          unlock: '解鎖桌面歌詞',
          settings: '設定',
        },
        tr: {
          loading: 'Sözler yükleniyor...',
          noLyric: 'Söz yok',
          idle: 'Çalan parça yok',
          previous: 'Önceki',
          playPause: 'Oynat / Duraklat',
          next: 'Sonraki',
          volume: 'Ses',
          hide: 'Masaüstü sözlerini gizle',
          lock: 'Masaüstü sözlerini kilitle',
          unlock: 'Masaüstü sözlerinin kilidini aç',
          settings: 'Ayarlar',
        },
      };
      return labels[this.settings.lang] || labels.en;
    },
    message() {
      if (this.state.status === 'loading') return this.labels.loading;
      if (this.state.status === 'no-lyric') return this.labels.noLyric;
      if (this.state.status === 'idle') return this.labels.idle;
      return '';
    },
    primaryLine() {
      return this.state.currentLine?.contents?.[0] || '';
    },
    secondaryLine() {
      return this.state.currentLine?.contents?.[1] || '';
    },
    volumePercent() {
      return Math.round(Math.min(1, Math.max(0, this.state.volume || 0)) * 100);
    },
    volumeIcon() {
      if (this.volumePercent === 0) return 'volume-mute';
      if (this.volumePercent <= 50) return 'volume-half';
      return 'volume';
    },
  },
  mounted() {
    this.handleSettings = (_, settings) => {
      this.settings = normalizeDesktopLyricsSettings(settings);
    };
    this.handleState = (_, state) => {
      this.state = {
        ...this.state,
        ...state,
      };
    };
    ipcRenderer?.on('desktop-lyrics:settings', this.handleSettings);
    ipcRenderer?.on('desktop-lyrics:state', this.handleState);
    ipcRenderer?.send('desktop-lyrics:renderer-ready');
  },
  beforeDestroy() {
    ipcRenderer?.removeListener('desktop-lyrics:settings', this.handleSettings);
    ipcRenderer?.removeListener('desktop-lyrics:state', this.handleState);
  },
  methods: {
    send(channel) {
      ipcRenderer?.send(channel);
    },
    setLocked(locked) {
      ipcRenderer?.send('desktop-lyrics:set-locked', locked);
    },
    setInteractive(interactive) {
      ipcRenderer?.send('desktop-lyrics:set-interactive', interactive);
    },
    playerControl(command) {
      ipcRenderer?.send('desktop-lyrics:player-control', command);
    },
    setVolume(event) {
      ipcRenderer?.send(
        'desktop-lyrics:set-volume',
        Number(event.target.value) / 100
      );
    },
  },
};
</script>

<style lang="scss">
html,
body {
  background: transparent;
  margin: 0;
  overflow: hidden;
}
</style>

<style lang="scss" scoped>
.desktop-lyrics {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  padding: 30px 24px 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--desktop-lyrics-current-color);
  -webkit-app-region: drag;
  user-select: none;
  overflow: hidden;
}

.desktop-lyrics.locked {
  -webkit-app-region: no-drag;
}

.lyrics-shell {
  width: 100%;
  max-width: 1180px;
  box-sizing: border-box;
  padding: 12px 22px;
  border-radius: 8px;
  background: rgba(10, 12, 18, calc(var(--desktop-lyrics-opacity) * 0.28));
  text-align: center;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.9), 0 0 14px rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(12px);
}

.line {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.current {
  font-size: var(--desktop-lyrics-font-size);
  line-height: 1.22;
  font-weight: 700;
  letter-spacing: 0;
}

.secondary,
.placeholder {
  margin-top: 4px;
  color: var(--desktop-lyrics-next-color);
  opacity: 0.82;
  font-size: calc(var(--desktop-lyrics-font-size) * 0.62);
  line-height: 1.25;
  font-weight: 600;
}

.placeholder {
  margin-top: 0;
  color: var(--desktop-lyrics-current-color);
  font-size: calc(var(--desktop-lyrics-font-size) * 0.72);
}

.controls {
  position: fixed;
  top: 6px;
  left: 50%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 8px;
  border-radius: 8px;
  color: #fff;
  background: rgba(14, 16, 24, 0.7);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(18px);
  opacity: 0;
  transform: translateX(-50%) translateY(-6px);
  transition: opacity 0.18s, transform 0.18s;
  -webkit-app-region: no-drag;
}

.desktop-lyrics:hover .controls,
.controls:hover {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.controls.locked {
  padding: 5px;
}

.icon-button {
  width: 26px;
  height: 26px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.9);
  background: transparent;
  cursor: pointer;
}

.icon-button.main {
  color: #fff;
}

.icon-button.close:hover {
  background: rgba(255, 82, 82, 0.28);
}

.icon-button:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.14);
}

.icon-button .svg-icon {
  width: 16px;
  height: 16px;
}

.volume-control {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 4px;
  color: rgba(255, 255, 255, 0.9);
}

.volume-control .svg-icon {
  width: 16px;
  height: 16px;
}

.volume-control input {
  width: 78px;
  height: 4px;
  accent-color: #fff;
  cursor: pointer;
}
</style>
