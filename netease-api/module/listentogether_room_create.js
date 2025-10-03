// 一起听创建房间

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    refer: 'songplay_more',
  }
  return request(`/api/listen/together/room/create`, data, createOption(query))
}
