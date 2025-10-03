// 获取 VIP 信息

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  return request(
    `/api/music-vip-membership/front/vip/info`,
    {
      userId: query.uid || '',
    },
    createOption(query, 'weapi'),
  )
}
