// 私信歌曲

module.exports = (query, request) => {
  query.cookie.os = 'ios'
  query.cookie.appver = '8.1.20'
  const data = {
    id: query.id,
    msg: query.msg || '',
    type: 'song',
    userIds: '[' + query.user_ids + ']',
  }
  return request('POST', `https://music.163.com/api/msg/private/send`, data, {
    crypto: 'api',
    cookie: query.cookie,
    proxy: query.proxy,
    realIP: query.realIP,
  })
}
