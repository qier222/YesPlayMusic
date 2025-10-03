// 精品歌单

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    cat: query.cat || '全部', // 全部,华语,欧美,韩语,日语,粤语,小语种,运动,ACG,影视原声,流行,摇滚,后摇,古风,民谣,轻音乐,电子,器乐,说唱,古典,爵士
    limit: query.limit || 50,
    lasttime: query.before || 0, // 歌单updateTime
    total: true,
  }
  return request(
    `/api/playlist/highquality/list`,
    data,
    createOption(query, 'weapi'),
  )
}
