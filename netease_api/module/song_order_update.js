// 更新歌曲顺序

module.exports = (query, request) => {
  const data = {
    pid: query.pid,
    trackIds: query.ids,
    op: 'update',
  }

  return request(
    'POST',
    `http://interface.music.163.com/api/playlist/manipulate/tracks`,
    data,
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      url: '/api/playlist/desc/update',
      realIP: query.realIP,
    },
  )
}
