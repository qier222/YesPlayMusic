// 获取客户端歌曲下载链接

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    id: query.id,
    br: parseInt(query.br || 999000),
  }
  return request(`/api/song/enhance/download/url`, data, createOption(query))
}
