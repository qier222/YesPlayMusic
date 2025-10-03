// 歌曲是否喜爱

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    trackIds: query.ids,
  }
  return request(`/api/song/like/check`, data, createOption(query))
}
