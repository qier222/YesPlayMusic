// 获取 VIP 信息

module.exports = (query, request) => {
  return request(
    'POST',
    `https://music.163.com/weapi/music-vip-membership/front/vip/info`,
    {},
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
