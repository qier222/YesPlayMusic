// 获取音乐人任务

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {}
  return request(
    `/api/nmusician/workbench/mission/cycle/list`,
    data,
    createOption(query, 'weapi'),
  )
}
