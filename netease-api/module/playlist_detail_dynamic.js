// 歌单动态信息

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    id: query.id,
    n: 100000,
    s: query.s || 8,
  }
  return request(`/api/playlist/detail/dynamic`, data, createOption(query))
}
