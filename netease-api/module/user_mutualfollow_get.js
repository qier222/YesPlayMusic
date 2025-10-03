// 用户是否互相关注

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    friendid: query.uid,
  }
  return request(`/api/user/mutualfollow/get`, data, createOption(query))
}
