// 听歌足迹 - 今日收听
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  return request(
    `/api/content/activity/listen/data/today/song/play/rank`,
    {},
    createOption(query),
  )
}
