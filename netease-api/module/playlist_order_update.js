// 编辑歌单顺序

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    ids: query.ids,
  }
  return request(
    `/api/playlist/order/update`,
    data,
    createOption(query, 'weapi'),
  )
}
