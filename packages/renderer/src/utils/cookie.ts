import Cookies from 'js-cookie'

export function setCookies(string: string) {
  const cookies = string.replaceAll(/;.*?HTTPOnly.*?;/g, ';;').split(';;')
  cookies.map(cookie => {
    const cookieKeyValue = cookie.split(';')[0].split('=')
    const [key, value] = cookieKeyValue
    // store.account.cookies[key] = value
    Cookies.set(key, value, { expires: 3650 })
  })
}

export function getCookie(key: string) {
  return Cookies.get(key)
}

export function removeCookie(key: string) {
  Cookies.remove(key)
}
