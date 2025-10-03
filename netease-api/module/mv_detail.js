// MV详情

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    id: query.mvid,
  }
  return request(`/api/v1/mv/detail`, data, createOption(query, 'weapi'))
}
