// 推荐MV

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  return request(`/api/personalized/mv`, {}, createOption(query, 'weapi'))
}
