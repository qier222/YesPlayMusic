// 电台分类列表

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  return request(`/api/djradio/category/get`, {}, createOption(query, 'weapi'))
}
