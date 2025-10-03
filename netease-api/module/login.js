// 邮箱登录

const CryptoJS = require('crypto-js')

const createOption = require('../util/option.js')
module.exports = async (query, request) => {
  const data = {
    type: '0',
    https: 'true',
    username: query.email,
    password: query.md5_password || CryptoJS.MD5(query.password).toString(),
    rememberLogin: 'true',
  }
  let result = await request(`/api/w/login`, data, createOption(query))
  if (result.body.code === 502) {
    return {
      status: 200,
      body: {
        msg: '账号或密码错误',
        code: 502,
        message: '账号或密码错误',
      },
    }
  }
  if (result.body.code === 200) {
    result = {
      status: 200,
      body: {
        ...JSON.parse(
          JSON.stringify(result.body).replace(
            /avatarImgId_str/g,
            'avatarImgIdStr',
          ),
        ),
        cookie: result.cookie.join(';'),
      },
      cookie: result.cookie,
    }
  }
  return result
}
