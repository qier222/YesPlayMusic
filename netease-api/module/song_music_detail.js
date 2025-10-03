// 歌曲音质详情

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    songId: query.id,
  }
  return request(`/api/song/music/detail/get`, data, createOption(query))
}
