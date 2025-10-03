// 一起听 房间情况

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    roomId: query.roomId,
  }
  return request(`/api/listen/together/room/check`, data, createOption(query))
}
