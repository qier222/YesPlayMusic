// 收藏计数

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  return request(`/api/subcount`, {}, createOption(query, 'weapi'))
}
