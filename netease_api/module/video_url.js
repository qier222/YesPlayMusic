// 视频链接

module.exports = (query, request) => {
  const data = {
    ids: '["' + query.id + '"]',
    resolution: query.res || 1080,
  }
  return request(
    'POST',
    `https://music.163.com/weapi/cloudvideo/playurl`,
    data,
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
