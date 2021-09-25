// 领取会员成长值

module.exports = (query, request) => {
  const data = {
    taskIds: query.ids,
  }
  return request(
    'POST',
    `https://music.163.com/weapi/vipnewcenter/app/level/task/reward/get`,
    data,
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
