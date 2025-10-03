const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    nicknames: query.nicknames,
  }
  return request(`/api/user/getUserIds`, data, createOption(query, 'weapi'))
}
