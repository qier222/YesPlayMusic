// 网易出品

module.exports = (query, request) => {
  const data = {
    offset: query.offset || 0,
    limit: query.limit || 30,
  }
  return request(
    'POST',
    `https://interface.music.163.com/api/mv/exclusive/rcmd`,
    data,
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
