module.exports = (query, request) => {
  const data = {}
  return request('POST', `https://music.163.com/api/v1/user/info`, data, {
    crypto: 'weapi',
    cookie: query.cookie,
    proxy: query.proxy,
    realIP: query.realIP,
  })
}
