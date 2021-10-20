// 领取云豆

module.exports = (query, request) => {
  const data = {
    userMissionId: query.id,
    period: query.period,
  }
  return request(
    'POST',
    `https://music.163.com/weapi/nmusician/workbench/mission/reward/obtain/new`,
    data,
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
