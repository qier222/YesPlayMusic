// 类别热门电台

module.exports = (query, request) => {
  const data = {}
  return request('POST', `https://music.163.com/weapi/user/level`, data, {
    crypto: 'weapi',
    cookie: query.cookie,
    proxy: query.proxy,
    realIP: query.realIP,
  })
}
