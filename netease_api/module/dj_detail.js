// 电台详情

module.exports = (query, request) => {
  const data = {
    id: query.rid,
  }
  return request('POST', `https://music.163.com/api/djradio/v2/get`, data, {
    crypto: 'weapi',
    cookie: query.cookie,
    proxy: query.proxy,
    realIP: query.realIP,
  })
}
