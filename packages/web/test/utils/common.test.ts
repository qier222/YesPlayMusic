import { expect, test, describe, vi } from 'vitest'
import {
  resizeImage,
  formatDate,
  formatDuration,
  cacheCoverColor,
  calcCoverColor,
  getCoverColor,
  storage,
} from '@/web/utils/common'
import { IpcChannels } from '@/shared/IpcChannels'
import { CacheAPIs } from '@/shared/CacheAPIs'

test('resizeImage', () => {
  expect(resizeImage('https://test.com/test.jpg', 'xs')).toBe(
    'https://test.com/test.jpg?param=128y128'
  )
  expect(resizeImage('https://test.com/test.jpg', 'sm')).toBe(
    'https://test.com/test.jpg?param=256y256'
  )
  expect(resizeImage('https://test.com/test.jpg', 'md')).toBe(
    'https://test.com/test.jpg?param=512y512'
  )
  expect(resizeImage('https://test.com/test.jpg', 'lg')).toBe(
    'https://test.com/test.jpg?param=1024y1024'
  )
  // test http => https
  expect(resizeImage('http://test.com/test.jpg', 'xs')).toBe(
    'https://test.com/test.jpg?param=128y128'
  )
  expect(resizeImage('', 'xs')).toBe('')
})

test('formatDate', () => {
  const time = 1650590574000
  expect(formatDate(time)).toBe('2022年04月22日')
  expect(formatDate(time, 'en')).toBe('Apr 22, 2022')
  expect(formatDate(time, 'en', 'YYYY-MMM-DD')).toBe('2022-Apr-22')
  expect(formatDate(time, 'zh-CN')).toBe('2022年04月22日')
  expect(formatDate(time, 'zh-TW')).toBe('2022年04月22日')
})

test('formatDuration', () => {
  expect(formatDuration(1000)).toBe('0:01')
  expect(formatDuration(60000)).toBe('1:00')
  expect(formatDuration(3600000)).toBe('1:00:00')
  expect(formatDuration(3700000)).toBe('1:01:40')

  expect(formatDuration(3600000, 'en-US', 'hh[hr] mm[min]')).toBe('1 hr')
  expect(formatDuration(3600000, 'zh-CN', 'hh[hr] mm[min]')).toBe('1 小时')
  // expect(formatDuration(3600000, 'zh-TW', 'hh[hr] mm[min]')).toBe('1 小時')
  expect(formatDuration(3700000, 'en-US', 'hh[hr] mm[min]')).toBe('1 hr 1 min')
  expect(formatDuration(3700000, 'zh-CN', 'hh[hr] mm[min]')).toBe('1 小时 1 分钟')
  // expect(formatDuration(3700000, 'zh-TW', 'hh[hr] mm[min]')).toBe('1 小時 1 分鐘')

  expect(formatDuration(0)).toBe('0:00')
  expect(formatDuration(0, 'en-US', 'hh[hr] mm[min]')).toBe('0 min')
  expect(formatDuration(0, 'zh-CN', 'hh[hr] mm[min]')).toBe('0 分钟')
})

describe('cacheCoverColor', () => {
  test('cache with valid url', () => {
    vi.stubGlobal('ipcRenderer', {
      send: (channel: IpcChannels, ...args: any[]) => {
        expect(channel).toBe(IpcChannels.CacheCoverColor)
        expect(args[0].api).toBe(CacheAPIs.CoverColor)
        expect(args[0].query).toEqual({
          id: '109951165911363',
          color: '#fff',
        })
      },
    })

    const sendSpy = vi.spyOn(window.ipcRenderer as any, 'send')
    cacheCoverColor(
      'https://p2.music.126.net/2qW-OYZod7SgrzxTwtyBqA==/109951165911363.jpg?param=256y256',
      '#fff'
    )

    expect(sendSpy).toHaveBeenCalledTimes(1)

    vi.stubGlobal('ipcRenderer', undefined)
  })

  test('cache with invalid url', () => {
    vi.stubGlobal('ipcRenderer', {
      send: (channel: IpcChannels, ...args: any[]) => {
        expect(channel).toBe(IpcChannels.CacheCoverColor)
        expect(args[0].api).toBe(CacheAPIs.CoverColor)
        expect(args[0].query).toEqual({
          id: '',
          color: '#fff',
        })
      },
    })

    const sendSpy = vi.spyOn(window.ipcRenderer as any, 'send')
    cacheCoverColor('not a valid url', '#fff')
    expect(sendSpy).toHaveBeenCalledTimes(0)

    vi.stubGlobal('ipcRenderer', undefined)
  })
})

test('calcCoverColor', async () => {
  vi.mock('color.js', () => {
    return {
      average: vi.fn(
        () =>
          new Promise(resolve => {
            resolve('#fff')
          })
      ),
    }
  })

  vi.stubGlobal('ipcRenderer', {
    send: (channel: IpcChannels, ...args: any[]) => {
      expect(channel).toBe(IpcChannels.CacheCoverColor)
      expect(args[0].api).toBe(CacheAPIs.CoverColor)
      expect(args[0].query).toEqual({
        id: '109951165911363',
        color: '#808080',
      })
    },
  })

  const sendSpy = vi.spyOn(window.ipcRenderer as any, 'send')

  expect(
    await calcCoverColor(
      'https://p2.music.126.net/2qW-OYZod7SgrzxTwtyBqA==/109951165911363.jpg?param=256y256'
    )
  ).toBe('#808080')

  vi.stubGlobal('ipcRenderer', undefined)
})

describe('getCoverColor', () => {
  test('hit cache', async () => {
    vi.stubGlobal('ipcRenderer', {
      sendSync: (channel: IpcChannels, ...args: any[]) => {
        expect(channel).toBe(IpcChannels.GetApiCache)
        expect(args[0].api).toBe(CacheAPIs.CoverColor)
        expect(args[0].query).toEqual({
          id: '109951165911363',
        })
        return '#fff'
      },
    })

    const sendSyncSpy = vi.spyOn(window.ipcRenderer as any, 'sendSync')

    expect(
      await getCoverColor(
        'https://p2.music.126.net/2qW-OYZod7SgrzxTwtyBqA==/109951165911363.jpg?param=256y256'
      )
    ).toBe('#fff')

    expect(sendSyncSpy).toHaveBeenCalledTimes(1)
    vi.stubGlobal('ipcRenderer', undefined)
  })

  test('did not hit cache', async () => {
    vi.stubGlobal('ipcRenderer', {
      sendSync: (channel: IpcChannels, ...args: any[]) => {
        expect(channel).toBe(IpcChannels.GetApiCache)
        expect(args[0].api).toBe(CacheAPIs.CoverColor)
        expect(args[0].query).toEqual({
          id: '109951165911363',
        })
        return undefined
      },
      send: () => {
        //
      },
    })

    const sendSyncSpy = vi.spyOn(window.ipcRenderer as any, 'sendSync')
    const sendSpy = vi.spyOn(window.ipcRenderer as any, 'send')

    expect(
      await getCoverColor(
        'https://p2.music.126.net/2qW-OYZod7SgrzxTwtyBqA==/109951165911363.jpg?param=256y256'
      )
    ).toBe('#808080')

    expect(sendSyncSpy).toHaveBeenCalledTimes(1)
    expect(sendSpy).toHaveBeenCalledTimes(1)
    vi.stubGlobal('ipcRenderer', undefined)
  })

  test('invalid url', async () => {
    expect(await getCoverColor('not a valid url')).toBe(undefined)
  })
})

test('storage', () => {
  const mockLocalStorage: any = {
    test: {
      key: 'value',
    },
  }

  vi.stubGlobal('localStorage', {
    getItem: (key: string) => {
      return mockLocalStorage[key] ?? undefined
    },
    setItem: (key: string, value: string) => {
      expect(key).toBe('test')
      expect(value).toEqual(`{"key":"value2"}`)
      mockLocalStorage[key] = value
    },
  })

  expect(storage.set('test', { key: 'value2' })).toBe(undefined)
  expect(storage.get('test')).toEqual({ key: 'value2' })
  expect(storage.get('test2')).toBe(null)

  vi.stubGlobal('localStorage', undefined)
})
