// 听歌足迹 - 总收听时长
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  return request(
    `/api/content/activity/listen/data/total`,
    {},
    createOption(query),
  )
}
