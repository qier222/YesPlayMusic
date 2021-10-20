// 公开隐私歌单

module.exports = (query, request) => {
  const data = {
    id: query.id,
    privacy: 0,
  }
  return request(
    'POST',
    `https://interface.music.163.com/eapi/playlist/update/privacy`,
    data,
    {
      crypto: 'eapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
      url: '/api/playlist/update/privacy',
    },
  )
}
