// 全部歌单分类

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  return request(`/api/playlist/catalogue`, {}, createOption(query, 'eapi'))
}
