const { resourceTypeMap } = require('../util/config.json')
module.exports = (query, request) => {
  query.cookie.os = 'ios'
  query.cookie.appver = '8.1.20'
  query.type = resourceTypeMap[query.type || 0]
  const threadId = query.type + query.sid
  const data = {
    targetUserId: query.uid,
    commentId: query.cid,
    threadId: threadId,
  }
  return request(
    'POST',
    `https://music.163.com/api/v2/resource/comments/hug/listener`,
    data,
    {
      crypto: 'api',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
