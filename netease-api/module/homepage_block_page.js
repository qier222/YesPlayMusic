// 首页-发现 block page
// 这个接口为移动端接口，首页-发现页，数据结构可以参考 https://github.com/hcanyz/flutter-netease-music-api/blob/master/lib/src/api/uncategorized/bean.dart#L259 HomeBlockPageWrap
// query.refresh 是否刷新数据
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = { refresh: query.refresh || false, cursor: query.cursor }
  return request(`/api/homepage/block/page`, data, createOption(query, 'weapi'))
}
