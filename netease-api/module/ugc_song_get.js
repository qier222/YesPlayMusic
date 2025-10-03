// 歌曲简要百科信息
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    songId: query.id,
  }
  return request(`/api/rep/ugc/song/get`, data, createOption(query))
}
