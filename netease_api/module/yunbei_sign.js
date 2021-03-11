module.exports = (query, request) => {
  const data = {
    type: '0',
  }
  return request('POST', `https://music.163.com/api/point/dailyTask`, data, {
    crypto: 'weapi',
    cookie: query.cookie,
    proxy: query.proxy,
    realIP: query.realIP,
  })
}
