// 删除歌单

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    ids: '[' + query.id + ']',
  }
  return request(`/api/playlist/remove`, data, createOption(query, 'weapi'))
}
