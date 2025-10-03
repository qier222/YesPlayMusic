// 一起听状态

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  return request(
    `/api/listen/together/status/get`,
    {},
    createOption(query, 'weapi'),
  )
}
