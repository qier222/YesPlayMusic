// 用户贡献条目、积分、云贝数量
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {}
  return request(`/api/rep/ugc/user/devote`, data, createOption(query))
}
