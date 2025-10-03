// 相似歌手
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    artistid: query.id,
  }
  return request(
    `/api/discovery/simiArtist`,
    data,
    createOption(query, 'weapi'),
  )
}
