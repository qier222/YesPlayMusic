// 推荐电台

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  return request(
    `/api/personalized/djprogram`,
    {},
    createOption(query, 'weapi'),
  )
}
