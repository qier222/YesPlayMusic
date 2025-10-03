// 电台节目详情

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    id: query.id,
  }
  return request(`/api/dj/program/detail`, data, createOption(query, 'weapi'))
}
