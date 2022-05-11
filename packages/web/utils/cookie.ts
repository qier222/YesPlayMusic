import Cookies, { CookieAttributes } from 'js-cookie'

interface Cookie {
  key: string
  value: string
  options?: CookieAttributes
}

export function parseCookies(cookie: string): Cookie[] {
  const cookies: Cookie[] = []
  let tmpCookie: Cookie | null = null
  cookie.split(';').forEach(item => {
    const splittedItem = item.split('=')
    if (splittedItem.length !== 2) return

    const key = splittedItem[0].trim()
    const value = splittedItem[1].trim()

    if (key.toLowerCase() === 'expires') return
    if (key.toLowerCase() === 'max-age') {
      const expires = Number(value) / 60 / 60 / 24
      if (isNaN(expires)) return
      tmpCookie = {
        ...((tmpCookie as Cookie) ?? {}),
        options: {
          ...tmpCookie?.options,
          expires: expires,
        },
      }
      return
    }

    if (key.toLowerCase() === 'path') {
      tmpCookie = {
        ...((tmpCookie as Cookie) ?? {}),
        options: {
          ...tmpCookie?.options,
          path: value,
        },
      }
      return
    }

    if (tmpCookie) cookies.push(tmpCookie)

    tmpCookie = {
      key,
      value,
    }
  })

  if (tmpCookie) cookies.push(tmpCookie)

  return cookies
}

export function setCookies(string: string) {
  const cookies = parseCookies(string)
  cookies.forEach(cookie => {
    Cookies.set(cookie.key, cookie.value, cookie.options)
  })
}

export function getCookie(key: string) {
  return Cookies.get(key)
}

export function removeCookie(key: string) {
  Cookies.remove(key)
}

export function removeAllCookies() {
  const cookies = document.cookie.split(';')

  cookies.forEach(cookie => {
    const splitted = cookie.split('=')
    const name = splitted[0].trim()
    document.cookie = `${name}=;max-age=0`
  })
}
