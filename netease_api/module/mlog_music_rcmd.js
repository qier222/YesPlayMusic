// 歌曲相关视频

module.exports = (query, request) => {
  const data = {
    id: query.mvid || 0,
    type: 2,
    rcmdType: 20,
    limit: query.limit || 10,
    extInfo: JSON.stringify({ songId: query.songid }),
  }
  return request(
    'POST',
    `https://interface.music.163.com/eapi/mlog/rcmd/feed/list`,
    data,
    {
      crypto: 'eapi',
      cookie: query.cookie,
      proxy: query.proxy,
      url: '/api/mlog/rcmd/feed/list',
      realIP: query.realIP,
    },
  )
}
