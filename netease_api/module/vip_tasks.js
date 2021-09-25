// 会员任务

module.exports = (query, request) => {
  const data = {}
  return request(
    'POST',
    `https://music.163.com/weapi/vipnewcenter/app/level/task/list`,
    data,
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
