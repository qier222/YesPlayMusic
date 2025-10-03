// 会员成长值

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {}
  return request(
    `/api/vipnewcenter/app/level/growhpoint/basic`,
    data,
    createOption(query, 'weapi'),
  )
}
