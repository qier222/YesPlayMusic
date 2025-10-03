// TA关注的人(关注)

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    offset: query.offset || 0,
    limit: query.limit || 30,
    order: true,
  }
  return request(
    `/api/user/getfollows/${query.uid}`,
    data,
    createOption(query, 'weapi'),
  )
}
