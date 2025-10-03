// 曲风详情

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    tagId: query.tagId,
  }
  return request(`/api/style-tag/home/head`, data, createOption(query, 'weapi'))
}
