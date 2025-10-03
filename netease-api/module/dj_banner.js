// 电台banner

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  return request(`/api/djradio/banner/get`, {}, createOption(query, 'weapi'))
}
