// 音乐人数据概况

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {}
  return request(
    `/api/creator/musician/statistic/data/overview/get`,
    data,
    createOption(query, 'weapi'),
  )
}
