// 精选电台

module.exports = (query, request) => {
  return request(
    'POST',
    `https://music.163.com/weapi/djradio/recommend/v1`,
    {},
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
