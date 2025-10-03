// 粉丝省份比例
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {}
  return request(
    `/api/fanscenter/basicinfo/province/get`,
    data,
    createOption(query),
  )
}
