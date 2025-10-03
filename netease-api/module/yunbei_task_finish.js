const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    userTaskId: query.userTaskId,
    depositCode: query.depositCode || '0',
  }
  return request(
    `/api/usertool/task/point/receive`,
    data,
    createOption(query, 'weapi'),
  )
}
