// 歌手单曲

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  return request(`/api/v1/artist/${query.id}`, {}, createOption(query, 'weapi'))
}
