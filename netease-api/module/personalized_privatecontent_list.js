// 独家放送列表

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    offset: query.offset || 0,
    total: 'true',
    limit: query.limit || 60,
  }
  return request(
    `/api/v2/privatecontent/list`,
    data,
    createOption(query, 'weapi'),
  )
}
