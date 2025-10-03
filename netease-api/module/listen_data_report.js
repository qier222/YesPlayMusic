// 听歌足迹 - 周/月/年收听报告
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  return request(
    `/api/content/activity/listen/data/report`,
    {
      type: query.type || 'week', //周 week 月 month 年 year
      endTime: query.endTime, // 不填就是本周/月的
    },
    createOption(query),
  )
}
