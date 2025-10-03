// 电台节目榜

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    limit: query.limit || 100,
    offset: query.offset || 0,
  }
  return request(`/api/program/toplist/v1`, data, createOption(query, 'weapi'))
}
