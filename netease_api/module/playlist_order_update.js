// 编辑歌单顺序

module.exports = (query, request) => {
  query.cookie.os = 'pc'
  const data = {
    ids: query.ids,
  }
  return request(
    'POST',
    `https://music.163.com/api/playlist/order/update`,
    data,
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
