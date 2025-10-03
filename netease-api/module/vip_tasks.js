// 会员任务

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {}
  return request(
    `/api/vipnewcenter/app/level/task/list`,
    data,
    createOption(query, 'weapi'),
  )
}
