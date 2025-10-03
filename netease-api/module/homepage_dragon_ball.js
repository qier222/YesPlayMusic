// 首页-发现 dragon ball
// 这个接口为移动端接口，首页-发现页（每日推荐、歌单、排行榜 那些入口）
// 数据结构可以参考 https://github.com/hcanyz/flutter-netease-music-api/blob/master/lib/src/api/uncategorized/bean.dart#L290 HomeDragonBallWrap
// !需要登录或者游客登录，非登录返回 []
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {}

  return request(`/api/homepage/dragon/ball/static`, data, createOption(query))
}
