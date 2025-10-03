// 曲风偏好

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {}
  return request(
    `/api/tag/my/preference/get`,
    data,
    createOption(query, 'weapi'),
  )
}
