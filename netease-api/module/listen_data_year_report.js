// 听歌足迹 - 年度听歌足迹
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  return request(
    `/api/content/activity/listen/data/year/report`,
    {},
    createOption(query),
  )
}
