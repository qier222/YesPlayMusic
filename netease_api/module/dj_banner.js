// 电台banner

module.exports = (query, request) => {
  const data = {}
  query.cookie.os = 'pc'
  return request(
    'POST',
    `https://music.163.com/weapi/djradio/banner/get`,
    {},
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
