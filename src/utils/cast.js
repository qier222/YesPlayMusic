// ncm-cast client — talks to the local `ncm-castd` daemon over plain HTTP.
//
// No IPC and no native module: the daemon owns one port and the renderer just
// fetches it. Drop this file in as `src/utils/cast.js`.
//
// The daemon is the same one YesPlayMusic already uses for its NetEase API —
// it lives next to it as a third local service (YPM: 10754 + 27232, cast: 9100).

import Vue from 'vue';

const BASE = process.env.VUE_APP_CAST_URL || 'http://127.0.0.1:9100';

/**
 * Shared cast state. `Vue.observable` keeps it reactive without adding a Vuex
 * module, so the player-bar button and the device panel stay in sync.
 */
export const castState = Vue.observable({
  open: false, // panel visible
  ready: false, // daemon answered at least once
  devices: [], // device list
  selected: [], // device ids the main player currently drives
  nativeSync: false, // true => the protocol groups the devices itself (HEOS)
  quality: 'lossless', // standard | exhigh | lossless | hires
  // false => the renderer pulls from our gateway on this machine.
  // true  => the renderer pulls straight from the NetEase CDN. Flip this when
  //          the renderer cannot reach this PC (firewall / 360 LAN stealth /
  //          router AP isolation): everything succeeds but nothing plays.
  //
  // Must default to **true** to match the daemon's `--direct` launch flag in
  // `src/electron/castService.js`. `/api/play` overrides the engine with
  // whatever this value is, so leaving it false silently drags the daemon back
  // into gateway mode on every push even though it was started with --direct.
  direct: true,
  error: '',
  // id -> playing. Written optimistically by the commands below and confirmed
  // by the status poll, so the play/pause icon reacts instantly instead of
  // waiting up to a second for a round-trip.
  active: {}, // id -> playing
  // id -> { state, position_ms, duration_ms, volume, muted } from /api/status.
  // Written by CastDevices polling, read by the main Player bar to drive the
  // play/pause icon and progress slider while a device is selected.
  statuses: {},
  // Device volume, 0..1. The player bar shows/edits this while casting, so
  // dragging the slider talks to the speaker rather than the muted local
  // <audio>. Kept in sync from the daemon status when the device reports it.
  volume: 1,
  lastVolume: 1, // restored by the mute toggle
  // Timestamp of the last user-driven volume change. Status polling skips the
  // device-reported volume for a short window afterwards so a stale in-flight
  // poll can't yank the slider back mid-drag.
  volumeSetAt: 0,
  // Local YPM volume saved when cast mode starts, restored when it ends.
  savedLocalVolume: null,
  // Bumped once a second by a single shared timer. Every surface that mirrors
  // the device timeline (player bar, lyrics page, ...) reads it so they all
  // advance together instead of each running its own poll.
  tick: 0,
  // null = not checked yet; false = no MUSIC_U in localStorage. Direct mode
  // needs a NetEase login (see PATCH.md: unauthenticated requests get
  // rate-limited and intermittently return an empty CDN URL).
  loggedIn: null,
});

// --------------------------------------------------------------- helpers

/** True when the user has picked at least one device to drive. */
export const isCasting = () => castState.selected.length > 0;

/** The device commands should target: the first one playing, else the first selected. */
export function activeId() {
  const act = castState.active || {};
  const keys = Object.keys(act);
  for (let i = 0; i < keys.length; i++) {
    if (act[keys[i]] && castState.selected.indexOf(keys[i]) !== -1) {
      return keys[i];
    }
  }
  return castState.selected[0] || null;
}

function markActive(ids, on) {
  (Array.isArray(ids) ? ids : [ids]).forEach(id => {
    if (id) Vue.set(castState.active, id, !!on);
  });
}

async function call(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || `cast: ${path} failed`);
  castState.ready = true;
  return json.data;
}

const post = (path, body) =>
  call(path, { method: 'POST', body: JSON.stringify(body) });

// ---------------------------------------------------------------- devices

/** One discovery sweep. Returns `{ added, lost }`. */
export const refresh = async () => {
  const r = await post('/api/refresh');
  castState.devices = await call('/api/devices');
  castState.error = '';
  return r;
};

export const devices = () => call('/api/devices');
export const connect = id => post('/api/connect', { id });
export const disconnect = id => post('/api/disconnect', { id });

// --------------------------------------------------------------- playback

/** Protocol of a known device id, or undefined. */
const protoOf = id => {
  const found = castState.devices.filter(d => d.id === id)[0];
  return found ? found.protocol : undefined;
};

/**
 * Which delivery mode a push should use.
 *
 * HEOS (Denon/Marantz) is notoriously picky about external HTTPS CDN URLs and
 * frequently accepts `play_stream` yet stays silent — while it is happy to pull
 * a plain-HTTP stream that advertises Content-Length and Range support, which
 * is exactly what our own gateway serves. So when every target is HEOS we route
 * through the local gateway instead of straight to the NetEase CDN.
 */
function directFor(list) {
  const ids = Array.isArray(list) ? list : [list];
  if (!ids.length) return castState.direct;
  const heosOnly = ids.every(id => protoOf(id) === 'heos');
  return heosOnly ? false : castState.direct;
}

/**
 * Push one track to one or more devices.
 * `track` is a cast-engine Track: { id, title, artist, album, duration_ms, cover, quality }
 */
export const play = (ids, track) =>
  post('/api/play', { ids, track, direct: directFor(ids) }).then(r => {
    markActive(ids, true);
    return r;
  });

/** Push a queue; the daemon advances automatically on end-of-track. */
export const playQueue = (ids, tracks) =>
  post('/api/queue', { ids, tracks, direct: directFor(ids) }).then(r => {
    markActive(ids, true);
    return r;
  });

/**
 * Switch how renderers get their audio.
 * `false` (default) — they fetch from our gateway, which gives a stable MIME
 * type, a real Content-Length, working Range, and works for tracks that need a
 * cookie. `true` — they fetch the NetEase CDN URL directly, which needs no
 * inbound connection to this machine at all.
 */
export async function setDirect(on) {
  castState.direct = await post('/api/direct', { direct: !!on });
  return castState.direct;
}

/** Daemon info: LAN address, port, delivery mode. */
export const info = () => call('/api/info');

export const next = ids => post('/api/next', { ids });
export const pause = id =>
  post('/api/pause', { id }).then(r => {
    markActive(id, false);
    return r;
  });
export const resume = id =>
  post('/api/resume', { id }).then(r => {
    markActive(id, true);
    return r;
  });
export const stop = id =>
  post('/api/stop', { id }).then(r => {
    markActive(id, false);
    return r;
  });
export const volume = (id, v) => post('/api/volume', { id, volume: v });
export const mute = (id, m) => post('/api/mute', { id, muted: m });

/** Poll one device. Also refreshes the device-volume mirror when reported. */
export const status = id =>
  call(`/api/status?id=${encodeURIComponent(id)}`).then(s => {
    if (
      s &&
      s.volume != null &&
      Date.now() - (castState.volumeSetAt || 0) > 1500
    ) {
      castState.volume = s.volume / 100;
      if (s.volume > 0) castState.lastVolume = s.volume / 100;
    }
    return s;
  });

/**
 * Seek the remote renderer to `ms`. Backed by the daemon's `/api/seek`, which
 * maps to UPnP `Seek` (REL_TIME). Protocols without `Sink::seek` (HEOS /
 * AirPlay) answer with an error; the caller should keep the bar display-only
 * in that case.
 */
export const seek = (id, ms) =>
  post('/api/seek', { id, position_ms: Math.round(ms) });

/** Set the device volume (0..1) on the selected devices. */
export function setDeviceVolume(v) {
  const clamped = Math.min(1, Math.max(0, Number(v) || 0));
  castState.volume = clamped;
  castState.volumeSetAt = Date.now();
  if (clamped > 0) castState.lastVolume = clamped;
  const ids = castState.selected.length
    ? castState.selected
    : [activeId()].filter(Boolean);
  return Promise.all(
    ids.map(id =>
      post('/api/volume', { id, volume: Math.round(clamped * 100) }).catch(
        () => null
      )
    )
  );
}

/** Mute/unmute the device by driving its volume between 0 and the last level. */
export function toggleDeviceMute() {
  return setDeviceVolume(castState.volume > 0 ? 0 : castState.lastVolume || 1);
}

// ------------------------------------------------- remote transport helpers
// Every surface that can drive playback (player bar, lyrics page, desktop
// lyrics window, MPRIS, media keys) must route through these while a device
// is selected: the raw `player` methods only touch the muted local <audio>,
// so the speaker would keep playing a track that nothing can pause or seek.

/** True when the playback controls should target the selected devices. */
export const controlsDevice = () => castState.selected.length > 0;

/** Last reported position of the active device, in ms (0 when unknown). */
export const activePositionMs = () => {
  const id = activeId();
  const st = id ? castState.statuses[id] : null;
  return (st && st.position_ms) || 0;
};

/** Nudge the device volume by `delta` (e.g. ±0.1), clamped to 0..1. */
export function nudgeDeviceVolume(delta) {
  const step = Number(delta);
  if (!isFinite(step)) return Promise.resolve(null);
  return setDeviceVolume((castState.volume || 0) + step);
}

/**
 * Seek the ACTIVE device to `ms`. The mirrored timeline is moved immediately
 * so every surface sticks where the user dropped it instead of snapping back
 * to the previous position until the next 1s poll.
 */
export function seekActive(ms) {
  const id = activeId();
  if (!id) return Promise.resolve(null);
  const value = Math.max(0, Math.round(Number(ms) || 0));
  const st = castState.statuses[id];
  if (st) Vue.set(st, 'position_ms', value);
  return seek(id, value);
}

/**
 * Fold a transport request onto the selected devices.
 * `action`: 'play' | 'pause' | 'toggle' | 'stop'.
 * Mirrors the player bar's rule: a renderer that was never started (or was
 * stopped) gets `track` pushed again, a paused one is simply resumed.
 * Returns the resulting playing state, or null when nothing is cast.
 */
export async function deviceTransport(action, track = null) {
  if (!controlsDevice()) return null;
  const ids = castState.selected.slice();
  const playing = !!castState.active[activeId()];
  if (action === 'stop') {
    await Promise.all(ids.map(id => stop(id).catch(() => {})));
    return false;
  }
  if (action === 'pause' || (action === 'toggle' && playing)) {
    if (!playing) return false;
    await Promise.all(ids.map(id => pause(id).catch(() => {})));
    return false;
  }
  if (action !== 'play' && action !== 'toggle') return null;
  await Promise.all(
    ids.map(id => {
      const s = castState.statuses[id];
      if (!s || s.state === 'stopped' || s.state === 'idle') {
        if (!track || !track.id) return null;
        return play([id], toTrack(track)).catch(() => {});
      }
      return resume(id).catch(() => {});
    })
  );
  return true;
}

// ----------------------------------------------------------------- groups

/**
 * Put several devices into one synchronised group.
 * Returns true when the protocol groups them natively (HEOS); otherwise the
 * daemon runs software drift correction.
 */
export const group = async ids => {
  castState.nativeSync = await post('/api/group', { ids });
  return castState.nativeSync;
};
export const ungroup = () => post('/api/ungroup');

// ---------------------------------------------------------------- NetEase

export const qrLogin = () => call('/api/netease/qr');
export const qrPoll = key => call(`/api/netease/qr/poll?key=${key}`);
export const myPlaylists = () => call('/api/netease/playlists');
export const playlistTracks = (id, quality = castState.quality) =>
  call(`/api/netease/playlist?id=${id}&quality=${quality}`);
export const search = (kw, limit = 30) =>
  call(`/api/netease/search?kw=${encodeURIComponent(kw)}&limit=${limit}`);
export const setCookie = cookie => post('/api/netease/cookie', { cookie });

/**
 * Hand the daemon the login YesPlayMusic already has.
 *
 * YPM keeps each NetEase cookie under `localStorage['cookie-<name>']`
 * (see `src/utils/auth.js`). The daemon needs the raw `MUSIC_U` / `__csrf`
 * pair, and `os=pc` so the `/api/...` endpoints answer as the PC client.
 */
export function pushCookie() {
  const parts = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith('cookie-')) continue;
    const value = localStorage.getItem(key);
    if (!value) continue;
    parts.push(`${key.slice('cookie-'.length)}=${value}`);
  }
  if (!parts.some(p => p.startsWith('MUSIC_U='))) return Promise.resolve(false);
  parts.push('os=pc');
  return setCookie(parts.join('; ')).then(() => true);
}

// ------------------------------------------------------------------ model

/** Convert a YesPlayMusic track object into a cast-engine Track. */
export function toTrack(t, quality = castState.quality) {
  return {
    id: Number(t.id),
    title: t.name || '',
    artist: (t.ar || t.artists || []).map(a => a.name).join(', '),
    album: (t.al || t.album || {}).name || '',
    duration_ms: t.dt || t.duration || 0,
    cover: (t.al || t.album || {}).picUrl || null,
    quality,
  };
}

// ------------------------------------------------------------------ events

/**
 * Subscribe to the engine event bus.
 * Long-polls `GET /api/events` and invokes `onEvent(e)` for each one.
 * Returns a `stop()` function.
 */
export function subscribe(onEvent, onError = () => {}) {
  // cursor 的读写走函数：await 之后直接给外层变量赋值会触发
  // require-atomic-updates（这里确实是单消费者，属规则误报）
  let cursor = 0;
  const readCursor = () => cursor;
  const writeCursor = v => {
    cursor = v;
  };
  let alive = true;
  (async () => {
    while (alive) {
      try {
        const res = await fetch(`${BASE}/api/events?cursor=${readCursor()}`);
        const json = await res.json();
        if (json.ok) {
          writeCursor(json.data.cursor);
          (json.data.events || []).forEach(onEvent);
        }
      } catch (e) {
        onError(e);
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  })();
  return () => {
    alive = false;
  };
}

const LABELS = {
  upnp: 'DLNA',
  heos: 'HEOS',
  airplay: 'AirPlay',
  qplay: 'QPlay',
};
export const protoLabel = p => LABELS[p] || p;

// One heartbeat for every surface that shows the device timeline. Without it
// the lyrics page and the player bar each re-rendered on their own schedule and
// drifted apart visibly while casting.
setInterval(() => {
  castState.tick += 1;
}, 1000);
