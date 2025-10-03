const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    phone: query.phone,
    captcha: query.captcha,
    oldcaptcha: query.oldcaptcha,
    countrycode: query.countrycode || '86',
  }
  return request(
    `/api/user/replaceCellphone`,
    data,
    createOption(query, 'weapi'),
  )
}
