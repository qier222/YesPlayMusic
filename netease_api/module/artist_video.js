// 歌手相关视频

module.exports = (query, request) => {
  const data = {
    artistId: query.id,
    page: JSON.stringify({
      size: query.size || 10,
      cursor: query.cursor || 0,
    }),
    tab: 0,
    order: query.order || 0,
  }
  return request(
    'POST',
    `https://music.163.com/weapi/mlog/artist/video`,
    data,
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
