// 曲风-歌手

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    cursor: query.cursor || 0,
    size: query.size || 20,
    tagId: query.tagId,
    sort: 0,
  }
  return request(
    `/api/style-tag/home/artist`,
    data,
    createOption(query, 'weapi'),
  )
}
