// 数字专辑-语种风格馆
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    limit: query.limit || 10,
    offset: query.offset || 0,
    total: true,
    area: query.area || 'Z_H', //Z_H:华语,E_A:欧美,KR:韩国,JP:日本
  }
  return request(
    `/api/vipmall/appalbum/album/style`,
    data,
    createOption(query, 'weapi'),
  )
}
