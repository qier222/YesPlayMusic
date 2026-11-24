// JS run before the plugin: on top of the only native exit __host(op, json), it builds the globals
// plugins can use — console, timers, fetch/Headers/Response, URL/URLSearchParams,
// TextEncoder/TextDecoder, AbortController, and host (storage, settings, language etc.),
// plus the internal object __ypm the host uses to drive the plugin.
//
// For the Dart side, see _host() in runtime.dart.

const prelude = r'''
(() => {
"use strict";
const g = globalThis;
const raw = g.__host;
delete g.__host;

const sync = (op, args) => {
  const r = raw(op, JSON.stringify(args === undefined ? null : args));
  return r === undefined ? undefined : JSON.parse(r);
};

let seq = 0;
const waiting = new Map();
// Async host calls: when Dart finishes it calls __ypm.resolve(id, ok, value).
const later = (op, args) => {
  const id = ++seq;
  const promise = new Promise((resolve, reject) => {
    waiting.set(id, { resolve, reject });
    try { sync(op, { ...args, id }); } catch (e) { waiting.delete(id); reject(e); }
  });
  return { id, promise };
};

const fmt = (v) => {
  if (typeof v === "string") return v;
  if (v instanceof Error) return v.stack ? `${v.name}: ${v.message}\n${v.stack}` : String(v);
  try { const s = JSON.stringify(v); return s === undefined ? String(v) : s; } catch { return String(v); }
};
const log = (level) => (...a) => { sync("log", { level, message: a.map(fmt).join(" ") }); };
g.console = Object.freeze({
  log: log("log"), info: log("info"), warn: log("warn"), error: log("error"), debug: log("debug"),
});

// ── Timers ──
const timers = new Map();
const addTimer = (fn, ms, args, repeat) => {
  if (typeof fn !== "function") throw new TypeError("callback must be a function");
  const id = ++seq;
  ms = Math.max(0, Number(ms) || 0);
  timers.set(id, { fn, args, repeat });
  sync("timer", { id, ms, repeat });
  return id;
};
g.setTimeout = (fn, ms, ...a) => addTimer(fn, ms, a, false);
g.setInterval = (fn, ms, ...a) => addTimer(fn, ms, a, true);
g.clearTimeout = g.clearInterval = (id) => { if (timers.delete(id)) sync("clearTimer", { id }); };

// ── Bytes ──
const bytesToB64 = (u8) => {
  let s = "";
  for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  return btoa(s);
};
const b64ToBytes = (b64) => {
  const s = atob(b64);
  const u8 = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) u8[i] = s.charCodeAt(i);
  return u8;
};
const asBytes = (v) => {
  if (v instanceof Uint8Array) return v;
  if (v instanceof ArrayBuffer) return new Uint8Array(v);
  if (ArrayBuffer.isView(v)) return new Uint8Array(v.buffer, v.byteOffset, v.byteLength);
  throw new TypeError("expected bytes");
};

class TextEncoder {
  get encoding() { return "utf-8"; }
  encode(str = "") {
    str = String(str);
    const out = [];
    for (let i = 0; i < str.length; i++) {
      let c = str.charCodeAt(i);
      if (c >= 0xd800 && c < 0xdc00 && i + 1 < str.length) {
        const d = str.charCodeAt(i + 1);
        if (d >= 0xdc00 && d < 0xe000) { c = 0x10000 + ((c - 0xd800) << 10) + (d - 0xdc00); i++; }
        else c = 0xfffd;
      } else if (c >= 0xd800 && c < 0xe000) c = 0xfffd;
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
      else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
      else out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
    return new Uint8Array(out);
  }
}
class TextDecoder {
  constructor(label = "utf-8") {
    if (!/^utf-?8$/i.test(String(label))) throw new RangeError(`unsupported encoding: ${label}`);
  }
  get encoding() { return "utf-8"; }
  decode(buf) {
    if (buf === undefined) return "";
    const b = asBytes(buf);
    let s = "";
    for (let i = 0; i < b.length;) {
      const c = b[i];
      let cp = 0xfffd, n = 1;
      if (c < 0x80) cp = c;
      else if (c >= 0xc2 && c < 0xe0 && (b[i + 1] & 0xc0) === 0x80) { cp = ((c & 31) << 6) | (b[i + 1] & 63); n = 2; }
      else if (c >= 0xe0 && c < 0xf0 && (b[i + 1] & 0xc0) === 0x80 && (b[i + 2] & 0xc0) === 0x80) {
        cp = ((c & 15) << 12) | ((b[i + 1] & 63) << 6) | (b[i + 2] & 63); n = 3;
        if (cp < 0x800 || (cp >= 0xd800 && cp < 0xe000)) cp = 0xfffd;
      } else if (c >= 0xf0 && c < 0xf5 && (b[i + 1] & 0xc0) === 0x80 && (b[i + 2] & 0xc0) === 0x80 && (b[i + 3] & 0xc0) === 0x80) {
        cp = ((c & 7) << 18) | ((b[i + 1] & 63) << 12) | ((b[i + 2] & 63) << 6) | (b[i + 3] & 63); n = 4;
        if (cp < 0x10000 || cp > 0x10ffff) cp = 0xfffd;
      }
      s += String.fromCodePoint(cp);
      i += n;
    }
    return s;
  }
}
g.TextEncoder = TextEncoder;
g.TextDecoder = TextDecoder;

// ── URL ──
const formEncode = (s) => encodeURIComponent(s).replace(/[!'()~]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase()).replace(/%20/g, "+");
const formDecode = (s) => { s = s.replace(/\+/g, " "); try { return decodeURIComponent(s); } catch { return s; } };

class URLSearchParams {
  constructor(init = "") {
    this._list = [];
    if (init instanceof URLSearchParams) this._list = init._list.map((e) => [...e]);
    else if (Array.isArray(init)) for (const [k, v] of init) this.append(k, v);
    else if (init && typeof init === "object") for (const k of Object.keys(init)) this.append(k, init[k]);
    else this._parse(String(init));
  }
  _parse(s) {
    this._list = [];
    if (s.startsWith("?")) s = s.slice(1);
    for (const part of s.split("&")) {
      if (!part) continue;
      const i = part.indexOf("=");
      this._list.push(i < 0 ? [formDecode(part), ""] : [formDecode(part.slice(0, i)), formDecode(part.slice(i + 1))]);
    }
  }
  _changed() { if (this._url) this._url._search = this._list.length ? "?" + this.toString() : ""; }
  get size() { return this._list.length; }
  append(k, v) { this._list.push([String(k), String(v)]); this._changed(); }
  set(k, v) {
    k = String(k);
    const i = this._list.findIndex((e) => e[0] === k);
    if (i < 0) this._list.push([k, String(v)]);
    else { this._list[i][1] = String(v); this._list = this._list.filter((e, j) => j <= i || e[0] !== k); }
    this._changed();
  }
  get(k) { const e = this._list.find((e) => e[0] === String(k)); return e ? e[1] : null; }
  getAll(k) { return this._list.filter((e) => e[0] === String(k)).map((e) => e[1]); }
  has(k) { return this._list.some((e) => e[0] === String(k)); }
  delete(k) { this._list = this._list.filter((e) => e[0] !== String(k)); this._changed(); }
  sort() { this._list.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)); this._changed(); }
  forEach(cb, t) { for (const [k, v] of this._list) cb.call(t, v, k, this); }
  *entries() { for (const e of this._list) yield [e[0], e[1]]; }
  *keys() { for (const e of this._list) yield e[0]; }
  *values() { for (const e of this._list) yield e[1]; }
  [Symbol.iterator]() { return this.entries(); }
  toString() { return this._list.map(([k, v]) => formEncode(k) + "=" + formEncode(v)).join("&"); }
}
g.URLSearchParams = URLSearchParams;

const ABS = /^([a-zA-Z][a-zA-Z0-9+.-]*:)\/\/(?:([^:@/?#]*)(?::([^@/?#]*))?@)?(\[[^\]]*\]|[^:/?#]*)(?::(\d*))?([^?#]*)(\?[^#]*)?(#.*)?$/;
const OPAQUE = /^([a-zA-Z][a-zA-Z0-9+.-]*:)([^?#]*)(\?[^#]*)?(#.*)?$/;
const DEFAULT_PORT = { "http:": "80", "https:": "443", "ws:": "80", "wss:": "443" };
const dotSegments = (path) => {
  const out = [];
  for (const seg of path.split("/").slice(1)) {
    if (seg === "..") { if (out.length) out.pop(); }
    else if (seg !== ".") out.push(seg);
  }
  const last = path.split("/").pop();
  if (last === "." || last === "..") out.push("");
  return "/" + out.join("/");
};

class URL {
  constructor(input, base) {
    input = String(input).trim();
    let m = ABS.exec(input);
    if (!m && base !== undefined) {
      const b = base instanceof URL ? base : new URL(base);
      if (input.startsWith("//")) m = ABS.exec(b.protocol + input);
      else {
        let path = b.pathname, search = b.search, hash = "", rest = input;
        const h = rest.indexOf("#");
        if (h >= 0) { hash = rest.slice(h); rest = rest.slice(0, h); }
        if (rest !== "") {
          const q = rest.indexOf("?");
          const p = q >= 0 ? rest.slice(0, q) : rest;
          search = q >= 0 ? rest.slice(q) : "";
          if (p.startsWith("/")) path = p;
          else if (p !== "") path = path.slice(0, path.lastIndexOf("/") + 1) + p;
        }
        m = ABS.exec(b.origin + dotSegments(path) + search + hash);
        if (m) { m[2] = b.username; m[3] = b.password; }
      }
    }
    if (m) {
      this._protocol = m[1].toLowerCase();
      this._username = m[2] || ""; this._password = m[3] || "";
      this._hostname = (m[4] || "").toLowerCase();
      this._port = m[5] && m[5] !== DEFAULT_PORT[this._protocol] ? m[5] : "";
      this._pathname = dotSegments(m[6] || "/") ;
      this._search = m[7] && m[7] !== "?" ? m[7] : "";
      this._hash = m[8] && m[8] !== "#" ? m[8] : "";
      this._opaque = false;
    } else if ((m = OPAQUE.exec(input)) && base === undefined) {
      this._protocol = m[1].toLowerCase();
      this._username = this._password = this._hostname = this._port = "";
      this._pathname = m[2]; this._search = m[3] || ""; this._hash = m[4] || "";
      this._opaque = true;
    } else throw new TypeError(`Invalid URL: ${input}`);
    this._params = new URLSearchParams(this._search);
    this._params._url = this;
  }
  get protocol() { return this._protocol; }
  set protocol(v) { this._protocol = String(v).replace(/:?$/, ":").toLowerCase(); }
  get username() { return this._username; }
  set username(v) { this._username = String(v); }
  get password() { return this._password; }
  set password(v) { this._password = String(v); }
  get hostname() { return this._hostname; }
  set hostname(v) { this._hostname = String(v).toLowerCase(); }
  get port() { return this._port; }
  set port(v) { v = String(v); this._port = v === DEFAULT_PORT[this._protocol] ? "" : v; }
  get host() { return this._hostname + (this._port ? ":" + this._port : ""); }
  set host(v) { const [h, p = ""] = String(v).split(":"); this.hostname = h; this.port = p; }
  get origin() { return this._opaque ? "null" : this._protocol + "//" + this.host; }
  get pathname() { return this._pathname; }
  set pathname(v) { v = String(v); this._pathname = v.startsWith("/") ? v : "/" + v; }
  get search() { return this._search; }
  set search(v) { v = String(v); this._search = v === "" || v === "?" ? "" : v.startsWith("?") ? v : "?" + v; this._params._parse(this._search); }
  get searchParams() { return this._params; }
  get hash() { return this._hash; }
  set hash(v) { v = String(v); this._hash = v === "" || v === "#" ? "" : v.startsWith("#") ? v : "#" + v; }
  get href() {
    if (this._opaque) return this._protocol + this._pathname + this._search + this._hash;
    const auth = this._username || this._password ? this._username + (this._password ? ":" + this._password : "") + "@" : "";
    return this._protocol + "//" + auth + this.host + this._pathname + this._search + this._hash;
  }
  set href(v) { const u = new URL(v); Object.assign(this, u); this._params._url = this; }
  toString() { return this.href; }
  toJSON() { return this.href; }
  static canParse(u, b) { try { new URL(u, b); return true; } catch { return false; } }
}
g.URL = URL;

// ── AbortController ──
const abortError = (reason) => {
  if (reason !== undefined) return reason;
  const e = new Error("This operation was aborted");
  e.name = "AbortError";
  return e;
};
class AbortSignal {
  constructor() { this.aborted = false; this.reason = undefined; this.onabort = null; this._fns = []; }
  addEventListener(type, fn) { if (type === "abort" && typeof fn === "function") this._fns.push(fn); }
  removeEventListener(type, fn) { this._fns = this._fns.filter((f) => f !== fn); }
  throwIfAborted() { if (this.aborted) throw this.reason; }
  _abort(reason) {
    if (this.aborted) return;
    this.aborted = true;
    this.reason = abortError(reason);
    const ev = { type: "abort", target: this };
    for (const fn of [...this._fns, this.onabort]) if (typeof fn === "function") try { fn.call(this, ev); } catch (e) { console.error(e); }
  }
  static abort(reason) { const s = new AbortSignal(); s._abort(reason); return s; }
  static timeout(ms) { const s = new AbortSignal(); setTimeout(() => { const e = new Error("The operation timed out"); e.name = "TimeoutError"; s._abort(e); }, ms); return s; }
}
class AbortController {
  constructor() { this.signal = new AbortSignal(); }
  abort(reason) { this.signal._abort(reason); }
}
g.AbortSignal = AbortSignal;
g.AbortController = AbortController;

// ── fetch ──
class Headers {
  constructor(init) {
    this._m = new Map();
    this._cookies = [];
    if (init instanceof Headers) init.forEach((v, k) => this.append(k, v));
    else if (Array.isArray(init)) for (const [k, v] of init) this.append(k, v);
    else if (init && typeof init === "object") for (const k of Object.keys(init)) this.append(k, init[k]);
  }
  append(k, v) {
    k = String(k).toLowerCase(); v = String(v);
    if (k === "set-cookie") this._cookies.push(v);
    const o = this._m.get(k);
    this._m.set(k, o === undefined ? v : o + ", " + v);
  }
  set(k, v) { k = String(k).toLowerCase(); if (k === "set-cookie") this._cookies = [String(v)]; this._m.set(k, String(v)); }
  get(k) { const v = this._m.get(String(k).toLowerCase()); return v === undefined ? null : v; }
  getSetCookie() { return [...this._cookies]; }
  has(k) { return this._m.has(String(k).toLowerCase()); }
  delete(k) { k = String(k).toLowerCase(); if (k === "set-cookie") this._cookies = []; this._m.delete(k); }
  forEach(cb, t) { for (const [k, v] of this._m) cb.call(t, v, k, this); }
  entries() { return this._m.entries(); }
  keys() { return this._m.keys(); }
  values() { return this._m.values(); }
  [Symbol.iterator]() { return this._m.entries(); }
}
g.Headers = Headers;

class Response {
  constructor(meta) {
    this.status = meta.status;
    this.statusText = meta.statusText || "";
    this.ok = meta.status >= 200 && meta.status < 300;
    this.url = meta.url || "";
    this.redirected = !!meta.redirected;
    this.headers = new Headers();
    for (const [k, v] of meta.headers || []) this.headers.append(k, v);
    this._rid = meta.rid;
    this.bodyUsed = false;
  }
  _take(as) {
    if (this.bodyUsed) return Promise.reject(new TypeError("Body has already been consumed"));
    this.bodyUsed = true;
    try { return Promise.resolve(sync("body", { rid: this._rid, as })); } catch (e) { return Promise.reject(e); }
  }
  text() { return this._take("text"); }
  json() { return this._take("text").then(JSON.parse); }
  bytes() { return this._take("base64").then(b64ToBytes); }
  arrayBuffer() { return this.bytes().then((u) => u.buffer); }
  clone() { throw new TypeError("Response.clone is not supported"); }
}
g.Response = Response;

g.fetch = (input, init = {}) => {
  try {
    const url = input instanceof URL ? input.href : typeof input === "string" ? input : String(input && input.url || input);
    const method = String(init.method || "GET").toUpperCase();
    const headers = new Headers(init.headers);
    let body = init.body, bodyBase64;
    if (body === undefined || body === null) body = undefined;
    else if (body instanceof URLSearchParams) {
      if (!headers.has("content-type")) headers.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8");
      body = body.toString();
    } else if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) { bodyBase64 = bytesToB64(asBytes(body)); body = undefined; }
    else if (typeof body !== "string") body = String(body);
    const signal = init.signal;
    if (signal && signal.aborted) return Promise.reject(signal.reason);
    const { id, promise } = later("fetch", {
      url, method, headers: [...headers], body, bodyBase64,
      redirect: init.redirect === "manual" || init.redirect === "error" ? init.redirect : "follow",
    });
    if (signal) signal.addEventListener("abort", () => {
      const w = waiting.get(id);
      if (!w) return;
      waiting.delete(id);
      try { sync("abort", { id }); } catch {}
      w.reject(signal.reason);
    });
    return promise.then((meta) => new Response(meta));
  } catch (e) {
    return Promise.reject(e);
  }
};

// ── host ──
const info = sync("info");
const unsupported = (name) => () => {
  const e = new Error(`host.${name} is not supported by this app yet`);
  e.code = "unsupported";
  throw e;
};
g.host = Object.freeze({
  platform: info.platform,
  arch: info.arch,
  dir: info.dir,
  dataDir: info.dataDir,
  pid: info.pid,
  storage: Object.freeze({
    get: (key) => sync("storage.get", { key: String(key) }),
    set: (key, value) => { sync("storage.set", { key: String(key), value: value === undefined ? null : value }); },
    remove: (key) => { sync("storage.remove", { key: String(key) }); },
  }),
  language: () => sync("language"),
  t: (text) => sync("t", { text: String(text) }),
  setting: (key) => sync("setting", { key: String(key) }),
  openURL: (url) => { sync("openURL", { url: String(url) }); },
  crypto: Object.freeze({
    md5: (text) => sync("md5", { text: String(text) }),
    aesEcbEncrypt: (key, text) => sync("aesEcbEncrypt", { key: String(key), text: String(text) }),
  }),
  signInPrompt: (o = {}) => {
    o = o || {};
    sync("signInPrompt", { qr: o.qr ? String(o.qr) : "", text: o.text ? String(o.text) : "" });
  },
  waitForRedirect: unsupported("waitForRedirect"),
  webSignIn: (o = {}) => {
    try {
      return later("webSignIn", {
        url: String(o.url || ""),
        cookiesOf: String(o.cookiesOf || ""),
        until: Array.isArray(o.until) ? o.until.map(String) : [],
        userAgent: o.userAgent === undefined ? undefined : String(o.userAgent),
      }).promise;
    } catch (e) {
      return Promise.reject(e);
    }
  },
  spawn: (command, args = []) => {
    const { proc } = sync("spawn", {
      command: String(command),
      args: Array.isArray(args) ? args.map(String) : [],
    });
    return Object.freeze({
      get pid() { return sync("proc.pid", { proc }); },
      write: (text) => { sync("proc.write", { proc, text: String(text) }); },
      closeStdin: () => { sync("proc.closeStdin", { proc }); },
      readLine: () => later("proc.readLine", { proc }).promise,
      wait: () => later("proc.wait", { proc }).promise,
      kill: () => { sync("proc.kill", { proc }); },
      errorOutput: () => sync("proc.stderr", { proc }),
    });
  },
  ipc: Object.freeze({
    connect: (name) => later("ipc.connect", { name: String(name) }).promise.then((conn) => {
      let closed = false;
      return Object.freeze({
        write: (bytes) => {
          try { return later("ipc.write", { conn, data: bytesToB64(asBytes(bytes)) }).promise.then(() => {}); }
          catch (e) { return Promise.reject(e); }
        },
        read: () => later("ipc.read", { conn }).promise.then((b64) => (b64 == null ? null : b64ToBytes(b64))),
        close: () => { if (!closed) { closed = true; sync("ipc.close", { conn }); } },
      });
    }),
  }),
  removeDataDir: unsupported("removeDataDir"),
});

// ── Host drives the plugin ──
let mod = null;
const describe = (e) => ({
  code: e && typeof e === "object" && typeof e.code === "string" ? e.code : "",
  message: e && typeof e === "object" && "message" in e ? String(e.message) : fmt(e),
  stack: e && typeof e === "object" && e.stack ? String(e.stack) : "",
});
const settle = (id, ok, value) => {
  try { sync("settle", ok ? { id, ok, value: value === undefined ? null : value } : { id, ok, error: describe(value) }); }
  catch (e) { sync("settle", { id, ok: false, error: describe(e) }); }
};
Object.defineProperty(g, "__ypm", { value: Object.freeze({
  load: (main) => import(main).then(
    (ns) => { mod = ns; settle(0, true, Object.keys(ns).filter((k) => typeof ns[k] === "function")); },
    // Load failures are for developers: include the error type and location.
    (e) => settle(0, false, {
      message: (e && e.name ? e.name + ": " : "") + (e && e.message !== undefined ? e.message : fmt(e)) +
        (e && e.stack ? " (" + String(e.stack).trim().split("\n")[0].trim().replace(/^at /, "") + ")" : ""),
    }),
  ),
  call: (id, name, params) => {
    Promise.resolve().then(() => {
      const f = mod && mod[name];
      if (typeof f !== "function") { const e = new Error(`${name} is not exported`); e.code = "unsupported"; throw e; }
      return f(params === null || params === undefined ? {} : params);
    }).then((v) => settle(id, true, v), (e) => settle(id, false, e));
  },
  resolve: (id, ok, value) => {
    const w = waiting.get(id);
    if (!w) return;
    waiting.delete(id);
    if (ok) w.resolve(value);
    else {
      const e = new Error(value && value.message || "failed");
      if (value && value.name) e.name = value.name;
      if (value && value.code) e.code = value.code;
      w.reject(e);
    }
  },
  fire: (id) => {
    const t = timers.get(id);
    if (!t) return;
    if (!t.repeat) timers.delete(id);
    try { t.fn(...t.args); } catch (e) { console.error(e); }
  },
}) });
})();
''';
