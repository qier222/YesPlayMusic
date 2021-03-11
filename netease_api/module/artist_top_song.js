// 歌手热门 50 首歌曲
module.exports = (query, request) => {
  const data = {
    id: query.id,
  }
  return request('POST', `https://music.163.com/api/artist/top/song`, data, {
    crypto: 'weapi',
    cookie: query.cookie,
    proxy: query.proxy,
    realIP: query.realIP,
  })
}
