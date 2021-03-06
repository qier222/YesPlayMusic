// 历史每日推荐歌曲详情

module.exports = (query, request) => {
  query.cookie.os = 'ios'
  const data = {
    date: query.date || '',
  }
  return request(
    'POST',
    `https://music.163.com/api/discovery/recommend/songs/history/detail`,
    data,
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
