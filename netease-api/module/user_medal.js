// 用户徽章
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  return request(
    `/api/medal/user/page`,
    {
      uid: query.uid,
    },
    createOption(query),
  )
}
