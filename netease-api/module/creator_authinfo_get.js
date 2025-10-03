// 获取达人用户信息
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {}
  return request(`/api/user/creator/authinfo/get`, data, createOption(query))
}
