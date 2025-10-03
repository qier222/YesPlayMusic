// 歌词摘录 - 删除摘录歌词

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    markIds: query.id,
  }
  return request(`/api/song/play/lyrics/mark/del`, data, createOption(query))
}
