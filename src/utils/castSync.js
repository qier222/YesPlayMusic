// Shared cast-aware playback state for every surface that can drive playback.
//
// While a device is selected the raw `player` methods only touch the muted
// local <audio>, so a surface that keeps calling them would show — and change —
// a timeline that has nothing to do with what the speaker is playing. Mixing
// this in makes the player bar, the lyrics page and anything else read/write
// the device instead, from one implementation.
//
// Usage: `mixins: [castSync]`, then use `progress` / `progressMax` / `volume` /
// `playing` / `formatProgressTooltip` in the template and call `castGuard` (or
// branch on `isCastMode`) inside `playOrPause` / `mute`.

import * as cast from '@/utils/cast';
import { castState } from '@/utils/cast';
import { formatTrackTime } from '@/utils/common';

// Local playback tier (bitrate or 'flac') -> cast-engine push tier, so the
// speaker asks for roughly what the local player would have asked for.
const CAST_QUALITY = {
  128000: 'standard',
  192000: 'exhigh',
  320000: 'exhigh',
  flac: 'lossless',
  999000: 'hires',
};
export const castQualityFor = q =>
  CAST_QUALITY[String(q)] || (q === 'flac' ? 'lossless' : 'exhigh');

export default {
  data() {
    return {
      castState,
      // Stamps Date.now() when a device status lands; castProgress() advances
      // locally between polls so the bar moves smoothly instead of jumping
      // once a second.
      castLastPoll: 0,
    };
  },
  computed: {
    // True whenever at least one device is ticked in the 「推送到设备」 panel.
    // Deliberately based on `selected`, not on `active`: pausing the device
    // must NOT drop the UI back to the local <audio> element.
    isCastMode() {
      return castState.selected.length > 0;
    },
    castActiveId() {
      return cast.activeId();
    },
    castDeviceName() {
      const id = this.castActiveId;
      if (!id) return '';
      const d = castState.devices.filter(x => x.id === id)[0];
      return d ? d.name : id;
    },
    castStatus() {
      void castState.tick; // re-evaluate on the shared heartbeat
      const id = this.castActiveId;
      return id ? castState.statuses[id] : null;
    },
    castPlaying() {
      const id = this.castActiveId;
      return !!(id && castState.active[id]);
    },
    castProgress() {
      const pos = (this.castStatus && this.castStatus.position_ms) || 0;
      if (this.castPlaying && this.castLastPoll) {
        return pos + (Date.now() - this.castLastPoll);
      }
      return pos;
    },
    castDuration() {
      return (this.castStatus && this.castStatus.duration_ms) || 0;
    },
    progress: {
      get() {
        if (this.isCastMode) return this.castProgress;
        return Math.min(
          this.player.progress || 0,
          this.player.currentTrackDuration || 0
        );
      },
      set(value) {
        // The slider runs on DIFFERENT units per mode:
        //   cast mode  -> milliseconds (device timeline; /api/status uses *_ms)
        //   local mode -> seconds      (player.progress / currentTrackDuration)
        if (this.isCastMode && this.castActiveId) {
          const id = this.castActiveId;
          cast.seek(id, value).catch(() => {});
          // Move the device timeline right away so the bar sticks where the
          // user dropped it instead of snapping back until the next poll.
          const st = castState.statuses[id];
          if (st) {
            this.$set(st, 'position_ms', value);
            this.castLastPoll = Date.now();
          }
          // Keep the (muted) local <audio> roughly in lockstep — but it runs on
          // a SECONDS timeline. Feeding it the millisecond value threw it far
          // past the end of the track, the engine clamped it to `duration`,
          // `ended` fired and the queue advanced: the "拖动进度条会切歌" bug.
          const localDuration = this.player.currentTrackDuration || 0;
          const seconds = value / 1000;
          this.player.progress =
            localDuration > 0
              ? Math.min(seconds, Math.max(0, localDuration - 0.5))
              : seconds;
        } else {
          this.player.progress = value;
        }
      },
    },
    // Slider ceiling. While casting the renderer's duration is authoritative.
    progressMax() {
      return this.isCastMode
        ? this.castDuration || this.player.currentTrackDuration || 0
        : this.player.currentTrackDuration || 0;
    },
    volume: {
      get() {
        return this.isCastMode ? castState.volume : this.player.volume;
      },
      set(value) {
        if (this.isCastMode) {
          cast.setDeviceVolume(value);
          return;
        }
        this.player.volume = value;
      },
    },
    playing() {
      if (this.isCastMode) return this.castPlaying;
      return this.player.playing;
    },
    // Elapsed / total labels next to a slider. Same unit trap as `progress`:
    // the device timeline is in milliseconds, the local one in seconds.
    currentTimeLabel() {
      if (this.isCastMode) return formatTrackTime(this.castProgress / 1000);
      return formatTrackTime(this.player.progress) || '0:00';
    },
    totalTimeLabel() {
      if (this.isCastMode) {
        const ms =
          this.castDuration || (this.player.currentTrackDuration || 0) * 1000;
        return formatTrackTime(ms / 1000);
      }
      return formatTrackTime(this.player.currentTrackDuration);
    },
  },
  watch: {
    // Every fresh status poll re-stamps the receipt time.
    castStatus() {
      this.castLastPoll = Date.now();
    },
    // Keep the cast push tier in lockstep with the local quality setting,
    // wherever the user changes it.
    'settings.musicQuality'(value) {
      castState.quality = castQualityFor(value);
    },
  },
  mounted() {
    castState.quality = castQualityFor(this.settings.musicQuality);
  },
  methods: {
    // Slider tooltip: the bar is in milliseconds while casting, seconds locally.
    formatProgressTooltip(value) {
      return formatTrackTime(this.isCastMode ? value / 1000 : value);
    },
    /** Play/pause that follows cast mode. Call from the component's own hook. */
    castPlayOrPause() {
      const ids = castState.selected.slice();
      if (!ids.length) return;
      // Resolved before any await: assigning to `castState.error` after an
      // await trips require-atomic-updates.
      const failPrefix = `${this.$t('cast.controlFailed')}：`;
      const fail = msg => {
        castState.error = msg;
      };
      const wasPlaying = this.castPlaying;
      const ops = wasPlaying
        ? ids.map(id => cast.pause(id).catch(() => {}))
        : ids.map(id => {
            const s = castState.statuses[id];
            // Never started / stopped => (re)push the current track; a paused
            // renderer just needs Resume.
            if (!s || s.state === 'stopped' || s.state === 'idle') {
              if (!this.currentTrack || !this.currentTrack.id) return null;
              return cast
                .play([id], cast.toTrack(this.currentTrack))
                .catch(() => {});
            }
            return cast.resume(id).catch(() => {});
          });
      return Promise.all(ops)
        .then(() => {
          // Keep the muted local conductor in lockstep so the queue keeps
          // advancing (and therefore keeps pushing the next track).
          if (wasPlaying) {
            if (this.player.pause) this.player.pause();
          } else if (this.player.play) {
            this.player.play();
          }
        })
        .catch(e => fail(failPrefix + e.message));
    },
    /** Mute toggle that follows cast mode. Call from the component's own hook. */
    castMute() {
      cast.toggleDeviceMute();
    },
  },
};
