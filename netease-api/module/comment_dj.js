// 电台评论

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    rid: query.id,
    limit: query.limit || 20,
    offset: query.offset || 0,
    beforeTime: query.before || 0,
  }
  return request(
    `/api/v1/resource/comments/A_DJ_1_${query.id}`,
    data,
    createOption(query, 'weapi'),
  )
}
