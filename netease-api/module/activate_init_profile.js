// 初始化名字

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    nickname: query.nickname,
  }
  return request(`/api/activate/initProfile`, data, createOption(query))
}
