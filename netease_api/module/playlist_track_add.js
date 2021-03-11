module.exports = async (query, request) => {
  query.cookie.os = 'pc'
  query.ids = query.ids || ''
  const data = {
    id: query.pid,
    tracks: JSON.stringify(
      query.ids.split(',').map((item) => {
        return { type: 3, id: item }
      }),
    ),
  }
  console.log(data)

  return request('POST', `https://music.163.com/api/playlist/track/add`, data, {
    crypto: 'weapi',
    cookie: query.cookie,
    proxy: query.proxy,
    realIP: query.realIP,
  })
}
