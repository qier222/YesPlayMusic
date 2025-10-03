// 数字专辑销量

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    albumIds: query.ids,
  }
  return request(
    `/api/vipmall/albumproduct/album/query/sales`,
    data,
    createOption(query, 'weapi'),
  )
}
