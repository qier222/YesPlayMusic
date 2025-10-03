// 关注TA的人(粉丝)

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    userId: query.uid,
    time: '0',
    limit: query.limit || 30,
    offset: query.offset || 0,
    getcounts: 'true',
  }
  return request(
    `/api/user/getfolloweds/${query.uid}`,
    data,
    createOption(query),
  )
}
