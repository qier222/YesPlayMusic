const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {}
  return request(
    `/api/usertool/task/todo/query`,
    data,
    createOption(query, 'weapi'),
  )
}
