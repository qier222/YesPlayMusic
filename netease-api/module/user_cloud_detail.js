// 云盘数据详情

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const id = query.id.replace(/\s/g, '').split(',')
  const data = {
    songIds: id,
  }
  return request(`/api/v1/cloud/get/byids`, data, createOption(query, 'weapi'))
}
