// 专辑动态信息
module.exports = (query, request) => {
  const data = {
    id: query.id,
  }
  return request(
    'POST',
    `https://music.163.com/api/album/detail/dynamic`,
    data,
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
