import { IpcChannels } from '@/shared/IpcChannels'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { APIs } from '@/shared/CacheAPIs'
import { average } from 'color.js'
import { colord } from 'colord'
import { supportedLanguages } from '../i18n/i18n'

/**
 * @description 调整网易云和苹果音乐封面图片大小
 * @param  {string} url 封面图片URL
 * @param  {'xs'|'sm'|'md'|'lg'} size - 大小，值对应为 128px | 256px | 512px | 1024px
 */
export function resizeImage(
  url: string,
  size: 'xs' | 'sm' | 'md' | 'lg'
): string {
  if (!url) return ''

  const sizeMap = {
    xs: '128',
    sm: '256',
    md: '512',
    lg: '1024',
  }

  if (url.includes('mzstatic.com')) {
    // from Apple Music
    return url.replace('{w}', sizeMap[size]).replace('{h}', sizeMap[size])
  }

  return `${url}?param=${sizeMap[size]}y${sizeMap[size]}`.replace(
    /http(s?):\/\/p\d.music.126.net/,
    'https://p1.music.126.net'
  )
}

export function toHttps(url: string | undefined): string {
  return url ? url.replace(/^http:/, 'https:') : ''
}

export const storage = {
  get(key: string): object | [] | null {
    const text = localStorage.getItem(key)
    return text ? JSON.parse(text) : null
  },
  set(key: string, value: object | []): void {
    localStorage.setItem(key, JSON.stringify(value))
  },
}

/**
 * @description 格式化日期
 * @param  {number} timestamp - 时间戳
 * @param  {'en'|'zh-TW'|'zh-CN'='en'} locale - 日期语言
 * @param  {string='default'} format - 格式化字符串，参考 dayjs
 */
export function formatDate(
  timestamp: number,
  locale: 'en' | 'zh-TW' | 'zh-CN' = 'zh-CN',
  format: string = 'default'
): string {
  if (!timestamp) return ''
  if (format === 'default') {
    format = 'MMM D, YYYY'
    if (['zh-CN', 'zh-TW'].includes(locale)) format = 'YYYY年MM月DD日'
  }
  return dayjs(timestamp).format(format)
}

/**
 * @description 格式化时长
 * @param  {number} milliseconds - 毫秒数
 * @param  {'en'|'zh-TW'|'zh-CN'='en'} locale - 语言
 * @param  {'hh:mm:ss'|'hh[hr]mm[min]'='hh:mm:ss'} format - 格式化字符串
 */
export function formatDuration(
  milliseconds: number,
  locale: typeof supportedLanguages[number] = 'zh-CN',
  format: 'hh:mm:ss' | 'hh[hr] mm[min]' = 'hh:mm:ss'
): string {
  dayjs.extend(duration)

  const time = dayjs.duration(milliseconds)
  const hours = time.hours().toString()
  const mins = time.minutes().toString()
  const seconds = time.seconds().toString().padStart(2, '0')

  if (format === 'hh:mm:ss') {
    return hours !== '0'
      ? `${hours}:${mins.padStart(2, '0')}:${seconds}`
      : `${mins}:${seconds}`
  } else {
    const units = {
      'en-US': {
        hours: 'hr',
        mins: 'min',
      },
      'zh-CN': {
        hours: '小时',
        mins: '分钟',
      },
      'zh-TW': {
        hours: '小時',
        mins: '分鐘',
      },
    } as const

    return hours !== '0'
      ? `${hours} ${units[locale].hours}${
          mins === '0' ? '' : ` ${mins} ${units[locale].mins}`
        }`
      : `${mins} ${units[locale].mins}`
  }
}

export function scrollToTop(smooth = false) {
  document
    .querySelector('#main')
    ?.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' })
}

export function scrollToBottom(smooth = false) {
  document
    .querySelector('#main')
    ?.scrollTo({ top: 100000, behavior: smooth ? 'smooth' : 'auto' })
}

export async function getCoverColor(coverUrl: string) {
  let id: string | undefined
  try {
    id = new URL(coverUrl).pathname.split('/').pop()?.split('.')[0]
  } catch (e) {
    return
  }

  const colorFromCache: string | undefined = await window.ipcRenderer?.invoke(
    IpcChannels.GetApiCache,
    {
      api: APIs.CoverColor,
      query: {
        id,
      },
    }
  )
  return colorFromCache || calcCoverColor(coverUrl)
}

export async function cacheCoverColor(coverUrl: string, color: string) {
  let id: string | undefined
  try {
    id = new URL(coverUrl).pathname.split('/').pop()?.split('.')[0]
  } catch (e) {
    return
  }

  if (!id || isNaN(Number(id))) return

  window.ipcRenderer?.send(IpcChannels.CacheCoverColor, {
    id: Number(id),
    color,
  })
}

export async function calcCoverColor(coverUrl: string) {
  if (!coverUrl) return
  const cover = resizeImage(coverUrl, 'xs')
  return average(cover, { amount: 1, format: 'hex', sample: 1 }).then(color => {
    let c = colord(color as string)
    const hsl = c.toHsl()
    if (hsl.s > 50) c = colord({ ...hsl, s: 50 })
    if (hsl.l > 50) c = colord({ ...c.toHsl(), l: 50 })
    if (hsl.l < 30) c = colord({ ...c.toHsl(), l: 30 })
    cacheCoverColor(coverUrl, c.toHex())
    return c.toHex()
  })
}

export const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
export const isSafari = /^((?!chrome|android).)*safari/i.test(
  navigator.userAgent
)
export const isPWA =
  (navigator as any).standalone ||
  window.matchMedia('(display-mode: standalone)').matches
export const isIosPwa = isIOS && isPWA && isSafari

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
