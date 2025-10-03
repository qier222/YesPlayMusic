// 歌曲红心数量

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    songId: query.id,
  }
  return request(`/api/song/red/count`, data, createOption(query))
}
