// 歌手专辑列表

module.exports = (query, request) => {
  const data = {
    limit: query.limit || 30,
    offset: query.offset || 0,
    total: true,
  }
  return request(
    'POST',
    `https://music.163.com/weapi/artist/albums/${query.id}`,
    data,
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
