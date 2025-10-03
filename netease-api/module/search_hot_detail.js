// 热搜列表
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {}
  return request(`/api/hotsearchlist/get`, data, createOption(query, 'weapi'))
}
