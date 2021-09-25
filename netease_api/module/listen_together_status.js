// 一起听状态

module.exports = (query, request) => {
  return request(
    'POST',
    `https://music.163.com/api/listen/together/status/get`,
    {},
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
