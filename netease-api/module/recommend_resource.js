// 每日推荐歌单

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  return request(
    `/api/v1/discovery/recommend/resource`,
    {},
    createOption(query, 'weapi'),
  )
}
