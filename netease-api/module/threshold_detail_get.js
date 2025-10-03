// 获取达人达标信息
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {}
  return request(
    `/api/influencer/web/apply/threshold/detail/get`,
    data,
    createOption(query),
  )
}
