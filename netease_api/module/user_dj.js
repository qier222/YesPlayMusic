// 用户电台节目

module.exports = (query, request) => {
  const data = {
    limit: query.limit || 30,
    offset: query.offset || 0,
  }
  return request(
    'POST',
    `https://music.163.com/weapi/dj/program/${query.uid}`,
    data,
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
