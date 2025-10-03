// 歌手相关MV

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    artistId: query.id,
    limit: query.limit,
    offset: query.offset,
    total: true,
  }
  return request(`/api/artist/mvs`, data, createOption(query, 'weapi'))
}
