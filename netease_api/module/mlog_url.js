// mlog链接

module.exports = (query, request) => {
  const data = {
    id: query.id,
    resolution: query.res || 1080,
    type: 1,
  }
  return request('POST', `https://music.163.com/weapi/mlog/detail/v1`, data, {
    crypto: 'weapi',
    cookie: query.cookie,
    proxy: query.proxy,
    realIP: query.realIP,
  })
}
