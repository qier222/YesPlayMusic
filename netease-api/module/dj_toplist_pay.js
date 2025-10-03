// 付费精品
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    limit: query.limit || 100,
    // 不支持 offset
  }
  return request(`/api/djradio/toplist/pay`, data, createOption(query, 'weapi'))
}
