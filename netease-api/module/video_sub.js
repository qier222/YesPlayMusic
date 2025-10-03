// 收藏与取消收藏视频

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  query.t = query.t == 1 ? 'sub' : 'unsub'
  const data = {
    id: query.id,
  }
  return request(
    `/api/cloudvideo/video/${query.t}`,
    data,
    createOption(query, 'weapi'),
  )
}
