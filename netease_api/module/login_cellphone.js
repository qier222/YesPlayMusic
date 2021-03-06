// 手机登录

const crypto = require('crypto')

module.exports = async (query, request) => {
  query.cookie.os = 'pc'
  const data = {
    phone: query.phone,
    countrycode: query.countrycode || '86',
    password:
      query.md5_password ||
      crypto.createHash('md5').update(query.password).digest('hex'),
    rememberLogin: 'true',
  }
  let result = await request(
    'POST',
    `https://music.163.com/weapi/login/cellphone`,
    data,
    {
      crypto: 'weapi',
      ua: 'pc',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )

  if (result.body.code === 200) {
    result = {
      status: 200,
      body: {
        ...result.body,
        cookie: result.cookie.join(';'),
      },
      cookie: result.cookie,
    }
  }
  return result
}
