// 歌单分类列表

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    cat: query.cat || '全部',
    limit: query.limit || 24,
    newStyle: true,
  }
  return request(`/api/playlist/category/list`, data, createOption(query))
}
