import Cookies from 'js-cookie';
import { logout } from '@/api/auth';
import store from '@/store';

export function doLogout() {
  logout();
  // 网易云的接口会自动移除该 cookies
  // Cookies.remove("MUSIC_U");
  // 更新状态仓库中的用户信息
  store.commit('updateData', { key: 'user', value: {} });
  // 更新状态仓库中的登录状态
  store.commit('updateData', { key: 'loginMode', value: null });
  // 更新状态仓库中的喜欢列表
  store.commit('updateData', { key: 'likedSongPlaylistID', value: undefined });
}

// MUSIC_U 只有在账户登录的情况下才有
export function isLoggedIn() {
  return Cookies.get('MUSIC_U') !== undefined ? true : false;
}

// 账号登录
export function isAccountLoggedIn() {
  return (
    Cookies.get('MUSIC_U') !== undefined &&
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

export function getMusicU(string) {
  const temp = string.split(';');
  if (!temp.length) {
    return undefined;
  }
  const MUSIC_U = temp.find(item => item.includes('MUSIC_U'));
  if (MUSIC_U) {
    return MUSIC_U.split('=')[1];
  }
  return '';
}

export function setMusicU(key, value) {
  return Cookies.set(key, value);
}

export function setCookies(string) {
  const cookies = string.split(';;');
  cookies.map(cookie => {
    document.cookie = cookie;
    console.log(cookie);
  });
}
