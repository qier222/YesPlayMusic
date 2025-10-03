// 手机登录

const CryptoJS = require('crypto-js')

const createOption = require('../util/option.js')
module.exports = async (query, request) => {
  const data = {
    type: '1',
    https: 'true',
    phone: query.phone,
    countrycode: query.countrycode || '86',
    captcha: query.captcha,
    [query.captcha ? 'captcha' : 'password']: query.captcha
      ? query.captcha
      : query.md5_password || CryptoJS.MD5(query.password).toString(),
    remember: 'true',
  }
  let result = await request(
    `/api/w/login/cellphone`,
    data,
    createOption(query),
  )

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
