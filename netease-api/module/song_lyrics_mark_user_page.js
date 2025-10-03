// 歌词摘录 - 我的歌词本

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    limit: query.limit || 10,
    offset: query.offset || 0,
  }
  return request(
    `/api/song/play/lyrics/mark/user/page`,
    data,
    createOption(query),
  )
}
