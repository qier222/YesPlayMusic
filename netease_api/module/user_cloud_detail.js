// 云盘数据详情

module.exports = (query, request) => {
  const id = query.id.replace(/\s/g, '').split(',')
  const data = {
    songIds: id,
  }
  return request(
    'POST',
    `https://music.163.com/weapi/v1/cloud/get/byids`,
    data,
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
