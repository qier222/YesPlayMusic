// 全部MV

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    tags: JSON.stringify({
      地区: query.area || '全部',
      类型: query.type || '全部',
      排序: query.order || '上升最快',
    }),
    offset: query.offset || 0,
    total: 'true',
    limit: query.limit || 30,
  }
  return request(`/api/mv/all`, data, createOption(query))
}
