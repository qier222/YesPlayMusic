import router from '@/router';
import { doLogout, getCookie } from '@/utils/auth';
import axios from 'axios';

let baseURL = '';
// Web 和 Electron 跑在不同端口避免同时启动时冲突
if (process.env.IS_ELECTRON) {
  if (process.env.NODE_ENV === 'production') {
    baseURL = process.env.VUE_APP_ELECTRON_API_URL;
  } else {
    baseURL = process.env.VUE_APP_ELECTRON_API_URL_DEV;
  }
} else {
  baseURL = process.env.VUE_APP_NETEASE_API_URL;
}

const service = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
});

service.interceptors.request.use(function (config) {
  // Log API request (only in development or Electron)
  if (process.env.NODE_ENV === 'development' || process.env.IS_ELECTRON) {
    console.log(
      `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
      config.params
    );
  }

  if (!config.params) config.params = {};
  if (baseURL.length) {
    // 在 Electron 和 Web 环境下都添加 Cookie
    const musicU = getCookie('MUSIC_U') || localStorage.getItem('MUSIC_U');
    if (musicU) {
      // Electron 环境：通过 cookie 参数传递
      if (process.env.IS_ELECTRON) {
        config.params.cookie = `MUSIC_U=${musicU};`;
        if (process.env.NODE_ENV === 'development') {
          console.log(
            '[API] 添加 Cookie (Electron):',
            config.params.cookie.substring(0, 50) + '...'
          );
        }
      }
      // Web 环境：通过 cookie 参数传递（当不是根路径时）
      else if (baseURL[0] !== '/') {
        config.params.cookie = `MUSIC_U=${musicU};`;
        if (process.env.NODE_ENV === 'development') {
          console.log(
            '[API] 添加 Cookie (Web):',
            config.params.cookie.substring(0, 50) + '...'
          );
        }
      }
    } else {
      if (process.env.NODE_ENV === 'development' || process.env.IS_ELECTRON) {
        console.log('[API] ⚠️ 未找到 MUSIC_U Cookie，使用匿名模式');
      }
    }
  } else {
    console.error("You must set up the baseURL in the service's config");
  }

  if (!process.env.IS_ELECTRON && !config.url.includes('/login')) {
    config.params.realIP = '211.161.244.70';
  }

  // Force real_ip
  const enableRealIP = JSON.parse(
    localStorage.getItem('settings')
  ).enableRealIP;
  const realIP = JSON.parse(localStorage.getItem('settings')).realIP;
  if (process.env.VUE_APP_REAL_IP) {
    config.params.realIP = process.env.VUE_APP_REAL_IP;
  } else if (enableRealIP) {
    config.params.realIP = realIP;
  }

  const proxy = JSON.parse(localStorage.getItem('settings')).proxyConfig;
  if (['HTTP', 'HTTPS'].includes(proxy.protocol)) {
    config.params.proxy = `${proxy.protocol}://${proxy.server}:${proxy.port}`;
  }

  return config;
});

service.interceptors.response.use(
  response => {
    // Log API response (only in development or Electron)
    if (process.env.NODE_ENV === 'development' || process.env.IS_ELECTRON) {
      console.log(`[API Response] ${response.config.url}`, {
        status: response.status,
        code: response.data?.code,
        dataKeys: response.data ? Object.keys(response.data) : [],
      });
    }

    const res = response.data;
    return res;
  },
  async error => {
    // Log API error (only in development or Electron)
    if (process.env.NODE_ENV === 'development' || process.env.IS_ELECTRON) {
      console.error(`[API Error]`, {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }

    /** @type {import('axios').AxiosResponse | null} */
    let response;
    let data;
    if (error === 'TypeError: baseURL is undefined') {
      response = error;
      data = error;
      console.error("You must set up the baseURL in the service's config");
    } else if (error.response) {
      response = error.response;
      data = response.data;
    }

    if (
      response &&
      typeof data === 'object' &&
      data.code === 301 &&
      data.msg === '需要登录'
    ) {
      console.warn('Token has expired. Logout now!');

      // 登出帳戶
      doLogout();

      // 導向登入頁面
      if (process.env.IS_ELECTRON === true) {
        router.push({ name: 'loginAccount' });
      } else {
        router.push({ name: 'login' });
      }
    }
  }
);

export default service;
