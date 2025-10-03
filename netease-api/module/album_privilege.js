// 获取专辑歌曲的音质

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    id: query.id,
  }
  return request(`/api/album/privilege`, data, createOption(query))
}
