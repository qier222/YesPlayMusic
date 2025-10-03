// 专辑简要百科信息
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    albumId: query.id,
  }
  return request(`/api/rep/ugc/album/get`, data, createOption(query))
}
