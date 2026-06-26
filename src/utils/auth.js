import Cookies from 'js-cookie';
import { logout } from '@/api/auth';
import store from '@/store';

const cookieAttributes = new Set([
  'domain',
  'expires',
  'httponly',
  'max-age',
  'path',
  'samesite',
  'secure',
]);

export function normalizeCookieString(string) {
  const cookies = string.includes(';;')
    ? string.split(';;')
    : string.split(';');

  return cookies
    .map(cookie => {
      const [rawKey, ...rawValue] = cookie.trim().split('=');
      const key = rawKey?.trim();
      const value = rawValue.join('=').trim();

      if (!key || !value || cookieAttributes.has(key.toLowerCase())) {
        return null;
      }

      return `${key}=${value}`;
    })
    .filter(Boolean)
    .join('; ');
}

export function setCookies(string) {
  const cookies = normalizeCookieString(string).split(';');

  cookies.forEach(cookie => {
    const [rawKey, ...rawValue] = cookie.trim().split('=');
    const key = rawKey?.trim();
    const value = rawValue.join('=').trim();

    if (!key || !value || cookieAttributes.has(key.toLowerCase())) return;

    document.cookie = `${key}=${value}; path=/`;
    localStorage.setItem(`cookie-${key}`, value);
  });
}

export function getCookie(key) {
  return Cookies.get(key) ?? localStorage.getItem(`cookie-${key}`);
}

export function getCookieString() {
  return Object.keys(localStorage)
    .filter(key => key.startsWith('cookie-'))
    .map(key => `${key.replace('cookie-', '')}=${localStorage.getItem(key)}`)
    .join('; ');
}

export function removeCookie(key) {
  Cookies.remove(key);
  localStorage.removeItem(`cookie-${key}`);
}

// MUSIC_U 只有在账户登录的情况下才有
export function isLoggedIn() {
  return getCookie('MUSIC_U') !== undefined;
}

// 账号登录
export function isAccountLoggedIn() {
  return (
    getCookie('MUSIC_U') !== undefined &&
    store.state.data.loginMode === 'account'
  );
}

// 用户名搜索（用户数据为只读）
export function isUsernameLoggedIn() {
  return store.state.data.loginMode === 'username';
}

// 账户登录或者用户名搜索都判断为登录，宽松检查
export function isLooseLoggedIn() {
  return isAccountLoggedIn() || isUsernameLoggedIn();
}

export function doLogout() {
  logout();
  removeCookie('MUSIC_U');
  removeCookie('__csrf');
  // 更新状态仓库中的用户信息
  store.commit('updateData', { key: 'user', value: {} });
  // 更新状态仓库中的登录状态
  store.commit('updateData', { key: 'loginMode', value: null });
  // 更新状态仓库中的喜欢列表
  store.commit('updateData', { key: 'likedSongPlaylistID', value: undefined });
}
