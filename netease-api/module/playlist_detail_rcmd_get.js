// 相关歌单推荐

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    scene: 'playlist_head',
    playlistId: query.id,
    newStyle: 'true',
  }
  return request(`/api/playlist/detail/rcmd/get`, data, createOption(query))
}
