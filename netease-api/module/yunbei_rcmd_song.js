// 云贝推歌

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    songId: query.id,
    reason: query.reason || '好歌献给你',
    scene: '',
    fromUserId: -1,
    yunbeiNum: query.yunbeiNum || 10,
  }
  return request(
    `/api/yunbei/rcmd/song/submit`,
    data,
    createOption(query, 'weapi'),
  )
}
