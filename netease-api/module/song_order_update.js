// 更新歌曲顺序

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    pid: query.pid,
    trackIds: query.ids,
    op: 'update',
  }

  return request(`/api/playlist/manipulate/tracks`, data, createOption(query))
}
