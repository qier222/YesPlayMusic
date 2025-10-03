const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {}
  // /api/point/today/get
  return request(`/api/point/signed/get`, data, createOption(query, 'weapi'))
}
