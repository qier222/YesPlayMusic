// 曲风-专辑

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    cursor: query.cursor || 0,
    size: query.size || 20,
    tagId: query.tagId,
    sort: query.sort || 0,
  }
  return request(
    `/api/style-tag/home/album`,
    data,
    createOption(query, 'weapi'),
  )
}
