// 电台非热门类型

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  return request(
    `/api/djradio/category/excludehot`,
    {},
    createOption(query, 'weapi'),
  )
}
