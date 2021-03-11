// 更新歌单名

module.exports = (query, request) => {
  const data = {
    id: query.id,
    name: query.name,
  }
  return request(
    'POST',
    `https://interface3.music.163.com/eapi/playlist/update/name`,
    data,
    {
      crypto: 'eapi',
      cookie: query.cookie,
      proxy: query.proxy,
      url: '/api/playlist/update/name',
      realIP: query.realIP,
    },
  )
}
