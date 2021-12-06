// 获取客户端歌曲下载链接

module.exports = (query, request) => {
  const data = {
    id: query.id,
    br: parseInt(query.br || 999000),
  }
  return request(
    'POST',
    `https://interface.music.163.com/eapi/song/enhance/download/url`,
    data,
    {
      crypto: 'eapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
      url: '/api/song/enhance/download/url',
    },
  )
}
