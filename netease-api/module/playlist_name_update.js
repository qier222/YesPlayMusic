// 更新歌单名

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    id: query.id,
    name: query.name,
  }
  return request(`/api/playlist/update/name`, data, createOption(query))
}
