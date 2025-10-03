const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {}
  return request(
    `/api/usertool/task/list/all`,
    data,
    createOption(query, 'weapi'),
  )
}
