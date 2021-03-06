// 通知

module.exports = (query, request) => {
  const data = {
    limit: query.limit || 30,
    time: query.lasttime || -1,
  }
  return request('POST', `https://music.163.com/api/msg/notices`, data, {
    crypto: 'weapi',
    cookie: query.cookie,
    proxy: query.proxy,
    realIP: query.realIP,
  })
}
