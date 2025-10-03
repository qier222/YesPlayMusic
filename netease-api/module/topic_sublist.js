// 收藏的专栏

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    limit: query.limit || 50,
    offset: query.offset || 0,
    total: true,
  }
  return request(`/api/topic/sublist`, data, createOption(query, 'weapi'))
}
