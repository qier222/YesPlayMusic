const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {}
  return request(`/api/pointmall/user/sign`, data, createOption(query, 'weapi'))
}
