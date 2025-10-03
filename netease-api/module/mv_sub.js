// 收藏与取消收藏MV

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  query.t = query.t == 1 ? 'sub' : 'unsub'
  const data = {
    mvId: query.mvid,
    mvIds: '["' + query.mvid + '"]',
  }
  return request(`/api/mv/${query.t}`, data, createOption(query, 'weapi'))
}
