const { resourceTypeMap } = require('../util/config.json')
// 评论

module.exports = (query, request) => {
  query.cookie.os = 'pc'
  query.type = resourceTypeMap[query.type]
  const threadId = query.type + query.id
  const pageSize = query.pageSize || 20
  const pageNo = query.pageNo || 1
  const data = {
    threadId: threadId,
    pageNo,
    showInner: query.showInner || true,
    pageSize,
    cursor:
      +query.sortType === 3 ? query.cursor || '0' : (pageNo - 1) * pageSize,
    sortType: query.sortType || 1, //1:按推荐排序,2:按热度排序,3:按时间排序
  }
  return request(
    'POST',
    `https://music.163.com/api/v2/resource/comments`,
    data,
    {
      crypto: 'eapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
      url: '/api/v2/resource/comments',
    },
  )
}
