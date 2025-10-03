// 设置

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {}
  return request(`/api/user/setting`, data, createOption(query, 'weapi'))
}
