// 专辑动态信息
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    id: query.id,
  }
  return request(
    `/api/album/detail/dynamic`,
    data,
    createOption(query, 'weapi'),
  )
}
