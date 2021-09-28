import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosInstance,
  AxiosError,
} from 'axios'
// import { useStore } from '../store'

const baseURL = String(
  import.meta.env.DEV
    ? '/netease-api'
    : import.meta.env.VITE_APP_NETEASE_API_URL
)
// const store = useStore()

const service: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
})

service.interceptors.request.use((config: AxiosRequestConfig) => {
  // if (!config.params) config.params = {}
  // if (baseURL[0] !== '/' && !process.env.IS_ELECTRON) {
  //   config.params.cookie = `MUSIC_U=${store.auth.cookies.MUSIC_U};`
  // }

  // if (!process.env.IS_ELECTRON && !config.url.includes('/login')) {
  //   config.params.realIP = '211.161.244.70'
  // }

  // const proxy = JSON.parse(localStorage.getItem('settings')).proxyConfig
  // if (['HTTP', 'HTTPS'].includes(proxy.protocol)) {
  //   config.params.proxy = `${proxy.protocol}://${proxy.server}:${proxy.port}`
  // }

  return config
})

service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response //.data
    return res
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

const request = async (config: AxiosRequestConfig) => {
  const { data } = await service.request(config)
  return data as any
}

export default request
