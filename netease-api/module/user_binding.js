const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {}
  return request(
    `/api/v1/user/bindings/${query.uid}`,
    data,
    createOption(query, 'weapi'),
  )
}
