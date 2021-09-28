import Cookies from 'js-cookie'
import { useStore } from '@renderer/store'
import { objectsOmit } from 'all-of-just'

const store = useStore()

export function setCookies(string: string) {
  const cookies = string.replace('HTTPOnly', '').split(';;')
  cookies.map(cookie => {
    const cookieKeyValue = cookie.split(';')[0].split('=')
    const [key, value] = cookieKeyValue
    store.account.cookies[key] = value
    Cookies.set(key, value, { expires: 3650 })
  })
}

export function getCookie(key: string) {
  return Cookies.get(key) ?? store.account.cookies[key]
}

export function removeCookie(key: string) {
  Cookies.remove(key)
  objectsOmit(store.account.cookies, key)
}
