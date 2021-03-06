// 红心与取消红心歌曲

module.exports = (query, request) => {
  query.cookie.os = 'pc'
  query.cookie.appver = '2.7.1.198277'
  query.like = query.like == 'false' ? false : true
  const data = {
    alg: 'itembased',
    trackId: query.id,
    like: query.like,
    time: '3',
  }
  return request('POST', `https://music.163.com/api/radio/like`, data, {
    crypto: 'weapi',
    cookie: query.cookie,
    proxy: query.proxy,
    realIP: query.realIP,
  })
}
