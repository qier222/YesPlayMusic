module.exports = (query, request) => {
  query.cookie.os = 'pc'
  const data = {
    id: query.id,
    private_cloud: 'true',
    work_type: 1,
    order: query.order || 'hot', //hot,time
    offset: query.offset || 0,
    limit: query.limit || 100,
  }
  return request('POST', `https://music.163.com/api/v1/artist/songs`, data, {
    crypto: 'weapi',
    cookie: query.cookie,
    proxy: query.proxy,
    realIP: query.realIP,
  })
}
