// 多类型搜索

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    type: query.type || 1,
    s: query.keywords || '',
  }
  return request(
    `/api/search/suggest/multimatch`,
    data,
    createOption(query, 'weapi'),
  )
}
