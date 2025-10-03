// 每日推荐歌曲

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {}
  return request(
    `/api/v3/discovery/recommend/songs`,
    data,
    createOption(query, 'weapi'),
  )
}
