// 操作记录

module.exports = (query, request) => {
  return request(
    'POST',
    `https://music.163.com/weapi/feedback/weblog`,
    query.data || {},
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
