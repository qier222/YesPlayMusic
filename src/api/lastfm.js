// Last.fm API documents 👉 https://www.last.fm/api

import axios from 'axios';
import md5 from 'crypto-js/md5';

const apiKey = process.env.VUE_APP_LASTFM_API_KEY;
const apiSharedSecret = process.env.VUE_APP_LASTFM_API_SHARED_SECRET;
const baseUrl = window.location.origin;
const url = 'https://ws.audioscrobbler.com/2.0/';

const sign = params => {
  const sortParamsKeys = Object.keys(params).sort();
  const sortedParams = sortParamsKeys.reduce((acc, key) => {
    acc[key] = params[key];
    return acc;
  }, {});
  let signature = '';
  for (const [key, value] of Object.entries(sortedParams)) {
    signature += `${key}${value}`;
  }
  return md5(signature + apiSharedSecret).toString();
};

export function auth() {
  const url = process.env.IS_ELECTRON
    ? `https://www.last.fm/api/auth/?api_key=${apiKey}&cb=${baseUrl}/#/lastfm/callback`
    : `https://www.last.fm/api/auth/?api_key=${apiKey}&cb=${baseUrl}/lastfm/callback`;
  window.open(url);
}

export function authGetSession(token) {
  const signature = md5(
    `api_key${apiKey}methodauth.getSessiontoken${token}${apiSharedSecret}`
  ).toString();
  return axios({
    url,
    method: 'GET',
    params: {
      method: 'auth.getSession',
      format: 'json',
      api_key: apiKey,
      api_sig: signature,
      token,
    },
  });
}

export function trackUpdateNowPlaying(params) {
  params.api_key = apiKey;
  params.method = 'track.updateNowPlaying';
  params.sk = JSON.parse(localStorage.getItem('lastfm'))['key'];
  const signature = sign(params);

  return axios({
    url,
    method: 'POST',
    params: {
      ...params,
      api_sig: signature,
      format: 'json',
    },
  });
}

export function trackScrobble(params) {
  params.api_key = apiKey;
  params.method = 'track.scrobble';
  params.sk = JSON.parse(localStorage.getItem('lastfm'))['key'];
  const signature = sign(params);

  return axios({
    url,
    method: 'POST',
    params: {
      ...params,
      api_sig: signature,
      format: 'json',
    },
  });
}
