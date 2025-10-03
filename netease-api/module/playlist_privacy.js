// 公开隐私歌单

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    id: query.id,
    privacy: 0,
  }
  return request(`/api/playlist/update/privacy`, data, createOption(query))
}
