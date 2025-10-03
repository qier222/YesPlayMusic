// 用户动态

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    getcounts: true,
    time: query.lasttime || -1,
    limit: query.limit || 30,
    total: false,
  }
  return request(`/api/event/get/${query.uid}`, data, createOption(query))
}
