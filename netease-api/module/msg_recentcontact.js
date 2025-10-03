// 最近联系

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {}
  return request(
    `/api/msg/recentcontact/get`,
    data,
    createOption(query, 'weapi'),
  )
}
