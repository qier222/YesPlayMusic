// MV详情

module.exports = (query, request) => {
  const data = {
    id: query.mvid,
  }
  return request('POST', `https://music.163.com/api/v1/mv/detail`, data, {
    crypto: 'weapi',
    cookie: query.cookie,
    proxy: query.proxy,
    realIP: query.realIP,
  })
}
