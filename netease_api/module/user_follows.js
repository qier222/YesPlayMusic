// TA关注的人(关注)

module.exports = (query, request) => {
  const data = {
    offset: query.offset || 0,
    limit: query.limit || 30,
    order: true,
  }
  return request(
    'POST',
    `https://music.163.com/weapi/user/getfollows/${query.uid}`,
    data,
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
