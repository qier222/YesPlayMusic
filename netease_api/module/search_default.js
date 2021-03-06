// 默认搜索关键词

module.exports = (query, request) => {
  return request(
    'POST',
    `https://interface3.music.163.com/eapi/search/defaultkeyword/get`,
    {},
    {
      crypto: 'eapi',
      cookie: query.cookie,
      proxy: query.proxy,
      url: '/api/search/defaultkeyword/get',
      realIP: query.realIP,
    },
  )
}
