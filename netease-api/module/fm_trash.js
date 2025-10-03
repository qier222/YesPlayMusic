// 垃圾桶

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    songId: query.id,
    alg: 'RT',
    time: query.time || 25,
  }
  return request(`/api/radio/trash/add`, data, createOption(query, 'weapi'))
}
