// 歌手榜

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    type: query.type || 1,
    limit: 100,
    offset: 0,
    total: true,
  }
  return request(`/api/toplist/artist`, data, createOption(query, 'weapi'))
}
