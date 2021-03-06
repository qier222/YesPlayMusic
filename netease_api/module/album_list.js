// 数字专辑-新碟上架
module.exports = (query, request) => {
  const data = {
    limit: query.limit || 30,
    offset: query.offset || 0,
    total: true,
    area: query.area || 'ALL', //ALL:全部,ZH:华语,EA:欧美,KR:韩国,JP:日本
    type: query.type,
  }
  return request(
    'POST',
    `https://music.163.com/weapi/vipmall/albumproduct/list`,
    data,
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
