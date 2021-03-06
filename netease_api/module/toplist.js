// 所有榜单介绍

module.exports = (query, request) => {
  return request(
    'POST',
    `https://music.163.com/api/toplist`,
    {},
    {
      crypto: 'api',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
