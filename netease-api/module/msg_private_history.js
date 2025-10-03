// 私信内容

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    userId: query.uid,
    limit: query.limit || 30,
    time: query.before || 0,
    total: 'true',
  }
  return request(`/api/msg/private/history`, data, createOption(query, 'weapi'))
}
