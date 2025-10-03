// 关注与取消关注用户

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  query.t = query.t == 1 ? 'follow' : 'delfollow'
  return request(
    `/api/user/${query.t}/${query.id}`,
    {},
    createOption(query, 'weapi'),
  )
}
