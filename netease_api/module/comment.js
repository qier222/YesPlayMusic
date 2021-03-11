const { resourceTypeMap } = require('../util/config.json')
// 发送与删除评论

module.exports = (query, request) => {
  query.cookie.os = 'pc'
  query.t = {
    1: 'add',
    0: 'delete',
    2: 'reply',
  }[query.t]
  query.type = resourceTypeMap[query.type]
  const data = {
    threadId: query.type + query.id,
  }

  if (query.type == 'A_EV_2_') {
    data.threadId = query.threadId
  }
  if (query.t == 'add') data.content = query.content
  else if (query.t == 'delete') data.commentId = query.commentId
  else if (query.t == 'reply') {
    data.commentId = query.commentId
    data.content = query.content
  }
  return request(
    'POST',
    `https://music.163.com/weapi/resource/comments/${query.t}`,
    data,
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
