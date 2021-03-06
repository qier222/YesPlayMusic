module.exports = (query, request) => {
  query.cookie.os = 'ios'
  query.cookie.appver = '8.1.20'
  const data = {
    limit: query.limit || 20,
    startTimestamp: query.before || Date.now(),
  }
  return request(
    'POST',
    `https://music.163.com/api/sub/artist/new/works/song/list`,
    data,
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
