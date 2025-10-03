// 国家编码列表
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {}
  return request(`/api/lbs/countries/v1`, data, createOption(query))
}
