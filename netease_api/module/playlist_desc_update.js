// 更新歌单描述

module.exports = (query, request) => {
  const data = {
    id: query.id,
    desc: query.desc,
  }
  return request(
    'POST',
    `https://interface3.music.163.com/eapi/playlist/desc/update`,
    data,
    {
      crypto: 'eapi',
      cookie: query.cookie,
      proxy: query.proxy,
      url: '/api/playlist/desc/update',
      realIP: query.realIP,
    },
  )
}
