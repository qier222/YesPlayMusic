const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    id: query.id,
  }
  return request(`/api/voice/workbench/voice/detail`, data, createOption(query))
}
