// 推荐新歌

module.exports = (query, request) => {
  query.cookie.os = 'pc'
  const data = {
    type: 'recommend',
    limit: query.limit || 10,
    areaId: query.areaId || 0,
  }
  return request(
    'POST',
    `https://music.163.com/api/personalized/newsong`,
    data,
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
