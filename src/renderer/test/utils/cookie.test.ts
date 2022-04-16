import { expect, test, describe, vi, beforeEach, afterEach } from 'vitest'

import {
  setCookies,
  getCookie,
  removeCookie,
  parseCookies,
  removeAllCookies,
} from '@/renderer/utils/cookie'
import Cookies from 'js-cookie'

describe('parseCookies', () => {
  test('parse simple cookies', () => {
    expect(parseCookies('test=test; test2=test2')).toEqual([
      {
        key: 'test',
        value: 'test',
      },
      {
        key: 'test2',
        value: 'test2',
      },
    ])
  })

  test('parse cookies with empty value, expires and double semicolon', () => {
    expect(
      parseCookies(
        'test=; test2=test2; Expires=Wed, 21 Oct 2015 07:28:00 GMT;;'
      )
    ).toEqual([
      {
        key: 'test',
        value: '',
      },
      {
        key: 'test2',
        value: 'test2',
      },
    ])
  })

  test('prase cookies with max-age', () => {
    expect(parseCookies('test2=test2; Max-Age=604800')).toEqual([
      {
        key: 'test2',
        value: 'test2',
        options: {
          expires: 7,
        },
      },
    ])
  })

  test('parse cookies with invalid max-age', () => {
    expect(parseCookies('test2=test2; Max-Age=invalid')).toEqual([
      {
        key: 'test2',
        value: 'test2',
      },
    ])
  })

  test('parse cookie with path', () => {
    expect(parseCookies('test2=test2; Path=/')).toEqual([
      {
        key: 'test2',
        value: 'test2',
        options: {
          path: '/',
        },
      },
    ])
  })

  test('parse cookie with HTTPOnly', () => {
    expect(parseCookies('test2=test2; HttpOnly')).toEqual([
      {
        key: 'test2',
        value: 'test2',
      },
    ])
  })
})

describe('setCookies', () => {
  beforeEach(() => {
    removeAllCookies()
  })

  afterEach(() => {
    removeAllCookies()
  })

  test('set one cookie', () => {
    const setSpy = vi.spyOn(Cookies, 'set')
    expect(setCookies('test=test')).toBe(undefined)
    expect(setSpy).toHaveBeenCalledTimes(1)
    expect(Cookies.get('test')).toBe('test')
  })

  test('set multiple cookies', () => {
    const setSpy = vi.spyOn(Cookies, 'set')
    expect(setCookies('test=test; test2=test2;')).toBe(undefined)
    expect(setSpy).toHaveBeenCalledTimes(2)
    expect(Cookies.get('test')).toBe('test')
    expect(Cookies.get('test2')).toBe('test2')
  })

  test('set Netease qr code login cookies', () => {
    const setSpy = vi.spyOn(Cookies, 'set')
    expect(
      setCookies(
        'MUSIC_R_T=1376792525993; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:40:05 GMT; Path=/eapi/clientlog; HTTPOnly;MUSIC_A_T=1376792466000; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:40:05 GMT; Path=/api/clientlog; HTTPOnly;MUSIC_R_T=1376792525993; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:40:05 GMT; Path=/openapi/clientlog; HTTPOnly;MUSIC_R_T=1376792525993; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:40:05 GMT; Path=/api/feedback; HTTPOnly;MUSIC_SNS=; Max-Age=0; Expires=Thu, 14 Apr 2022 08:25:58 GMT; Path=/;MUSIC_U=a0d026bc508b3b4427c06d7c2aa66c200764eceb4734513f6caf9308528ac1369f00530f; Max-Age=15552000; Expires=Tue, 11 Oct 2022 08:25:58 GMT; Path=/; HTTPOnly;MUSIC_R_T=1376792525993; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:40:05 GMT; Path=/weapi/clientlog; HTTPOnly;MUSIC_A_T=1376792466000; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:40:05 GMT; Path=/wapi/clientlog; HTTPOnly;__csrf=5b947e26d720eeaf28700786d41ea5dd; Max-Age=1296010; Expires=Fri, 29 Apr 2022 08:26:08 GMT; Path=/;;MUSIC_R_T=1376792525993; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:40:05 GMT; Path=/weapi/feedback; HTTPOnly;MUSIC_R_T=1376792525993; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:40:05 GMT; Path=/neapi/feedback; HTTPOnly;MUSIC_A_T=1376792466000; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:40:05 GMT; Path=/weapi/clientlog; HTTPOnly;MUSIC_A_T=; Max-Age=0; Expires=Thu, 14 Apr 2022 08:25:58 GMT; Path=/;;MUSIC_A_T=1376792466000; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:40:05 GMT; Path=/wapi/feedback; HTTPOnly;MUSIC_A_T=1376792466000; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:40:05 GMT; Path=/neapi/feedback; HTTPOnly;MUSIC_R_T=1376792525993; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:40:05 GMT; Path=/api/clientlog; HTTPOnly;MUSIC_A_T=1376792466000; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:40:05 GMT; Path=/api/feedback; HTTPOnly;MUSIC_A_T=1376792466000; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:40:05 GMT; Path=/weapi/feedback; HTTPOnly;MUSIC_A_T=1376792466000; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:40:05 GMT; Path=/neapi/clientlog; HTTPOnly;MUSIC_R_T=1376792525993; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:40:05 GMT; Path=/eapi/feedback; HTTPOnly;MUSIC_R_T=1376792525993; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:40:05 GMT; Path=/neapi/clientlog; HTTPOnly;MUSIC_A_T=1376792466000; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:40:05 GMT; Path=/eapi/clientlog; HTTPOnly;MUSIC_R_T=1376792525993; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:40:05 GMT; Path=/wapi/feedback; HTTPOnly;MUSIC_A_T=1376792466000; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:40:05 GMT; Path=/openapi/clientlog; HTTPOnly;MUSIC_R_T=1376792525993; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:40:05 GMT; Path=/wapi/clientlog; HTTPOnly;MUSIC_A_T=1376792466000; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:40:05 GMT; Path=/eapi/feedback; HTTPOnly'
      )
    ).toBe(undefined)
    expect(setSpy).toHaveBeenCalledTimes(26)
    expect(Cookies.get('MUSIC_U')).toBe(
      'a0d026bc508b3b4427c06d7c2aa66c200764eceb4734513f6caf9308528ac1369f00530f'
    )
    expect(Cookies.get('__csrf')).toBe('5b947e26d720eeaf28700786d41ea5dd')
    expect(Cookies.get('MUSIC_R_T')).toBe(undefined) // because of path is not /
    expect(Cookies.get('MUSIC_A_T')).toBe(undefined) // because of path is not /
  })

  test('set Netease email login cookies', () => {
    const setSpy = vi.spyOn(Cookies, 'set')
    expect(
      setCookies(
        '__remember_me=true; Max-Age=1296000; Expires=Fri, 29 Apr 2022 08:41:59 GMT; Path=/;;MUSIC_A_T=1519475931796; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:56:06 GMT; Path=/wapi/clientlog;;MUSIC_A_T=; Max-Age=0; Expires=Thu, 14 Apr 2022 08:41:59 GMT; Path=/;;MUSIC_A_T=1519475931796; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:56:06 GMT; Path=/eapi/clientlog;;MUSIC_A_T=1519475931796; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:56:06 GMT; Path=/neapi/clientlog;;MUSIC_R_T=1519475931800; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:56:06 GMT; Path=/wapi/feedback;;__csrf=be948ee03ab9aa0c4cc0bfd7a6276728; Max-Age=1296010; Expires=Fri, 29 Apr 2022 08:42:09 GMT; Path=/;;MUSIC_R_T=1519475931800; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:56:06 GMT; Path=/openapi/clientlog;;MUSIC_U=1239b6c1217d8cd240df9c8fa15e99a69c3fa0e6a9dfac6b5b7c2a817be2b9a20807b5c6b97f6b5; Max-Age=1296000; Expires=Fri, 29 Apr 2022 08:41:59 GMT; Path=/;;MUSIC_R_T=1519475931800; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:56:06 GMT; Path=/eapi/feedback;;MUSIC_R_T=1519475931800; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:56:06 GMT; Path=/eapi/clientlog;;MUSIC_R_T=1519475931800; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:56:06 GMT; Path=/wapi/clientlog;;MUSIC_A_T=1519475931796; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:56:06 GMT; Path=/api/feedback;;MUSIC_R_T=1519475931800; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:56:06 GMT; Path=/api/clientlog;;MUSIC_SNS=; Max-Age=0; Expires=Thu, 14 Apr 2022 08:41:59 GMT; Path=/;MUSIC_A_T=1519475931796; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:56:06 GMT; Path=/eapi/feedback;;MUSIC_R_T=1519475931800; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:56:06 GMT; Path=/weapi/clientlog;;MUSIC_A_T=1519475931796; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:56:06 GMT; Path=/weapi/clientlog;;MUSIC_A_T=1519475931796; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:56:06 GMT; Path=/openapi/clientlog;;MUSIC_R_T=1519475931800; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:56:06 GMT; Path=/weapi/feedback;;MUSIC_R_T=; Max-Age=0; Expires=Thu, 14 Apr 2022 08:41:59 GMT; Path=/;;MUSIC_R_T=1519475931800; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:56:06 GMT; Path=/neapi/feedback;;MUSIC_A_T=1519475931796; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:56:06 GMT; Path=/weapi/feedback;;MUSIC_A_T=1519475931796; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:56:06 GMT; Path=/neapi/feedback;;MUSIC_R_T=1519475931800; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:56:06 GMT; Path=/api/feedback;;MUSIC_A_T=1519475931796; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:56:06 GMT; Path=/api/clientlog;;MUSIC_R_T=1519475931800; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:56:06 GMT; Path=/neapi/clientlog;;MUSIC_A_T=1519475931796; Max-Age=2147483647; Expires=Tue, 2 May 2090 11:56:06 GMT; Path=/wapi/feedback;'
      )
    ).toBe(undefined)
    expect(setSpy).toHaveBeenCalledTimes(28)
    expect(Cookies.get('MUSIC_U')).toBe(
      '1239b6c1217d8cd240df9c8fa15e99a69c3fa0e6a9dfac6b5b7c2a817be2b9a20807b5c6b97f6b5'
    )
    expect(Cookies.get('__remember_me')).toBe('true')
    expect(Cookies.get('__csrf')).toBe('be948ee03ab9aa0c4cc0bfd7a6276728')
    expect(Cookies.get('MUSIC_R_T')).toBe(undefined) // because of path is not /
    expect(Cookies.get('MUSIC_A_T')).toBe(undefined) // because of path is not /
  })

  test('set Netease phone login cookies', () => {
    const setSpy = vi.spyOn(Cookies, 'set')
    expect(
      setCookies(
        'MUSIC_A_T=1376792466000; Max-Age=2147483647; Expires=Tue, 02 May 2090 11:59:41 GMT; Path=/openapi/clientlog;;MUSIC_A_T=1376792466000; Max-Age=2147483647; Expires=Tue, 02 May 2090 11:59:41 GMT; Path=/eapi/feedback;;MUSIC_R_T=1376792525993; Max-Age=2147483647; Expires=Tue, 02 May 2090 11:59:41 GMT; Path=/weapi/clientlog;;MUSIC_A_T=1376792466000; Max-Age=2147483647; Expires=Tue, 02 May 2090 11:59:41 GMT; Path=/weapi/feedback;;MUSIC_R_T=1376792525993; Max-Age=2147483647; Expires=Tue, 02 May 2090 11:59:41 GMT; Path=/wapi/clientlog;;MUSIC_A_T=1376792466000; Max-Age=2147483647; Expires=Tue, 02 May 2090 11:59:41 GMT; Path=/api/feedback;;MUSIC_A_T=1376792466000; Max-Age=2147483647; Expires=Tue, 02 May 2090 11:59:41 GMT; Path=/wapi/feedback;;MUSIC_A_T=1376792466000; Max-Age=2147483647; Expires=Tue, 02 May 2090 11:59:41 GMT; Path=/api/clientlog;;NMTID=00OEhPKoaEluGvd9kgutai-iADpQkEAAAGAJz_PTQ; Max-Age=315360000; Expires=Sun, 11 Apr 2032 08:45:34 GMT; Path=/;;MUSIC_A_T=1376792466000; Max-Age=2147483647; Expires=Tue, 02 May 2090 11:59:41 GMT; Path=/eapi/clientlog;;MUSIC_R_T=1376792525993; Max-Age=2147483647; Expires=Tue, 02 May 2090 11:59:41 GMT; Path=/api/clientlog;;MUSIC_R_T=1376792525993; Max-Age=2147483647; Expires=Tue, 02 May 2090 11:59:41 GMT; Path=/openapi/clientlog;;MUSIC_U=a0d026bc508b3b4427c06d7c2aa66c204ba2a162576a513197f262a1067ea44651; Max-Age=1296000; Expires=Fri, 29 Apr 2022 08:45:34 GMT; Path=/;;MUSIC_SNS=; Max-Age=0; Expires=Thu, 14 Apr 2022 08:45:34 GMT; Path=/;MUSIC_A_T=1376792466000; Max-Age=2147483647; Expires=Tue, 02 May 2090 11:59:41 GMT; Path=/wapi/clientlog;;MUSIC_R_T=1376792525993; Max-Age=2147483647; Expires=Tue, 02 May 2090 11:59:41 GMT; Path=/eapi/clientlog;;__csrf=78328f711c179391b096a67ad9d0f08b; Max-Age=1296010; Expires=Fri, 29 Apr 2022 08:45:44 GMT; Path=/;;MUSIC_A_T=1376792466000; Max-Age=2147483647; Expires=Tue, 02 May 2090 11:59:41 GMT; Path=/neapi/feedback;;__remember_me=true; Max-Age=1296000; Expires=Fri, 29 Apr 2022 08:45:34 GMT; Path=/;;MUSIC_A_T=1376792466000; Max-Age=2147483647; Expires=Tue, 02 May 2090 11:59:41 GMT; Path=/weapi/clientlog;;MUSIC_R_T=1376792525993; Max-Age=2147483647; Expires=Tue, 02 May 2090 11:59:41 GMT; Path=/eapi/feedback;;MUSIC_R_T=1376792525993; Max-Age=2147483647; Expires=Tue, 02 May 2090 11:59:41 GMT; Path=/api/feedback;;MUSIC_R_T=1376792525993; Max-Age=2147483647; Expires=Tue, 02 May 2090 11:59:41 GMT; Path=/weapi/feedback;;MUSIC_R_T=1376792525993; Max-Age=2147483647; Expires=Tue, 02 May 2090 11:59:41 GMT; Path=/neapi/clientlog;;MUSIC_R_T=1376792525993; Max-Age=2147483647; Expires=Tue, 02 May 2090 11:59:41 GMT; Path=/neapi/feedback;;MUSIC_A_T=1376792466000; Max-Age=2147483647; Expires=Tue, 02 May 2090 11:59:41 GMT; Path=/neapi/clientlog;;MUSIC_R_T=1376792525993; Max-Age=2147483647; Expires=Tue, 02 May 2090 11:59:41 GMT; Path=/wapi/feedback;'
      )
    ).toBe(undefined)
    expect(setSpy).toHaveBeenCalledTimes(27)
    expect(Cookies.get('MUSIC_U')).toBe(
      'a0d026bc508b3b4427c06d7c2aa66c204ba2a162576a513197f262a1067ea44651'
    )
    expect(Cookies.get('__remember_me')).toBe('true')
    expect(Cookies.get('__csrf')).toBe('78328f711c179391b096a67ad9d0f08b')
    expect(Cookies.get('NMTID')).toBe(
      '00OEhPKoaEluGvd9kgutai-iADpQkEAAAGAJz_PTQ'
    )
    expect(Cookies.get('MUSIC_R_T')).toBe(undefined) // because of path is not /
    expect(Cookies.get('MUSIC_A_T')).toBe(undefined) // because of path is not /
  })
})

test('getCookie', () => {
  removeAllCookies()
  document.cookie = 'test=test'
  expect(getCookie('test')).toBe('test')
  removeAllCookies()
})

test('removeCookie', () => {
  removeAllCookies()
  document.cookie = 'test=test'
  removeCookie('test')
  expect(getCookie('test')).toBe(undefined)
  expect(document.cookie).toBe('')
  removeAllCookies()
})

test('removeAllCookies', () => {
  document.cookie = 'test=test'
  document.cookie = 'test2=test2'
  removeAllCookies()
  expect(document.cookie).toBe('')
})
