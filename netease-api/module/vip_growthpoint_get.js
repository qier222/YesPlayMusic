// 领取会员成长值

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    taskIds: query.ids,
  }
  return request(
    `/api/vipnewcenter/app/level/task/reward/get`,
    data,
    createOption(query, 'weapi'),
  )
}
