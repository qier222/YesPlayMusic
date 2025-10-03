// mv简要百科信息
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    mvId: query.id,
  }
  return request(`/api/rep/ugc/mv/get`, data, createOption(query))
}
