// 独家放送列表

module.exports = (query, request) => {
  const data = {
    offset: query.offset || 0,
    total: 'true',
    limit: query.limit || 60,
  }
  return request(
    'POST',
    `https://music.163.com/api/v2/privatecontent/list`,
    data,
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
