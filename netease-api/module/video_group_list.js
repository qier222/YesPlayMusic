// 视频标签列表

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {}
  return request(
    `/api/cloudvideo/group/list`,
    data,
    createOption(query, 'weapi'),
  )
}
