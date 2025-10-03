// 私人FM

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  return request(`/api/v1/radio/get`, {}, createOption(query, 'weapi'))
}
