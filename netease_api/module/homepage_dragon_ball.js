// 首页-发现 dragon ball
// 这个接口为移动端接口，首页-发现页（每日推荐、歌单、排行榜 那些入口）
// 数据结构可以参考 https://github.com/hcanyz/flutter-netease-music-api/blob/master/lib/src/api/uncategorized/bean.dart#L290 HomeDragonBallWrap
// !需要登录或者匿名登录，非登录返回 []
const config = require('../util/config.json')
module.exports = (query, request) => {
  if (typeof query.cookie === 'string') {
    query.cookie = cookieToJson(query.cookie)
  }
  if (!('MUSIC_U' in query.cookie))
    query.cookie.MUSIC_A = config.anonymous_token
  const data = {}
  query.cookie.os = 'ios'
  query.cookie.appver = '8.1.20'
  return request(
    'POST',
    `https://music.163.com/eapi/homepage/dragon/ball/static`,
    data,
    {
      crypto: 'eapi',
      cookie: query.cookie,
      proxy: query.proxy,
      url: '/api/homepage/dragon/ball/static',
      realIP: query.realIP,
    },
  )
}
