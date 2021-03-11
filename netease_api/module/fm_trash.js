// 垃圾桶

module.exports = (query, request) => {
  const data = {
    songId: query.id,
  }
  return request(
    'POST',
    `https://music.163.com/weapi/radio/trash/add?alg=RT&songId=${
      query.id
    }&time=${query.time || 25}`,
    data,
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
