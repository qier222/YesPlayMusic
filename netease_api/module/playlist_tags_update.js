// 更新歌单标签

module.exports = (query, request) => {
  const data = {
    id: query.id,
    tags: query.tags,
  }
  return request(
    'POST',
    `https://interface3.music.163.com/eapi/playlist/tags/update`,
    data,
    {
      crypto: 'eapi',
      cookie: query.cookie,
      proxy: query.proxy,
      url: '/api/playlist/tags/update',
      realIP: query.realIP,
    },
  )
}
