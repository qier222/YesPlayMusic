// 关注TA的人(粉丝)

module.exports = (query, request) => {
  const data = {
    userId: query.uid,
    time: '0',
    limit: query.limit || 30,
    offset: query.offset || 0,
    getcounts: 'true',
  }
  return request(
    'POST',
    `https://music.163.com/eapi/user/getfolloweds/${query.uid}`,
    data,
    {
      crypto: 'eapi',
      cookie: query.cookie,
      proxy: query.proxy,
      url: '/api/user/getfolloweds',
      realIP: query.realIP,
    },
  )
}
