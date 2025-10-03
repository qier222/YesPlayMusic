// 最近听歌列表

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {}
  return request(`/api/pc/recent/listen/list`, data, createOption(query))
}
