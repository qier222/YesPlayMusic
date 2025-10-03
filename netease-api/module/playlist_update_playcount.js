// 歌单打卡

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    id: query.id,
  }
  return request(`/api/playlist/update/playcount`, data, createOption(query))
}
