// 推荐视频

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    offset: query.offset || 0,
    filterLives: '[]',
    withProgramInfo: 'true',
    needUrl: '1',
    resolution: '480',
  }
  return request(`/api/videotimeline/get`, data, createOption(query, 'weapi'))
}
