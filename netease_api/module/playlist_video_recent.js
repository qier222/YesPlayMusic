module.exports = (query, request) => {
  const data = {}
  return request(
    'POST',
    `https://music.163.com/api/playlist/video/recent`,
    data,
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
