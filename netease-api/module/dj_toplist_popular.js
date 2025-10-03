// 电台最热主播榜

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    limit: query.limit || 100,
    // 不支持 offset
  }
  return request(`/api/dj/toplist/popular`, data, createOption(query, 'weapi'))
}
