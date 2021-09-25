module.exports = (query, request) => {
  query.cookie.os = 'ios'
  query.cookie.appver = '8.1.20'
  const data = {
    compose_reminder: 'true',
    compose_hot_comment: 'true',
    limit: query.limit || 10,
    user_id: query.uid,
    time: query.time || 0,
  }
  return request(
    'POST',
    `https://music.163.com/api/comment/user/comment/history`,
    data,
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
