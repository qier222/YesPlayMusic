module.exports = (query, request) => {
  const data = {
    limit: query.limit || 10,
    offset: query.offset || 0,
  }
  return request(
    'POST',
    `https://music.163.com/store/api/point/expense`,
    data,
    {
      crypto: 'api',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
