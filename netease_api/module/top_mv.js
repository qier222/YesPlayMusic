// MV排行榜

module.exports = (query, request) => {
  const data = {
    area: query.area || '',
    limit: query.limit || 30,
    offset: query.offset || 0,
    total: true,
  }
  return request('POST', `https://music.163.com/weapi/mv/toplist`, data, {
    crypto: 'weapi',
    cookie: query.cookie,
    proxy: query.proxy,
    realIP: query.realIP,
  })
}
