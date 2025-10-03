// 相关视频

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    id: query.id,
    type: /^\d+$/.test(query.id) ? 0 : 1,
  }
  return request(
    `/api/cloudvideo/v1/allvideo/rcmd`,
    data,
    createOption(query, 'weapi'),
  )
}
