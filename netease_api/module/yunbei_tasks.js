module.exports = (query, request) => {
  const data = {}
  return request(
    'POST',
    `https://music.163.com/api/usertool/task/list/all`,
    data,
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
