import request from '@/web/utils/request'
import { FetchUserAccountResponse } from '@/shared/api/User'

// 手机号登录
interface LoginWithPhoneParams {
  countrycode: number | string
  phone: string
  password?: string
  md5_password?: string
  captcha?: string | number
}
export interface LoginWithPhoneResponse {
  loginType: number
  code: number
  cookie: string
}
export function loginWithPhone(
  params: LoginWithPhoneParams
): Promise<LoginWithPhoneResponse> {
  return request({
    url: '/login/cellphone',
    method: 'post',
    params,
  })
}

// 邮箱登录
export interface LoginWithEmailParams {
  email: string
  password?: string
  md5_password?: string
}
export interface LoginWithEmailResponse extends FetchUserAccountResponse {
  code: number
  cookie: string
  loginType: number
  token: string
  binding: {
    bindingTime: number
    expired: boolean
    expiresIn: number
    id: number
    refreshTime: number
    tokenJsonStr: string
    type: number
    url: string
    userId: number
  }[]
}
export function loginWithEmail(
  params: LoginWithEmailParams
): Promise<LoginWithEmailResponse> {
  return request({
    url: '/login',
    method: 'post',
    params,
  })
}

// 生成二维码key
export interface FetchLoginQrCodeKeyResponse {
  code: number
  data: {
    code: number
    unikey: string
  }
}
export function fetchLoginQrCodeKey(): Promise<FetchLoginQrCodeKeyResponse> {
  return request({
    url: '/login/qr/key',
    method: 'get',
    params: {
      timestamp: new Date().getTime(),
    },
  })
}

// 二维码检测扫码状态接口
// 说明: 轮询此接口可获取二维码扫码状态,800为二维码过期,801为等待扫码,802为待确认,803为授权登录成功(803状态码下会返回cookies)
export interface CheckLoginQrCodeStatusParams {
  key: string
}
export interface CheckLoginQrCodeStatusResponse {
  code: number
  message?: string
  cookie?: string
}
export function checkLoginQrCodeStatus(
  params: CheckLoginQrCodeStatusParams
): Promise<CheckLoginQrCodeStatusResponse> {
  return request({
    url: '/login/qr/check',
    method: 'get',
    params: {
      key: params.key,
      timestamp: new Date().getTime(),
    },
  })
}

// 刷新登录
export function refreshCookie() {
  return request({
    url: '/login/refresh',
    method: 'post',
  })
}

// 退出登录
export function logout() {
  return request({
    url: '/logout',
    method: 'post',
  })
}
