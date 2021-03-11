// 歌词

module.exports = (query, request) => {
  query.cookie.os = 'pc'
  const data = {
    id: query.id,
    lv: -1,
    kv: -1,
    tv: -1,
  }
  return request('POST', `https://music.163.com/api/song/lyric`, data, {
    crypto: 'api',
    cookie: query.cookie,
    proxy: query.proxy,
    realIP: query.realIP,
  })
}
