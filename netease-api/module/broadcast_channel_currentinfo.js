// 广播电台 - 电台信息

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    channelId: query.id,
  }
  return request(
    `/api/voice/broadcast/channel/currentinfo`,
    data,
    createOption(query),
  )
}
