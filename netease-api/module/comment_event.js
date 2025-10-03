// 获取动态评论

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    limit: query.limit || 20,
    offset: query.offset || 0,
    beforeTime: query.before || 0,
  }
  return request(
    `/api/v1/resource/comments/${query.threadId}`,
    data,
    createOption(query, 'weapi'),
  )
}
