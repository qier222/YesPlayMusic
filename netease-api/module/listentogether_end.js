// 一起听 结束房间

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    roomId: query.roomId,
  }
  return request(`/api/listen/together/end/v2`, data, createOption(query))
}
