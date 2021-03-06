// 相关歌单

module.exports = (query, request) => {
  return request(
    'GET',
    `https://music.163.com/playlist?id=${query.id}`,
    {},
    {
      ua: 'pc',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  ).then((response) => {
    try {
      const pattern = /<div class="cver u-cover u-cover-3">[\s\S]*?<img src="([^"]+)">[\s\S]*?<a class="sname f-fs1 s-fc0" href="([^"]+)"[^>]*>([^<]+?)<\/a>[\s\S]*?<a class="nm nm f-thide s-fc3" href="([^"]+)"[^>]*>([^<]+?)<\/a>/g
      let result,
        playlists = []
      while ((result = pattern.exec(response.body)) != null) {
        playlists.push({
          creator: {
            userId: result[4].slice('/user/home?id='.length),
            nickname: result[5],
          },
          coverImgUrl: result[1].slice(0, -'?param=50y50'.length),
          name: result[3],
          id: result[2].slice('/playlist?id='.length),
        })
      }
      response.body = { code: 200, playlists: playlists }
      return response
    } catch (err) {
      response.status = 500
      response.body = { code: 500, msg: err.stack }
      return Promise.reject(response)
    }
  })
}
