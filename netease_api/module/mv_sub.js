// 收藏与取消收藏MV

module.exports = (query, request) => {
  query.t = query.t == 1 ? 'sub' : 'unsub'
  const data = {
    mvId: query.mvid,
    mvIds: '["' + query.mvid + '"]',
  }
  return request('POST', `https://music.163.com/weapi/mv/${query.t}`, data, {
    crypto: 'weapi',
    cookie: query.cookie,
    proxy: query.proxy,
    realIP: query.realIP,
  })
}
