// 点赞与取消点赞资源
const { resourceTypeMap } = require('../util/config.json')
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  query.t = query.t == 1 ? 'like' : 'unlike'
  query.type = resourceTypeMap[query.type]
  const data = {
    threadId: query.type + query.id,
  }
  if (query.type === 'A_EV_2_') {
    data.threadId = query.threadId
  }
  return request(`/api/resource/${query.t}`, data, createOption(query, 'weapi'))
}
