const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    programId: query.id,
  }
  return request(`/api/voice/lyric/get`, data, createOption(query))
}
