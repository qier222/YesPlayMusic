// 广播电台 - 收藏/取消收藏电台

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  query.t = query.t == 1 ? 'false' : 'true'
  const data = {
    contentType: 'BROADCAST',
    contentId: query.id,
    cancelCollect: query.t,
  }
  return request(`/api/content/interact/collect`, data, createOption(query))
}
