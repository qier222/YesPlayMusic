// 歌曲可用性

module.exports = (query, request) => {
  const data = {
    ids: '[' + parseInt(query.id) + ']',
    br: parseInt(query.br || 999000),
  }
  return request(
    'POST',
    `https://music.163.com/weapi/song/enhance/player/url`,
    data,
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  ).then((response) => {
    let playable = false
    if (response.body.code == 200) {
      if (response.body.data[0].code == 200) {
        playable = true
      }
    }
    if (playable) {
      response.body = { success: true, message: 'ok' }
      return response
    } else {
      response.status = 404
      response.body = { success: false, message: '亲爱的,暂无版权' }
      return Promise.reject(response)
    }
  })
}
