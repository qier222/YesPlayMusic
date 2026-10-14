<template>
  <div v-if="castState.open" class="cast-panel" @click.stop>
    <div class="cast-head">
      <span class="title">{{ $t('cast.title') }}</span>
      <div>
        <button class="link" :disabled="busy" @click="doRefresh">
          {{ busy ? $t('cast.searching') : $t('cast.research') }}
        </button>
        <button class="link close" @click="castState.open = false">✕</button>
      </div>
    </div>

    <div class="cast-opts">
      <label>
        <select v-model="castState.quality" :title="$t('cast.quality')">
          <option value="standard">{{ $t('cast.qStandard') }}</option>
          <option value="exhigh">{{ $t('cast.qExhigh') }}</option>
          <option value="lossless">{{ $t('cast.qLossless') }}</option>
          <option value="hires">{{ $t('cast.qHires') }}</option>
        </select>
      </label>
    </div>

    <div class="cast-opts">
      <label :title="directHint">
        <input
          type="checkbox"
          :checked="castState.direct"
          @change="toggleDirect"
        />
        {{ $t('cast.direct') }}
      </label>
    </div>
    <p v-if="castState.loggedIn === false" class="cast-warn">
      {{ $t('cast.directNeedLogin') }}
    </p>

    <p v-if="castState.error" class="err">{{ castState.error }}</p>

    <ul v-if="visibleDevices.length" class="devices">
      <li
        v-for="d in visibleDevices"
        :key="d.id"
        :class="{ selected: isOn(d.id), active: castState.active[d.id] }"
      >
        <label class="row">
          <input
            v-model="castState.selected"
            type="checkbox"
            :value="d.id"
            @change="onSelect(d.id)"
          />
          <span class="proto" :title="d.protocol">{{
            protoLabel(d.protocol)
          }}</span>
          <span class="name">{{ d.name }}</span>
          <span v-if="d.model" class="model">{{ d.model }}</span>
          <span v-if="isOn(d.id) && deviceStatus[d.id]" class="state">
            {{ stateLabel(deviceStatus[d.id].state) }}
            {{ formatMs(deviceStatus[d.id].position_ms) }}
          </span>
          <span v-if="!d.caps.lossless_passthrough" class="tag">{{
            $t('cast.transcode')
          }}</span>
          <span v-if="d.caps.native_group" class="tag green">{{
            $t('cast.nativeSync')
          }}</span>
        </label>

        <div v-if="isOn(d.id)" class="controls">
          <button @click="castOne(d.id)">{{ $t('cast.pushCurrent') }}</button>
          <button @click="pause(d.id)">{{ $t('cast.pause') }}</button>
          <button @click="resume(d.id)">{{ $t('cast.resume') }}</button>
          <button @click="stop(d.id)">{{ $t('cast.stop') }}</button>
          <input
            type="range"
            min="0"
            max="100"
            :value="volumePercent"
            @change="setVolume(d.id, $event.target.value)"
          />
        </div>
      </li>
    </ul>
    <p v-else class="empty">
      {{ $t('cast.noDevices') }}
    </p>

    <div v-if="castState.selected.length > 1" class="group">
      <button @click="makeGroup">{{ $t('cast.group') }}</button>
      <span v-if="castState.nativeSync" class="hint">
        {{ $t('cast.nativeGroupHint') }}
      </span>
      <span v-else class="hint">{{ $t('cast.softGroupHint') }}</span>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import * as cast from '@/utils/cast';
import { mapState } from 'vuex';

export default {
  name: 'CastDevices',
  data() {
    return {
      castState: cast.castState,
      busy: false,
      savedVolume: null,
      unsubscribe: null,
      // Per-device status polled from the daemon:
      // { [id]: { state, position_ms, duration_ms, ... } }.
      // DLNA renderers report position/duration via the AVTransport service;
      // HEOS renderers report them via `player/get_now_playing_media`.
      deviceStatus: {},
      statusTimer: null,
    };
  },
  computed: {
    // Unlike the Vue 3 fork, `store.state.player` here is a class instance that
    // Vue 2 walked with defineProperty, so `player.currentTrack` (backed by the
    // reactive `_currentTrack`) is itself reactive — no version counter needed.
    ...mapState(['player']),
    currentTrack() {
      return this.player.currentTrack;
    },
    trackID() {
      return (this.currentTrack && this.currentTrack.id) || 0;
    },
    /**
     * A Denon HEOS speaker also advertises itself over DLNA from the same
     * address — the DLNA path works, the HEOS one often stays silent for
     * external URLs, so we hide the HEOS duplicate and keep DLNA.
     */
    visibleDevices() {
      const upnp = {};
      this.castState.devices.forEach(d => {
        if (d.protocol === 'upnp') upnp[d.addr] = true;
      });
      return this.castState.devices.filter(
        d => !(d.protocol === 'heos' && upnp[d.addr])
      );
    },
    directHint() {
      return this.castState.direct
        ? this.$t('cast.directHintOn')
        : this.$t('cast.directHintOff');
    },
    // The one source of truth for cast volume is castState.volume (mirrored
    // from the daemon and written by every control surface). This panel used
    // to keep its own per-device copy, which started at a hard-coded 50 and
    // never followed the main player's slider — the two bars disagreed.
    volumePercent() {
      return Math.round((this.castState.volume || 0) * 100);
    },
  },
  watch: {
    // Once a device is selected, EVERY track change is pushed to it — no
    // separate "auto" switch. Selecting a device is the opt-in.
    trackID(newId, oldId) {
      if (!this.castState.selected.length) return;
      if (!this.currentTrack || !this.currentTrack.name || !this.trackID)
        return;
      if (newId === oldId) return;
      // The renderer restarts the new track at 0. Discard the stale position /
      // duration mirror first, otherwise the player bar keeps showing (and
      // seeking) the previous track's timeline until the next 1s poll.
      this.castState.selected.forEach(id => {
        Vue.delete(this.deviceStatus, id);
        const prev = this.castState.statuses[id];
        if (prev) {
          Vue.set(this.castState.statuses, id, {
            ...prev,
            position_ms: 0,
            duration_ms: this.currentTrack.dt || prev.duration_ms || 0,
          });
        }
      });
      this.pushAll();
    },
    // Enter cast mode (mute local, start polling) when the first device is
    // picked; leave it when the last one is unticked.
    'castState.selected.length'(n) {
      if (n > 0) {
        this.enterCast();
        this.startStatusPoll();
      } else {
        this.exitCast();
        this.stopStatusPoll();
      }
    },
    // Re-push the NetEase cookie every time the user opens the panel.
    // The component mounts once on app start, but the user may not be logged
    // into YPM at that point — logging in later would otherwise leave the
    // daemon with no cookie and silent playback failure
    // ("direct mode: no CDN URL for track ...").
    'castState.open'(on) {
      if (on) this.syncCookie();
    },
  },
  async created() {
    await this.syncCookie();
  },
  async mounted() {
    await this.doRefresh();
    if (this.castState.selected.length) {
      this.enterCast();
      this.startStatusPoll();
    }
    this.unsubscribe = cast.subscribe(e => {
      if (e.type === 'status') {
        Vue.set(
          this.castState.active,
          e.id,
          !!(e.status && e.status.state === 'playing')
        );
      }
      if (e.type === 'device_found') {
        if (!this.castState.devices.some(d => d.id === e.device.id))
          this.castState.devices.push(e.device);
      }
      if (e.type === 'device_lost') {
        this.castState.devices = this.castState.devices.filter(
          d => d.id !== e.id
        );
        this.castState.selected = this.castState.selected.filter(
          id => id !== e.id
        );
      }
    });
  },
  beforeDestroy() {
    if (this.unsubscribe) this.unsubscribe();
    this.stopStatusPoll();
    this.exitCast();
  },
  methods: {
    protoLabel: cast.protoLabel,
    isOn(id) {
      return this.castState.selected.indexOf(id) !== -1;
    },
    /**
     * Direct mode is the escape hatch for "everything works but there is no
     * sound": the renderer then fetches NetEase's CDN itself and never has to
     * open a connection back to this PC.
     */
    async toggleDirect(e) {
      try {
        await cast.setDirect(e.target.checked);
      } catch (err) {
        this.castState.error = `${this.$t('cast.directFailed')}：${
          err.message
        }`;
      }
    },
    /** Give the daemon the cookie YPM already holds, so it can sign URLs. */
    async syncCookie() {
      try {
        // pushCookie() resolves false when there is no MUSIC_U — record that
        // so the panel can warn instead of failing with a cryptic
        // "direct mode: no CDN URL for track ..." from the daemon.
        this.castState.loggedIn = await cast.pushCookie();
      } catch {
        this.castState.loggedIn = false;
      }
    },
    async doRefresh() {
      this.busy = true;
      this.castState.error = '';
      try {
        await cast.refresh();
      } catch (e) {
        // Say it plainly instead of failing silently.
        this.castState.error = `${this.$t('cast.connectFailed')}：${e.message}`;
      } finally {
        this.busy = false;
      }
    },
    /**
     * Mute the local YPM <audio> while casting and remember the level to
     * restore. The local element keeps running (silently) so the queue still
     * advances — that advance is what pushes the next track to the device.
     */
    enterCast() {
      if (this.savedVolume === null) {
        this.savedVolume = this.player.volume;
        this.castState.savedLocalVolume = this.savedVolume;
        this.player.volume = 0;
      }
    },
    exitCast() {
      if (this.savedVolume !== null) {
        this.player.volume = this.savedVolume;
        this.castState.savedLocalVolume = null;
        this.savedVolume = null;
      }
    },
    /**
     * The (muted) local <audio> element is the progress conductor: the queue
     * only advances — and therefore the next track only gets pushed to the
     * device — while it is actually running. If the user ticks a device while
     * local playback is paused, the speaker would play a single song and then
     * stay paused forever ("音乐播放完…切完就暂停，不会继续播放").
     */
    ensureConductor() {
      if (!this.trackID) return;
      if (!this.player.playing && this.player.play) this.player.play();
    },
    /** Tick = connect + push right away. Untick = drop the session. */
    async onSelect(id) {
      try {
        if (this.isOn(id)) {
          this.enterCast();
          await cast.connect(id);
          this.ensureConductor();
          await this.castOne(id);
          this.startStatusPoll();
        } else {
          Vue.set(this.castState.active, id, false);
          await cast.disconnect(id).catch(() => {});
        }
      } catch (e) {
        this.castState.error = `${this.$t('cast.deviceFailed')}：${e.message}`;
      }
    },
    /**
     * Push the current track to every selected device. If a device is already
     * playing, send Stop first — some renderers (notably the Denon Home line
     * under DLNA) silently ignore SetAVTransportURI-while-Playing and keep
     * playing the old URL: the root cause of "切歌了设备还是播同一首".
     */
    async pushAll() {
      const track = cast.toTrack(this.currentTrack);
      if (!track.id) return;
      await Promise.all(
        this.castState.selected.map(id =>
          this.castState.active[id] ? cast.stop(id).catch(() => {}) : null
        )
      );
      try {
        await cast.play(this.castState.selected, track);
        this.enterCast();
        this.ensureConductor();
        this.startStatusPoll();
      } catch (e) {
        this.castState.error = `${this.$t('cast.pushFailed')}：${e.message}`;
      }
    },
    /** Push to a single device (used when the user just selected it). */
    async castOne(id) {
      if (!this.currentTrack || !this.currentTrack.name || !this.trackID)
        return;
      try {
        await cast.play([id], cast.toTrack(this.currentTrack));
        this.startStatusPoll();
      } catch (e) {
        this.castState.error = `${this.$t('cast.pushFailed')}：${e.message}`;
      }
    },
    async pause(id) {
      await cast.pause(id);
    },
    async resume(id) {
      await cast.resume(id);
    },
    async stop(id) {
      await cast.stop(id);
      Vue.set(this.castState.active, id, false);
    },
    async setVolume(id, v) {
      // Route through the shared mirror so the main player's slider, the
      // mute icon and every other surface move together; also applies to
      // all selected devices, which is what a cast session means.
      await cast.setDeviceVolume(Number(v) / 100);
    },
    /**
     * Poll the daemon for status of every selected device. Two consumers:
     *   - this.deviceStatus: drives the per-device dot/time in this panel.
     *   - castState.statuses: read by Player.vue's progress bar and the
     *     play/pause icon, so the main player UI mirrors the remote device
     *     instead of the local `<audio>` element while casting.
     */
    startStatusPoll() {
      if (this.statusTimer) return;
      const tick = async () => {
        for (const id of this.castState.selected) {
          try {
            const s = await cast.status(id);
            Vue.set(this.deviceStatus, id, s);
            Vue.set(this.castState.statuses, id, s);
            Vue.set(this.castState.active, id, s.state === 'playing');
          } catch (e) {
            /* device session may have died between polls — ignore */
          }
        }
      };
      tick();
      this.statusTimer = setInterval(tick, 1000);
    },
    stopStatusPoll() {
      if (this.statusTimer) {
        clearInterval(this.statusTimer);
        this.statusTimer = null;
      }
    },
    stateLabel(s) {
      return (
        {
          playing: this.$t('cast.playing'),
          paused: this.$t('cast.paused'),
          stopped: this.$t('cast.stopped'),
        }[s] || s
      );
    },
    formatMs(ms) {
      if (!ms || ms < 0) return '0:00';
      const total = Math.floor(ms / 1000);
      return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
    },
    async makeGroup() {
      try {
        await cast.group(this.castState.selected);
      } catch (e) {
        this.castState.error = e.message;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.cast-panel {
  position: fixed;
  right: 16px;
  bottom: 92px;
  z-index: 1000;
  width: 380px;
  max-height: 60vh;
  overflow-y: auto;
  padding: 14px 16px;
  border-radius: 12px;
  background: var(--color-body-bg, #fff);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  color: var(--color-text);
  font-size: 14px;
}

.cast-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;

  .title {
    font-weight: 700;
  }
}

.cast-opts {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  font-size: 12px;
  opacity: 0.85;

  label {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
  }
}

.devices {
  list-style: none;
  padding: 0;
  margin: 0;
}

.devices li {
  padding: 6px 0;
  border-bottom: 1px solid var(--color-secondary-bg, #eee);
}

.devices li.active .name {
  font-weight: 700;
}

.row {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.proto {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--color-primary-bg, #eef);
  color: var(--color-primary, #335eea);
}

.model,
.tag,
.state {
  font-size: 11px;
  opacity: 0.6;
}

.cast-warn {
  margin: 0 0 10px;
  color: #d33;
  font-size: 12px;
  line-height: 1.5;
}

.tag.green {
  color: #3a3;
  opacity: 1;
}

.controls {
  display: flex;
  gap: 6px;
  align-items: center;
  margin: 6px 0 0 22px;
}

.controls button {
  font-size: 12px;
}

.group {
  margin-top: 10px;
}

.hint {
  font-size: 12px;
  opacity: 0.7;
  margin-left: 8px;
}

button.link {
  background: none;
  border: none;
  color: var(--color-primary, #335eea);
  cursor: pointer;
  font-size: 12px;
  padding: 2px 4px;
}

button.link.close {
  color: var(--color-text);
  opacity: 0.6;
}

.err {
  color: #d33;
  font-size: 12px;
}

.empty {
  font-size: 12px;
  opacity: 0.7;
}
</style>
