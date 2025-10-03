// 付费电台

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    limit: query.limit || 30,
    offset: query.offset || 0,
    _nmclfl: 1,
  }
  return request(
    `/api/djradio/home/paygift/list`,
    data,
    createOption(query, 'weapi'),
  )
}
