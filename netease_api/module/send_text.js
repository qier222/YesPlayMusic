// 私信

module.exports = (query, request) => {
  query.cookie.os = 'pc'
  const data = {
    type: 'text',
    msg: query.msg,
    userIds: '[' + query.user_ids + ']',
  }
  return request('POST', `https://music.163.com/weapi/msg/private/send`, data, {
    crypto: 'weapi',
    cookie: query.cookie,
    proxy: query.proxy,
    realIP: query.realIP,
  })
}
