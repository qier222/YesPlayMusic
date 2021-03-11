// 关注歌手列表

module.exports = (query, request) => {
  const data = {
    limit: query.limit || 25,
    offset: query.offset || 0,
    total: true,
  }
  return request('POST', `https://music.163.com/weapi/artist/sublist`, data, {
    crypto: 'weapi',
    cookie: query.cookie,
    proxy: query.proxy,
    realIP: query.realIP,
  })
}
