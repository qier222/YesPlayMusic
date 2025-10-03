// 云村星评馆 - 简要评论列表
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    cursor: JSON.stringify({
      offset: 0,
      blockCodeOrderList: ['HOMEPAGE_BLOCK_NEW_HOT_COMMENT'],
      refresh: true,
    }),
  }
  return request(`/api/homepage/block/page`, data, createOption(query))
}
