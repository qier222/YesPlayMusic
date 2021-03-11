// 听歌打卡

module.exports = (query, request) => {
  const data = {
    logs: JSON.stringify([
      {
        action: 'play',
        json: {
          download: 0,
          end: 'playend',
          id: query.id,
          sourceId: query.sourceid,
          time: query.time,
          type: 'song',
          wifi: 0,
        },
      },
    ]),
  }

  return request('POST', `https://music.163.com/weapi/feedback/weblog`, data, {
    crypto: 'weapi',
    cookie: query.cookie,
    proxy: query.proxy,
    realIP: query.realIP,
  })
}
