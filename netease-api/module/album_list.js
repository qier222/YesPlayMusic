// 数字专辑-新碟上架
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    limit: query.limit || 30,
    offset: query.offset || 0,
    total: true,
    area: query.area || 'ALL', //ALL:全部,ZH:华语,EA:欧美,KR:韩国,JP:日本
    type: query.type,
  }
  return request(
    `/api/vipmall/albumproduct/list`,
    data,
    createOption(query, 'weapi'),
  )
}
