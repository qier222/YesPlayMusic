// 收藏与取消收藏歌单
const { APP_CONF } = require('../util/config.json')
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const path = query.t == 1 ? 'subscribe' : 'unsubscribe'
  const data = {
    id: query.id,
    ...(query.t === 1
      ? { checkToken: query.checkToken || APP_CONF.checkToken }
      : {}),
  }
  query.checkToken = true // 强制开启checkToken
  return request(`/api/playlist/${path}`, data, createOption(query, 'eapi'))
}
