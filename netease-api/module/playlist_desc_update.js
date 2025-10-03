// 更新歌单描述

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    id: query.id,
    desc: query.desc,
  }
  return request(`/api/playlist/desc/update`, data, createOption(query))
}
