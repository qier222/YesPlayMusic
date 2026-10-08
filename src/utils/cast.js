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
  selected: [], // device ids currently driven
  auto: false, // follow the player and push every new track
  nativeSync: false, // true => the protocol groups the devices itself (HEOS)
  quality: 'lossless', // standard | exhigh | lossless | hires
  // false => the renderer pulls from our gateway on this machine.
  // true  => the renderer pulls straight from the NetEase CDN. Flip this when
  //          the renderer cannot reach this PC (firewall / 360 LAN stealth /
  //          router AP isolation): everything succeeds but nothing plays.
  direct: false,
  error: '',
  active: {}, // id -> playing
});

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

/**
 * Push one track to one or more devices.
 * `track` is a cast-engine Track: { id, title, artist, album, duration_ms, cover, quality }
 */
export const play = (ids, track) => post('/api/play', { ids, track, direct: castState.direct });

/** Push a queue; the daemon advances automatically on end-of-track. */
export const playQueue = (ids, tracks) =>
  post('/api/queue', { ids, tracks, direct: castState.direct });

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
export const pause = id => post('/api/pause', { id });
export const resume = id => post('/api/resume', { id });
export const stop = id => post('/api/stop', { id });
export const volume = (id, v) => post('/api/volume', { id, volume: v });
export const mute = (id, m) => post('/api/mute', { id, muted: m });
export const status = id => call(`/api/status?id=${encodeURIComponent(id)}`);

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
  let cursor = 0;
  let alive = true;
  (async () => {
    while (alive) {
      try {
        const res = await fetch(`${BASE}/api/events?cursor=${cursor}`);
        const json = await res.json();
        if (json.ok) {
          cursor = json.data.cursor;
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

const LABELS = { upnp: 'DLNA', heos: 'HEOS', airplay: 'AirPlay', qplay: 'QPlay' };
export const protoLabel = p => LABELS[p] || p;
