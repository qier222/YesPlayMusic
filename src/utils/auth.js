import Cookies from 'js-cookie';
import { logout } from '@/api/auth';
import store from '@/store';

export function setCookies(string) {
  const cookies = string.split(';;');
  cookies.map(cookie => {
    document.cookie = cookie;
    const cookieKeyValue = cookie.split(';')[0].split('=');
    localStorage.setItem(`cookie-${cookieKeyValue[0]}`, cookieKeyValue[1]);
  });
}

export function getCookie(key) {
  return Cookies.get(key) ?? localStorage.getItem(`cookie-${key}`);
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

export function setBiliCookies(string) {
  localStorage.setItem('bili-Cookies', string);
  store.commit('updateData', {
    key: 'bili-Cookies',
    value: string,
  });
}

export function getBiliCookies() {
  if (!store.state.data['bili-Cookies']) {
    let cks = localStorage.getItem('bili-Cookies');
    if (!cks) {
      return null;
    }
    store.commit('updateData', {
      key: 'bili-Cookies',
      value: cks,
    });
    return cks;
  }
  return store.state.data['bili-Cookies'];
}

export function isBiliLogin() {
  let cks = getBiliCookies();
  if (cks) {
    for (let ck of cks) {
      if (ck.Name === 'DedeUserID') {
        return true;
      }
    }
  }
  return false;
}

// only useful while logged in
export function getBiliUid() {
  let cks = getBiliCookies();
  if (cks) {
    cks.forEach(ck => {
      if (ck.Name === 'DedeUserID') {
        return ck.Value;
      }
    });
  }
}

export function setBiliRemoteCookies() {
  if (isBiliLogin()) {
    let cks = getBiliCookies();
    fetch('http://127.0.0.1:10764/login/set_cookies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cookies: cks }),
    }).then(() => {
      console.log('已保存B站登录信息');
    });
  }
}
