const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {}
  return request(`/api/nuser/account/get`, data, createOption(query, 'weapi'))
}
