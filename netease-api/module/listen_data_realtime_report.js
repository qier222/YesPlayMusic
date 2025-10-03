// 听歌足迹 - 本周/本月收听时长
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  return request(
    `/api/content/activity/listen/data/realtime/report`,
    {
      type: query.type || 'week', //周 week 月 month
    },
    createOption(query),
  )
}
