// 电台24小时主播榜

module.exports = (query, request) => {
  const data = {
    limit: query.limit || 100,
    // 不支持 offset
  }
  return request('POST', `https://music.163.com/api/dj/toplist/hours`, data, {
    crypto: 'weapi',
    cookie: query.cookie,
    proxy: query.proxy,
    realIP: query.realIP,
  })
}
