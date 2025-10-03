// 音乐百科基础信息
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    songId: query.id,
  }
  return request(`/api/song/play/about/block/page`, data, createOption(query))
}
