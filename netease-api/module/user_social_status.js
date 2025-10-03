// 用户状态
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  return request(
    `/api/social/user/status`,
    {
      visitorId: query.uid,
    },
    createOption(query),
  )
}
