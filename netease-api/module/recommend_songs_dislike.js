// 每日推荐歌曲-不感兴趣
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    resId: query.id, // 日推歌曲id
    resType: 4,
    sceneType: 1,
  }
  return request(
    `/api/v2/discovery/recommend/dislike`,
    data,
    createOption(query, 'weapi'),
  )
}
