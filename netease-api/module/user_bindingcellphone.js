const CryptoJS = require('crypto-js')
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    phone: query.phone,
    countrycode: query.countrycode || '86',
    captcha: query.captcha,
    password: query.password ? CryptoJS.MD5(query.password).toString() : '',
  }
  return request(
    `/api/user/bindingCellphone`,
    data,
    createOption(query, 'weapi'),
  )
}
