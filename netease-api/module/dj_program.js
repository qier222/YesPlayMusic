// 电台节目列表
const { toBoolean } = require('../util')
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    radioId: query.rid,
    limit: query.limit || 30,
    offset: query.offset || 0,
    asc: toBoolean(query.asc),
  }
  return request(`/api/dj/program/byradio`, data, createOption(query, 'weapi'))
}
