// 电台详情

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    time: query.time || '-1',
    id: query.id,
    limit: query.limit || '20',
    total: 'true',
  }
  return request(`/api/djradio/subscriber`, data, createOption(query, 'weapi'))
}
