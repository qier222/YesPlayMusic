// 转发动态

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    forwards: query.forwards,
    id: query.evId,
    eventUserId: query.uid,
  }
  return request(`/api/event/forward`, data, createOption(query))
}
