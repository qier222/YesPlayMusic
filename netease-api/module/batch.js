// 批量请求接口

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {}
  Object.keys(query).forEach((i) => {
    if (/^\/api\//.test(i)) {
      data[i] = query[i]
    }
  })
  return request(`/api/batch`, data, createOption(query))
}
