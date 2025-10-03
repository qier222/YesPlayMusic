// 黑胶时光机

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {}
  if (query.startTime && query.endTime) {
    data.startTime = query.startTime
    data.endTime = query.endTime
    data.type = 1
    data.limit = query.limit || 60
  }
  return request(
    `/api/vipmusic/newrecord/weekflow`,
    data,
    createOption(query, 'weapi'),
  )
}
