// 广播电台 - 分类/地区信息

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {}
  return request(
    `/api/voice/broadcast/category/region/get`,
    data,
    createOption(query),
  )
}
