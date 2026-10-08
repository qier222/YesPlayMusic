<template>
  <div v-if="castState.open" class="cast-panel" @click.stop>
    <div class="cast-head">
      <span class="title">推送到设备</span>
      <div>
        <button class="link" :disabled="busy" @click="doRefresh">
          {{ busy ? '搜索中…' : '重新搜索' }}
        </button>
        <button class="link close" @click="castState.open = false">✕</button>
      </div>
    </div>

    <div class="cast-opts">
      <label>
        <input type="checkbox" v-model="castState.auto" />
        跟随播放自动推送
      </label>
      <label>
        <input type="checkbox" v-model="muteLocal" />
        推送时静音本地
      </label>
      <select v-model="castState.quality" title="推送音质">
        <option value="standard">标准</option>
        <option value="exhigh">极高</option>
        <option value="lossless">无损 FLAC</option>
        <option value="hires">Hi-Res</option>
      </select>
    </div>

    <div class="cast-opts">
      <label :title="directHint">
        <input type="checkbox" :checked="castState.direct" @change="toggleDirect" />
        直连模式（设备直接取网易 CDN）
      </label>
    </div>

    <p v-if="castState.error" class="err">{{ castState.error }}</p>

    <ul v-if="castState.devices.length" class="devices">
      <li
        v-for="d in castState.devices"
        :key="d.id"
        :class="{ selected: isOn(d.id), active: castState.active[d.id] }"
      >
        <label class="row">
          <input
            type="checkbox"
            :value="d.id"
            v-model="castState.selected"
            @change="onSelect(d.id)"
          />
          <span class="proto" :title="d.protocol">{{ protoLabel(d.protocol) }}</span>
          <span class="name">{{ d.name }}</span>
          <span v-if="d.model" class="model">{{ d.model }}</span>
          <span v-if="!d.caps.lossless_passthrough" class="tag">转码</span>
          <span v-if="d.caps.native_group" class="tag green">原生同步</span>
        </label>

        <div v-if="isOn(d.id)" class="controls">
          <button @click="castOne(d.id)">推送当前歌曲</button>
          <button @click="pause(d.id)">暂停</button>
          <button @click="resume(d.id)">继续</button>
          <button @click="stop(d.id)">停止</button>
          <input
            type="range"
            min="0"
            max="100"
            :value="vol[d.id] ?? 50"
            @change="setVolume(d.id, $event.target.value)"
          />
        </div>
      </li>
    </ul>
    <p v-else class="empty">
      没有找到设备 — 确认音箱/播放器与电脑在同一局域网，且 ncm-castd 已启动。
    </p>

    <div v-if="castState.selected.length > 1" class="group">
      <button @click="makeGroup">多设备同步播放</button>
      <span v-if="castState.nativeSync" class="hint">
        该协议原生支持分组（HEOS），同步由设备自己保证。
      </span>
      <span v-else class="hint">软件同步：每 5 秒校正一次漂移。</span>
    </div>
  </div>
</template>

<script>
import * as cast from '@/utils/cast';
import { mapState } from 'vuex';

export default {
  name: 'CastDevices',
  data() {
    return {
      castState: cast.castState,
      busy: false,
      vol: {},
      muteLocal: false,
      savedVolume: null,
      unsubscribe: null,
    };
  },
  computed: {
    ...mapState(['player']),
    currentTrack() {
      return this.player.currentTrack;
    },
    trackID() {
      return this.currentTrack?.id ?? 0;
    },
    directHint() {
      return this.castState.direct
        ? '设备直接向网易 CDN 取流，不需要连回本机。当前：直连。'
        : '设备向本机网关取流（音质更稳、支持 Range 与需登录的曲目）。'
          + '若设备能发现、能连接但始终没有声音（防火墙 / 360 局域网隐身 / 路由器 AP 隔离），'
          + '勾选此项即可。';
    },
  },
  watch: {
    // "跟随播放自动推送": mirror whatever the player starts playing.
    trackID() {
      if (!this.castState.auto || !this.castState.selected.length) return;
      if (!this.currentTrack?.name) return;
      this.pushAll();
    },
    muteLocal(on) {
      if (!on) return;
      if (this.savedVolume === null) this.savedVolume = this.player.volume;
      this.player.volume = 0;
    },
  },
  async created() {
    await this.syncCookie();
  },
  async mounted() {
    await this.doRefresh();
    this.unsubscribe = cast.subscribe(e => {
      if (e.type === 'status') {
        this.$set(this.castState.active, e.id, e.status?.state === 'playing');
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
    if (this.savedVolume !== null) this.player.volume = this.savedVolume;
  },
  methods: {
    protoLabel: cast.protoLabel,
    isOn(id) {
      return this.castState.selected.includes(id);
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
        this.castState.error = `切换直连模式失败：${err.message}`;
      }
    },
    /** Give the daemon the cookie YPM already holds, so it can sign URLs. */
    async syncCookie() {
      try {
        await cast.pushCookie();
      } catch {
        /* not logged in, or daemon down — the push button will report it */
      }
    },
    async doRefresh() {
      this.busy = true;
      this.castState.error = '';
      try {
        await cast.refresh();
      } catch (e) {
        // Say it plainly instead of failing silently.
        this.castState.error = `无法连接推送服务（ncm-castd）：${e.message}`;
      } finally {
        this.busy = false;
      }
    },
    async onSelect(id) {
      try {
        if (this.isOn(id)) await cast.connect(id);
        else await cast.disconnect(id);
      } catch (e) {
        this.castState.error = e.message;
      }
    },
    pushAll() {
      return cast.play(
        this.castState.selected,
        cast.toTrack(this.currentTrack)
      );
    },
    async castOne(id) {
      if (!this.currentTrack?.name) return;
      try {
        await cast.play([id], cast.toTrack(this.currentTrack));
      } catch (e) {
        this.castState.error = e.message;
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
      this.$set(this.castState.active, id, false);
    },
    async setVolume(id, v) {
      this.$set(this.vol, id, Number(v));
      await cast.volume(id, Number(v));
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
.tag {
  font-size: 11px;
  opacity: 0.6;
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
