// 推荐节目

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    cateId: query.type,
    limit: query.limit || 10,
    offset: query.offset || 0,
  }
  return request(
    `/api/program/recommend/v1`,
    data,
    createOption(query, 'weapi'),
  )
}
