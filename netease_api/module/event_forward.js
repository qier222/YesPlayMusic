// 转发动态

module.exports = (query, request) => {
  query.cookie.os = 'pc'
  const data = {
    forwards: query.forwards,
    id: query.evId,
    eventUserId: query.uid,
  }
  return request('POST', `https://music.163.com/weapi/event/forward`, data, {
    crypto: 'weapi',
    cookie: query.cookie,
    proxy: query.proxy,
    realIP: query.realIP,
  })
}
