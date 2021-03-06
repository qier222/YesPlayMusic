// 精品歌单

module.exports = (query, request) => {
  const data = {
    cat: query.cat || '全部', // 全部,华语,欧美,韩语,日语,粤语,小语种,运动,ACG,影视原声,流行,摇滚,后摇,古风,民谣,轻音乐,电子,器乐,说唱,古典,爵士
    limit: query.limit || 50,
    lasttime: query.before || 0, // 歌单updateTime
    total: true,
  }
  return request(
    'POST',
    `https://music.163.com/api/playlist/highquality/list`,
    data,
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
