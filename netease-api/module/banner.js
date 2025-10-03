// 首页轮播图
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const type =
    {
      0: 'pc',
      1: 'android',
      2: 'iphone',
      3: 'ipad',
    }[query.type || 0] || 'pc'
  return request(
    `/api/v2/banner/get`,
    { clientType: type },
    createOption(query),
  )
}
