<script>
import { mapState } from 'vuex';
import { getLyricToShow, loadParsedLyrics } from '@/utils/lyricsManager';
import { getCurrentLyricLine } from '@/utils/lyrics';
import { normalizeDesktopLyricsSettings } from '@/utils/desktopLyrics';

const electron =
  process.env.IS_ELECTRON === true ? window.require('electron') : null;
const ipcRenderer = electron?.ipcRenderer;

export default {
  name: 'DesktopLyricsBridge',
  data() {
    return {
      parsedLyrics: null,
      loadingTrackId: null,
      timer: null,
      lastPayload: '',
      loadToken: 0,
    };
  },
  computed: {
    ...mapState(['player', 'settings']),
    desktopLyricsSettings() {
      return normalizeDesktopLyricsSettings(this.settings.desktopLyrics);
    },
    currentTrack() {
      return this.player.currentTrack;
    },
    shouldSync() {
      return (
        process.env.IS_ELECTRON === true &&
        this.desktopLyricsSettings.enabled &&
        this.desktopLyricsSettings.visible
      );
    },
  },
  watch: {
    'currentTrack.id': {
      handler() {
        this.loadLyrics();
      },
      immediate: true,
    },
    shouldSync(syncing) {
      if (syncing) {
        this.loadLyrics();
        this.tick();
      } else {
        this.sendState({ status: 'idle' });
      }
    },
    'settings.showLyricsTranslation'() {
      this.tick();
    },
    'settings.lyricType'() {
      this.tick();
    },
  },
  created() {
    if (!ipcRenderer) return;
    this.handleSettingsUpdated = (_, desktopLyrics) => {
      this.$store.commit(
        'updateDesktopLyricsFromMain',
        normalizeDesktopLyricsSettings(desktopLyrics)
      );
    };
    ipcRenderer.on(
      'desktop-lyrics:settings-updated',
      this.handleSettingsUpdated
    );
  },
  mounted() {
    if (!ipcRenderer) return;
    this.timer = setInterval(this.tick, 120);
  },
  beforeDestroy() {
    clearInterval(this.timer);
    if (ipcRenderer && this.handleSettingsUpdated) {
      ipcRenderer.removeListener(
        'desktop-lyrics:settings-updated',
        this.handleSettingsUpdated
      );
    }
  },
  methods: {
    async loadLyrics() {
      if (!this.shouldSync) return;
      const track = this.currentTrack;
      if (!this.player.enabled || !track?.id || !track?.name) {
        this.parsedLyrics = null;
        this.sendState({ status: 'idle', trackId: null });
        return;
      }

      const token = ++this.loadToken;
      this.loadingTrackId = track.id;
      this.parsedLyrics = null;
      this.sendState({
        status: 'loading',
        trackId: track.id,
        currentLine: null,
        nextLine: null,
      });

      try {
        const parsedLyrics = await loadParsedLyrics(track);
        if (token !== this.loadToken || track.id !== this.currentTrack?.id) {
          return;
        }
        this.loadingTrackId = null;
        this.parsedLyrics = parsedLyrics;
        this.tick();
      } catch {
        this.loadingTrackId = null;
        this.parsedLyrics = {
          lyric: [],
          tlyric: [],
          romalyric: [],
          lyricType: 'translation',
        };
        this.sendState({
          status: 'no-lyric',
          trackId: track.id,
          currentLine: null,
          nextLine: null,
        });
      }
    },
    tick() {
      if (!this.shouldSync) return;
      const track = this.currentTrack;
      if (!this.player.enabled || !track?.id || !track?.name) {
        this.sendState({ status: 'idle', trackId: null });
        return;
      }
      if (this.loadingTrackId === track.id) {
        this.sendState({ status: 'loading', trackId: track.id });
        return;
      }
      if (!this.parsedLyrics || this.parsedLyrics.lyric.length === 0) {
        this.sendState({
          status: 'no-lyric',
          trackId: track.id,
          currentLine: null,
          nextLine: null,
        });
        return;
      }

      let lyricType = this.settings.lyricType || this.parsedLyrics.lyricType;
      if (
        lyricType === 'romaPronunciation' &&
        !this.parsedLyrics.romalyric.length
      ) {
        lyricType = 'translation';
      }
      if (lyricType === 'translation' && !this.parsedLyrics.tlyric.length) {
        lyricType = this.parsedLyrics.romalyric.length
          ? 'romaPronunciation'
          : 'translation';
      }
      const lyricsForDisplay = {
        ...this.parsedLyrics,
        lyricType,
        tlyric:
          this.settings.showLyricsTranslation && lyricType === 'translation'
            ? this.parsedLyrics.tlyric
            : [],
        romalyric:
          this.settings.showLyricsTranslation &&
          lyricType === 'romaPronunciation'
            ? this.parsedLyrics.romalyric
            : [],
      };
      const lyricToShow = getLyricToShow(lyricsForDisplay);
      const progress = this.player.seek(null, false) ?? 0;
      const current = getCurrentLyricLine(
        lyricToShow,
        this.parsedLyrics.lyric,
        progress
      );

      this.sendState({
        status: current?.currentLine ? 'ready' : 'no-lyric',
        trackId: track.id,
        currentLine: current?.currentLine || null,
        nextLine: current?.nextLine || null,
        playing: this.player.playing,
        volume: this.player.volume,
        progress,
      });
    },
    sendState(state) {
      const stateWithPlayer = {
        playing: this.player ? this.player.playing : false,
        volume: this.player ? this.player.volume : 1,
        ...state,
      };
      const payload = JSON.stringify(stateWithPlayer);
      if (payload === this.lastPayload) return;
      this.lastPayload = payload;
      ipcRenderer?.send('desktop-lyrics:state', stateWithPlayer);
    },
  },
  render() {
    return null;
  },
};
</script>
