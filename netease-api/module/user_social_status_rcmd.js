// 用户状态 - 相同状态的用户
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  return request(`/api/social/user/status/rcmd`, {}, createOption(query))
}
