// 喜欢的歌曲(无序)

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    uid: query.uid,
  }
  return request(`/api/song/like/get`, data, createOption(query))
}
