// 历史每日推荐歌曲

module.exports = (query, request) => {
  query.cookie.os = 'ios'
  const data = {}
  return request(
    'POST',
    `https://music.163.com/api/discovery/recommend/songs/history/recent`,
    data,
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
