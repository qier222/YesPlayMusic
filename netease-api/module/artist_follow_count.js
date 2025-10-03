// 歌手粉丝数量

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    id: query.id,
  }
  return request(
    `/api/artist/follow/count/get`,
    data,
    createOption(query, 'weapi'),
  )
}
