// 云盘数据

module.exports = (query, request) => {
  const data = {
    limit: query.limit || 30,
    offset: query.offset || 0,
  }
  return request('POST', `https://music.163.com/api/v1/cloud/get`, data, {
    crypto: 'weapi',
    cookie: query.cookie,
    proxy: query.proxy,
    realIP: query.realIP,
  })
}
