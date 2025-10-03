const { cookieToJson } = require('../util/index')
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const uri = query.uri
  let data = {}
  try {
    data =
      typeof query.data === 'string' ? JSON.parse(query.data) : query.data || {}
    if (typeof data.cookie === 'string') {
      data.cookie = cookieToJson(data.cookie)
      query.cookie = data.cookie
    }
  } catch (e) {
    data = {}
  }

  const crypto = query.crypto || ''

  const res = request(uri, data, createOption(query, crypto))
  return res
}
