const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {}
  return request(`/api/point/today/get`, data, createOption(query, 'weapi'))
}
