// 预先导入和绑定常用模块及函数
const encrypt = require('./crypto')
const CryptoJS = require('crypto-js')
const { default: axios } = require('axios')
const { PacProxyAgent } = require('pac-proxy-agent')
const http = require('http')
const https = require('https')
const tunnel = require('tunnel')
const fs = require('fs')
const path = require('path')
const tmpPath = require('os').tmpdir()
const {
  cookieToJson,
  cookieObjToString,
  toBoolean,
  generateRandomChineseIP,
} = require('./index')
const { URLSearchParams, URL } = require('url')
const { APP_CONF } = require('../util/config.json')

// 预先读取匿名token并缓存
const anonymous_token = fs.readFileSync(
  path.resolve(tmpPath, './anonymous_token'),
  'utf-8',
)

// 预先绑定常用函数和常量
const floor = Math.floor
const random = Math.random
const now = Date.now
const keys = Object.keys
const stringify = JSON.stringify
const parse = JSON.parse
const characters = 'abcdefghijklmnopqrstuvwxyz'
const charactersLength = characters.length

// 预先创建HTTP/HTTPS agents并重用
const createHttpAgent = () => new http.Agent({ keepAlive: true })
const createHttpsAgent = () => new https.Agent({ keepAlive: true })

// 预先计算WNMCID（只计算一次）
const WNMCID = (function () {
  let randomString = ''
  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(floor(random() * charactersLength))
  }
  return `${randomString}.${now().toString()}.01.0`
})()

// 预先定义osMap
const osMap = {
  pc: {
    os: 'pc',
    appver: '3.1.17.204416',
    osver: 'Microsoft-Windows-10-Professional-build-19045-64bit',
    channel: 'netease',
  },
  linux: {
    os: 'linux',
    appver: '1.2.1.0428',
    osver: 'Deepin 20.9',
    channel: 'netease',
  },
  android: {
    os: 'android',
    appver: '8.20.20.231215173437',
    osver: '14',
    channel: 'xiaomi',
  },
  iphone: {
    os: 'iPhone OS',
    appver: '9.0.90',
    osver: '16.2',
    channel: 'distribution',
  },
}

// 预先定义userAgentMap
const userAgentMap = {
  weapi: {
    pc: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
  },
  linuxapi: {
    linux:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
  },
  api: {
    pc: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 Chrome/91.0.4472.164 NeteaseMusicDesktop/3.0.18.203152',
    android:
      'NeteaseMusic/9.1.65.240927161425(9001065);Dalvik/2.1.0 (Linux; U; Android 14; 23013RK75C Build/UKQ1.230804.001)',
    iphone: 'NeteaseMusic 9.0.90/5038 (iPhone; iOS 16.2; zh_CN)',
  },
}

// 预先定义常量
const DOMAIN = APP_CONF.domain
const API_DOMAIN = APP_CONF.apiDomain
const ENCRYPT_RESPONSE = APP_CONF.encryptResponse
const SPECIAL_STATUS_CODES = new Set([201, 302, 400, 502, 800, 801, 802, 803])

// chooseUserAgent函数
const chooseUserAgent = (crypto, uaType = 'pc') => {
  return userAgentMap[crypto]?.[uaType] || ''
}

// cookie处理
const processCookieObject = (cookie, uri) => {
  const _ntes_nuid = CryptoJS.lib.WordArray.random(32).toString()
  const os = osMap[cookie.os] || osMap['pc']

  const processedCookie = {
    ...cookie,
    __remember_me: 'true',
    ntes_kaola_ad: '1',
    _ntes_nuid: cookie._ntes_nuid || _ntes_nuid,
    _ntes_nnid: cookie._ntes_nnid || `${_ntes_nuid},${now().toString()}`,
    WNMCID: cookie.WNMCID || WNMCID,
    WEVNSM: cookie.WEVNSM || '1.0.0',
    osver: cookie.osver || os.osver,
    deviceId: cookie.deviceId || global.deviceId,
    os: cookie.os || os.os,
    channel: cookie.channel || os.channel,
    appver: cookie.appver || os.appver,
  }

  if (uri.indexOf('login') === -1) {
    processedCookie['NMTID'] = CryptoJS.lib.WordArray.random(16).toString()
  }

  if (!processedCookie.MUSIC_U) {
    processedCookie.MUSIC_A = processedCookie.MUSIC_A || anonymous_token
  }

  return processedCookie
}

// header cookie生成
const createHeaderCookie = (header) => {
  const headerKeys = keys(header)
  const cookieParts = new Array(headerKeys.length)

  for (let i = 0, len = headerKeys.length; i < len; i++) {
    const key = headerKeys[i]
    cookieParts[i] =
      encodeURIComponent(key) + '=' + encodeURIComponent(header[key])
  }

  return cookieParts.join('; ')
}

// requestId生成
const generateRequestId = () => {
  return `${now()}_${floor(random() * 1000)
    .toString()
    .padStart(4, "0")}`;

}

const createRequest = (uri, data, options) => {
  return new Promise((resolve, reject) => {
    // 变量声明和初始化
    const headers = options.headers ? { ...options.headers } : {}
    const ip = options.realIP || options.ip || ''

    // IP头设置
    if (ip) {
      headers['X-Real-IP'] = ip
      headers['X-Forwarded-For'] = ip
    }

    let cookie = options.cookie || {}
    if (typeof cookie === 'string') {
      cookie = cookieToJson(cookie)
    }

    if (typeof cookie === 'object') {
      cookie = processCookieObject(cookie, uri)
      headers['Cookie'] = cookieObjToString(cookie)
    }
    let url = ''
    let encryptData = ''
    let crypto = options.crypto
    const csrfToken = cookie['__csrf'] || ''

    // 加密方式选择
    if (crypto === '') {
      crypto = APP_CONF.encrypt ? 'eapi' : 'api'
    }

    const answer = { status: 500, body: {}, cookie: [] }

    // 根据加密方式处理
    switch (crypto) {
      case 'weapi':
        headers['Referer'] = DOMAIN
        headers['User-Agent'] = options.ua || chooseUserAgent('weapi')
        data.csrf_token = csrfToken
        encryptData = encrypt.weapi(data)
        url = DOMAIN + '/weapi/' + uri.substr(5)
        break

      case 'linuxapi':
        headers['User-Agent'] =
          options.ua || chooseUserAgent('linuxapi', 'linux')
        encryptData = encrypt.linuxapi({
          method: 'POST',
          url: DOMAIN + uri,
          params: data,
        })
        url = DOMAIN + '/api/linux/forward'
        break

      case 'eapi':
      case 'api':
        // header创建
        const header = {
          osver: cookie.osver,
          deviceId: cookie.deviceId,
          os: cookie.os,
          appver: cookie.appver,
          versioncode: cookie.versioncode || '140',
          mobilename: cookie.mobilename || '',
          buildver: cookie.buildver || now().toString().substr(0, 10),
          resolution: cookie.resolution || '1920x1080',
          __csrf: csrfToken,
          channel: cookie.channel,
          requestId: generateRequestId(),
          ...(options.checkToken
            ? { 'X-antiCheatToken': APP_CONF.checkToken }
            : {}),
          // clientSign: APP_CONF.clientSign,
        }

        if (cookie.MUSIC_U) header['MUSIC_U'] = cookie.MUSIC_U
        if (cookie.MUSIC_A) header['MUSIC_A'] = cookie.MUSIC_A

        headers['Cookie'] = createHeaderCookie(header)
        headers['User-Agent'] = options.ua || chooseUserAgent('api', 'iphone')

        if (crypto === 'eapi') {
          data.header = header
          data.e_r = toBoolean(
            options.e_r !== undefined
              ? options.e_r
              : data.e_r !== undefined
              ? data.e_r
              : ENCRYPT_RESPONSE,
          )
          encryptData = encrypt.eapi(uri, data)
          url = API_DOMAIN + '/eapi/' + uri.substr(5)
        } else if (crypto === 'api') {
          url = API_DOMAIN + uri
          encryptData = data
        }
        break

      default:
        console.log('[ERR]', 'Unknown Crypto:', crypto)
        break
    }
    // console.log(url);
    // settings创建
    let settings = {
      method: 'POST',
      url: url,
      headers: headers,
      data: new URLSearchParams(encryptData).toString(),
      httpAgent: createHttpAgent(),
      httpsAgent: createHttpsAgent(),
    }

    // e_r处理
    if (data.e_r) {
      settings.encoding = null
      settings.responseType = 'arraybuffer'
    }

    // 代理处理
    if (options.proxy) {
      if (options.proxy.indexOf('pac') > -1) {
        const agent = new PacProxyAgent(options.proxy)
        settings.httpAgent = agent
        settings.httpsAgent = agent
      } else {
        try {
          const purl = new URL(options.proxy)
          if (purl.hostname) {
            const isHttps = purl.protocol === 'https:'
            const agent = tunnel[isHttps ? 'httpsOverHttp' : 'httpOverHttp']({
              proxy: {
                host: purl.hostname,
                port: purl.port || 80,
                proxyAuth:
                  purl.username && purl.password
                    ? purl.username + ':' + purl.password
                    : '',
              },
            })
            settings.httpsAgent = agent
            settings.httpAgent = agent
            settings.proxy = false
          } else {
            console.error('代理配置无效,不使用代理')
          }
        } catch (e) {
          console.error('代理URL解析失败:', e.message)
        }
      }
    } else {
      settings.proxy = false
    }
    // console.log(settings.headers);
    axios(settings)
      .then((res) => {
        const body = res.data
        answer.cookie = (res.headers['set-cookie'] || []).map((x) =>
          x.replace(/\s*Domain=[^(;|$)]+;*/, ''),
        )

        try {
          if (crypto === 'eapi' && data.e_r) {
            answer.body = encrypt.eapiResDecrypt(
              body.toString('hex').toUpperCase(),
            )
          } else {
            answer.body =
              typeof body === 'object' ? body : parse(body.toString())
          }

          if (answer.body.code) {
            answer.body.code = Number(answer.body.code)
          }

          answer.status = Number(answer.body.code || res.status)

          // 状态码检查（使用Set提升查找性能）
          if (SPECIAL_STATUS_CODES.has(answer.body.code)) {
            answer.status = 200
          }
        } catch (e) {
          answer.body = body
          answer.status = res.status
        }

        answer.status =
          answer.status > 100 && answer.status < 600 ? answer.status : 400

        if (answer.status === 200) {
          resolve(answer)
        } else {
          console.log('[ERR]', answer)
          reject(answer)
        }
      })
      .catch((err) => {
        answer.status = 502
        answer.body = { code: 502, msg: err.message || err }
        console.log('[ERR]', answer)
        reject(answer)
      })
  })
}

module.exports = createRequest
