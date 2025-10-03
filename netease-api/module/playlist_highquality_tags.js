// 精品歌单 tags
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {}
  return request(
    `/api/playlist/highquality/tags`,
    data,
    createOption(query, 'weapi'),
  )
}
