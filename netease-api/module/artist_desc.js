// 歌手介绍

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    id: query.id,
  }
  return request(`/api/artist/introduction`, data, createOption(query, 'weapi'))
}
