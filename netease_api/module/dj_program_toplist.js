// 电台节目榜

module.exports = (query, request) => {
  const data = {
    limit: query.limit || 100,
    offset: query.offset || 0,
  }
  return request('POST', `https://music.163.com/api/program/toplist/v1`, data, {
    crypto: 'weapi',
    cookie: query.cookie,
    proxy: query.proxy,
    realIP: query.realIP,
  })
}
