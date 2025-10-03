// 已购单曲

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    limit: query.limit || 20,
    offset: query.offset || 0,
  }
  return request(
    `/api/single/mybought/song/list`,
    data,
    createOption(query, 'weapi'),
  )
}
