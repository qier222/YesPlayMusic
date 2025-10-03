// 电台个性推荐

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  return request(
    `/api/djradio/personalize/rcmd`,
    {
      limit: query.limit || 6,
    },
    createOption(query, 'weapi'),
  )
}
