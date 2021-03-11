// 相似歌曲

module.exports = (query, request) => {
  const data = {
    songid: query.id,
    limit: query.limit || 50,
    offset: query.offset || 0,
  }
  return request(
    'POST',
    `https://music.163.com/weapi/v1/discovery/simiSong`,
    data,
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
