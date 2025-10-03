// 云随机播放
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    ids: query.ids,
  }
  return request(`/api/playmode/song/vector/get`, data, createOption(query))
}
