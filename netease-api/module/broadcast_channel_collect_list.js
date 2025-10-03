// 广播电台 - 我的收藏

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    contentType: 'BROADCAST',
    limit: query.limit || '99999',
    timeReverseOrder: 'true',
    startDate: '4762584922000',
  }
  return request(`/api/content/channel/collect/list`, data, createOption(query))
}
