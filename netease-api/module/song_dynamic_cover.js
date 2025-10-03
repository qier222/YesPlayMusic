// 歌曲动态封面

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    songId: query.id,
  }
  return request(`/api/songplay/dynamic-cover`, data, createOption(query))
}
