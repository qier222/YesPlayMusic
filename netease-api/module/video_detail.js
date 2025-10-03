// 视频详情

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    id: query.id,
  }
  return request(
    `/api/cloudvideo/v1/video/detail`,
    data,
    createOption(query, 'weapi'),
  )
}
