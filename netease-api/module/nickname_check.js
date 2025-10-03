const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    nickname: query.nickname,
  }
  return request(`/api/nickname/duplicated`, data, createOption(query, 'weapi'))
}
