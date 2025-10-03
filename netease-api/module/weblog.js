// 操作记录

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  return request(
    `/api/feedback/weblog`,
    query.data || {},
    createOption(query, 'weapi'),
  )
}
