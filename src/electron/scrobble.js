/**
 * 听歌打卡 (scrobble)
 *
 * 网易云已经不再统计旧的 weapi `/feedback/weblog` 上报：接口依旧返回
 * `{ code: 200, data: 'success' }`，但听歌数、听歌排行和最近播放都不会更新。
 * 桌面端现在改为通过 clientlog 域名的 eapi 接口上报，先发 `startplay`
 * (进入「最近播放」)，再发 `play` (累计「听歌排行」)，这里按同样的方式上报。
 *
 * 参考 @neteasecloudmusicapienhanced/api 的 module/scrobble.js。
 * @neteaseapireborn/api 自带的 request 不支持自定义 eapi 域名，
 * 所以这里直接使用它的 eapi 加密并自行发送请求。
 */
const axios = require('axios');
const crypto = require('@neteaseapireborn/api/util/crypto');
const { generateDeviceId } = require('@neteaseapireborn/api/util');

const CLIENTLOG_DOMAIN = 'https://clientlog.music.163.com';
const WEBLOG_URI = '/api/feedback/weblog';
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
// 与桌面端 (macOS) 一致的设备信息
const DEVICE = {
  os: 'osx',
  appver: '3.1.10.5100',
  osver: '15.5',
  channel: 'netease',
};

let deviceId = '';

function getDeviceId() {
  if (global.deviceId) return global.deviceId;
  if (!deviceId) deviceId = generateDeviceId();
  return deviceId;
}

function parseCookie(cookie) {
  if (cookie && typeof cookie === 'object') return cookie;
  const result = {};
  if (typeof cookie !== 'string') return result;
  cookie.split(/;\s*/).forEach(pair => {
    const index = pair.indexOf('=');
    if (index < 1) return;
    result[pair.slice(0, index).trim()] = pair.slice(index + 1).trim();
  });
  return result;
}

function createHeader(cookie) {
  const now = Date.now();
  return {
    osver: DEVICE.osver,
    deviceId: getDeviceId(),
    os: DEVICE.os,
    appver: DEVICE.appver,
    versioncode: '140',
    mobilename: '',
    buildver: String(now).slice(0, 10),
    resolution: '1920x1080',
    __csrf: cookie.__csrf || '',
    channel: DEVICE.channel,
    requestId: `${now}_${String(Math.floor(Math.random() * 1000)).padStart(
      4,
      '0'
    )}`,
    MUSIC_U: cookie.MUSIC_U,
  };
}

async function sendLog(action, json, cookie, realIP) {
  const header = createHeader(cookie);
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Cookie: Object.keys(header)
      .map(
        key => `${encodeURIComponent(key)}=${encodeURIComponent(header[key])}`
      )
      .join('; '),
    'User-Agent': USER_AGENT,
  };
  if (realIP) {
    headers['X-Real-IP'] = realIP;
    headers['X-Forwarded-For'] = realIP;
  }

  const data = { logs: JSON.stringify([{ action, json }]), e_r: false, header };
  const response = await axios({
    method: 'POST',
    url: `${CLIENTLOG_DOMAIN}/eapi/${WEBLOG_URI.slice(5)}`,
    headers,
    data: new URLSearchParams(crypto.eapi(WEBLOG_URI, data)).toString(),
    proxy: false,
    timeout: 10000,
  });
  return response.data;
}

module.exports = async query => {
  const id = String(query.id || '');
  if (!/^\d+$/.test(id)) {
    return { status: 400, body: { code: 400, msg: 'invalid song id' } };
  }

  const cookie = parseCookie(query.cookie);
  if (!cookie.MUSIC_U) {
    // 没有登录，没有可以同步的账号
    return { status: 200, body: { code: 200, data: 'skipped' }, cookie: [] };
  }

  const time = Math.max(0, Math.round(Number(query.time) || 0));
  // 不是歌单/专辑 id 的来源 (例如搜索结果) 统一按 0 处理
  const sourceId = /^\d+$/.test(String(query.sourceid)) ? query.sourceid : '0';
  const base = {
    id,
    type: 'song',
    mainsite: '1',
    mainsiteWeb: '1',
    content: `id=${sourceId}`,
  };

  const details = {};
  try {
    details.startplay = await sendLog('startplay', base, cookie, query.realIP);
    details.play = await sendLog(
      'play',
      {
        ...base,
        download: 0,
        end: 'playend',
        sourceId,
        time,
        wifi: 0,
        source: 'list',
      },
      cookie,
      query.realIP
    );
  } catch (error) {
    details.error = error.message || String(error);
  }

  // 主进程由 webpack 4 打包，不支持 optional chaining。
  const succeeded =
    !!details.startplay &&
    details.startplay.code === 200 &&
    !!details.play &&
    details.play.code === 200;
  if (!succeeded) console.error('[scrobble] failed', id, details);

  // 上报失败不应该影响播放。这里不能把网易云返回的 301 直接透传给前端，
  // 否则前端会把它当成登录过期而自动登出。
  return {
    status: 200,
    body: {
      code: succeeded ? 200 : 500,
      data: succeeded ? 'success' : null,
      details,
    },
    cookie: [],
  };
};
