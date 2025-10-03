const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {}
  return request(`/api/v1/user/info`, data, createOption(query, 'weapi'))
}
