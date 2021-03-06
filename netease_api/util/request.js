const encrypt = require('./crypto')
const axios = require('axios')
const queryString = require('querystring')
const PacProxyAgent = require('pac-proxy-agent')
const http = require('http')
const https = require('https')
const tunnel = require('tunnel')
const qs = require('url')
// request.debug = true // 开启可看到更详细信息

const chooseUserAgent = (ua = false) => {
  const userAgentList = {
    mobile: [
      // iOS 13.5.1 14.0 beta with safari
      'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.',
      // iOS with qq micromsg
      'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/602.1.50 (KHTML like Gecko) Mobile/14A456 QQ/6.5.7.408 V1_IPH_SQ_6.5.7_1_APP_A Pixel/750 Core/UIWebView NetType/4G Mem/103',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.15(0x17000f27) NetType/WIFI Language/zh',
      // Android -> Huawei Xiaomi
      'Mozilla/5.0 (Linux; Android 9; PCT-AL10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.64 HuaweiBrowser/10.0.3.311 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; U; Android 9; zh-cn; Redmi Note 8 Build/PKQ1.190616.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/71.0.3578.141 Mobile Safari/537.36 XiaoMi/MiuiBrowser/12.5.22',
      // Android + qq micromsg
      'Mozilla/5.0 (Linux; Android 10; YAL-AL00 Build/HUAWEIYAL-AL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/78.0.3904.62 XWEB/2581 MMWEBSDK/200801 Mobile Safari/537.36 MMWEBID/3027 MicroMessenger/7.0.18.1740(0x27001235) Process/toolsmp WeChat/arm64 NetType/WIFI Language/zh_CN ABI/arm64',
      'Mozilla/5.0 (Linux; U; Android 8.1.0; zh-cn; BKK-AL10 Build/HONORBKK-AL10) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/10.6 Mobile Safari/537.36',
    ],
    pc: [
      // macOS 10.15.6  Firefox / Chrome / Safari
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:80.0) Gecko/20100101 Firefox/80.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.30 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Safari/605.1.15',
      // Windows 10 Firefox / Chrome / Edge
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:80.0) Gecko/20100101 Firefox/80.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.30 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/13.10586',
      // Linux 就算了
    ],
  }
  let realUserAgentList =
    userAgentList[ua] || userAgentList.mobile.concat(userAgentList.pc)
  return ['mobile', 'pc', false].indexOf(ua) > -1
    ? realUserAgentList[Math.floor(Math.random() * realUserAgentList.length)]
    : ua
}
const createRequest = (method, url, data, options) => {
  return new Promise((resolve, reject) => {
    let headers = { 'User-Agent': chooseUserAgent(options.ua) }
    if (method.toUpperCase() === 'POST')
      headers['Content-Type'] = 'application/x-www-form-urlencoded'
    if (url.includes('music.163.com'))
      headers['Referer'] = 'https://music.163.com'
    if (options.realIP) headers['X-Real-IP'] = options.realIP
    // headers['X-Real-IP'] = '118.88.88.88'
    if (typeof options.cookie === 'object')
      headers['Cookie'] = Object.keys(options.cookie)
        .map(
          (key) =>
            encodeURIComponent(key) +
            '=' +
            encodeURIComponent(options.cookie[key]),
        )
        .join('; ')
    else if (options.cookie) headers['Cookie'] = options.cookie

    if (!headers['Cookie']) {
      headers['Cookie'] = options.token || ''
    }
    if (options.crypto === 'weapi') {
      let csrfToken = (headers['Cookie'] || '').match(/_csrf=([^(;|$)]+)/)
      data.csrf_token = csrfToken ? csrfToken[1] : ''
      data = encrypt.weapi(data)
      url = url.replace(/\w*api/, 'weapi')
    } else if (options.crypto === 'linuxapi') {
      data = encrypt.linuxapi({
        method: method,
        url: url.replace(/\w*api/, 'api'),
        params: data,
      })
      headers['User-Agent'] =
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36'
      url = 'https://music.163.com/api/linux/forward'
    } else if (options.crypto === 'eapi') {
      const cookie = options.cookie || {}
      const csrfToken = cookie['__csrf'] || ''
      const header = {
        osver: cookie.osver, //系统版本
        deviceId: cookie.deviceId, //encrypt.base64.encode(imei + '\t02:00:00:00:00:00\t5106025eb79a5247\t70ffbaac7')
        appver: cookie.appver || '8.0.0', // app版本
        versioncode: cookie.versioncode || '140', //版本号
        mobilename: cookie.mobilename, //设备model
        buildver: cookie.buildver || Date.now().toString().substr(0, 10),
        resolution: cookie.resolution || '1920x1080', //设备分辨率
        __csrf: csrfToken,
        os: cookie.os || 'android',
        channel: cookie.channel,
        requestId: `${Date.now()}_${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(4, '0')}`,
      }
      if (cookie.MUSIC_U) header['MUSIC_U'] = cookie.MUSIC_U
      if (cookie.MUSIC_A) header['MUSIC_A'] = cookie.MUSIC_A
      headers['Cookie'] = Object.keys(header)
        .map(
          (key) =>
            encodeURIComponent(key) + '=' + encodeURIComponent(header[key]),
        )
        .join('; ')
      data.header = header
      data = encrypt.eapi(options.url, data)
      url = url.replace(/\w*api/, 'eapi')
    }

    const answer = { status: 500, body: {}, cookie: [] }
    let settings = {
      method: method,
      url: url,
      headers: headers,
      data: queryString.stringify(data),
      httpAgent: new http.Agent({ keepAlive: true }),
      httpsAgent: new https.Agent({ keepAlive: true }),
    }

    if (options.crypto === 'eapi') settings.encoding = null

    if (options.proxy) {
      if (options.proxy.indexOf('pac') > -1) {
        settings.httpAgent = new PacProxyAgent(options.proxy)
        settings.httpsAgent = new PacProxyAgent(options.proxy)
      } else {
        var purl = qs.parse(options.proxy)
        if (purl.hostname) {
          const agent = tunnel.httpsOverHttp({
            proxy: {
              host: purl.hostname,
              port: purl.port || 80,
            },
          })
          settings.httpsAgent = agent
          settings.httpAgent = agent
          settings.proxy = false
        } else {
          console.error('代理配置无效,不使用代理')
        }
      }
    }
    if (options.crypto === 'eapi') {
      settings = {
        ...settings,
        responseType: 'arraybuffer',
      }
    }
    axios(settings)
      .then((res) => {
        const body = res.data
        answer.cookie = (res.headers['set-cookie'] || []).map((x) =>
          x.replace(/\s*Domain=[^(;|$)]+;*/, ''),
        )
        try {
          if (options.crypto === 'eapi') {
            answer.body = JSON.parse(encrypt.decrypt(body).toString())
          } else {
            answer.body = body
          }

          answer.status = answer.body.code || res.status
          if (
            [201, 302, 400, 502, 800, 801, 802, 803].indexOf(answer.body.code) >
            -1
          ) {
            // 特殊状态码
            answer.status = 200
          }
        } catch (e) {
          // console.log(e)
          answer.body = body
          answer.status = res.status
        }

        answer.status =
          100 < answer.status && answer.status < 600 ? answer.status : 400
        if (answer.status == 200) resolve(answer)
        else reject(answer)
      })
      .catch((err) => {
        answer.status = 502
        answer.body = { code: 502, msg: err }
        reject(answer)
      })
  })
}

module.exports = createRequest
