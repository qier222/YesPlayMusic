// 视频链接

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    ids: '["' + query.id + '"]',
    resolution: query.res || 1080,
  }
  return request(`/api/cloudvideo/playurl`, data, createOption(query, 'weapi'))
}
