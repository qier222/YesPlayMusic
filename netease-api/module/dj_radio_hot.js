// 类别热门电台

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    cateId: query.cateId,
    limit: query.limit || 30,
    offset: query.offset || 0,
  }
  return request(`/api/djradio/hot`, data, createOption(query, 'weapi'))
}
