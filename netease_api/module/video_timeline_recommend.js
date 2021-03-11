// 推荐视频

module.exports = (query, request) => {
  const data = {
    offset: query.offset || 0,
    filterLives: '[]',
    withProgramInfo: 'true',
    needUrl: '1',
    resolution: '480',
  }
  return request('POST', `https://music.163.com/api/videotimeline/get`, data, {
    crypto: 'weapi',
    cookie: query.cookie,
    proxy: query.proxy,
    realIP: query.realIP,
  })
}
