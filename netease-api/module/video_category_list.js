// 视频分类列表

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    offset: query.offset || 0,
    total: 'true',
    limit: query.limit || 99,
  }
  return request(
    `/api/cloudvideo/category/list`,
    data,
    createOption(query, 'weapi'),
  )
}
