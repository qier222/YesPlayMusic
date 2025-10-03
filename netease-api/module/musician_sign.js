// 音乐人签到

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {}
  return request(`/api/creator/user/access`, data, createOption(query, 'weapi'))
}
