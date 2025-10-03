// 将mlog id转为video id

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    mlogId: query.id,
  }
  return request(
    `/api/mlog/video/convert/id`,
    data,
    createOption(query, 'weapi'),
  )
}
