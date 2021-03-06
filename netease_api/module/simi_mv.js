// 相似MV

module.exports = (query, request) => {
  const data = {
    mvid: query.mvid,
  }
  return request('POST', `https://music.163.com/weapi/discovery/simiMV`, data, {
    crypto: 'weapi',
    cookie: query.cookie,
    proxy: query.proxy,
    realIP: query.realIP,
  })
}
