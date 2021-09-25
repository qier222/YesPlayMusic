// 将mlog id转为video id

module.exports = (query, request) => {
  const data = {
    mlogId: query.id,
  }
  return request(
    'POST',
    `https://music.163.com/weapi/mlog/video/convert/id`,
    data,
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
