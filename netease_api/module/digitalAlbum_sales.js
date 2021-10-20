// 数字专辑销量

module.exports = (query, request) => {
  const data = {
    albumIds: query.ids,
  }
  return request(
    'POST',
    `https://music.163.com/weapi/vipmall/albumproduct/album/query/sales`,
    data,
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
