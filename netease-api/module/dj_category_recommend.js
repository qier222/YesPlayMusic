// 电台推荐类型

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  return request(
    `/api/djradio/home/category/recommend`,
    {},
    createOption(query, 'weapi'),
  )
}
