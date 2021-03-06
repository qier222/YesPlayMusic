const { resourceTypeMap } = require('../util/config.json')
// 热门评论

module.exports = (query, request) => {
  query.cookie.os = 'pc'
  query.type = resourceTypeMap[query.type]
  const data = {
    rid: query.id,
    limit: query.limit || 20,
    offset: query.offset || 0,
    beforeTime: query.before || 0,
  }
  return request(
    'POST',
    `https://music.163.com/weapi/v1/resource/hotcomments/${query.type}${query.id}`,
    data,
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
