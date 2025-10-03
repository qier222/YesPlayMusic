// 歌手简要百科信息
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    artistId: query.id,
  }
  return request(`/api/rep/ugc/artist/get`, data, createOption(query))
}
