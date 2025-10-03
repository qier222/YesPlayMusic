// 所有榜单内容摘要v2

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  return request(`/api/toplist/detail/v2`, {}, createOption(query, 'weapi'))
}
