// 用户状态 - 编辑
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  return request(
    `/api/social/user/status/edit`,
    {
      content: JSON.stringify({
        type: query.type,
        iconUrl: query.iconUrl,
        content: query.content,
        actionUrl: query.actionUrl,
      }),
    },
    createOption(query),
  )
}
