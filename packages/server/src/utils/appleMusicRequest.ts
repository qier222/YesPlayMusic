import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

export const baseURL = 'https://amp-api.music.apple.com/v1/catalog/us'

export const headers = {
  Authority: 'amp-api.music.apple.com',
  Accept: '*/*',
  Authorization: process.env.APPLE_MUSIC_TOKEN || '',
  Referer: 'https://music.apple.com/',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'cross-site',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Cider/1.5.1 Chrome/100.0.4896.160 Electron/18.3.3 Safari/537.36',
  'Accept-Encoding': 'gzip',
  Origin: 'https://music.apple.com',
}

export const params = {
  platform: 'web',
  with: 'serverBubbles',
}

const service: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
})

service.interceptors.request.use((config: AxiosRequestConfig) => {
  config.headers = { ...headers, ...config.headers }
  config.params = { ...params, ...config.params }
  return config
})

service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response
    return res
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

const appleMusicRequest = async (config: AxiosRequestConfig) => {
  const { data } = await service.request(config)
  return data as any
}

export default appleMusicRequest
