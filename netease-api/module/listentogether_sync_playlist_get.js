// 一起听 当前列表获取

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    roomId: query.roomId,
  }
  return request(
    `/api/listen/together/sync/playlist/get`,
    data,
    createOption(query),
  )
}
