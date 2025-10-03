// 用户电台节目

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    limit: query.limit || 30,
    offset: query.offset || 0,
  }
  return request(
    `/api/dj/program/${query.uid}`,
    data,
    createOption(query, 'weapi'),
  )
}
