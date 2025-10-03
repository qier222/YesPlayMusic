// 用户状态 - 支持设置的状态
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  return request(`/api/social/user/status/support`, {}, createOption(query))
}
