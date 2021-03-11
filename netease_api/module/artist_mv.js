// 歌手相关MV

module.exports = (query, request) => {
  const data = {
    artistId: query.id,
    limit: query.limit,
    offset: query.offset,
    total: true,
  }
  return request('POST', `https://music.163.com/weapi/artist/mvs`, data, {
    crypto: 'weapi',
    cookie: query.cookie,
    proxy: query.proxy,
    realIP: query.realIP,
  })
}
