// 会员本月下载歌曲记录

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    limit: query.limit || '20',
    offset: query.offset || '0',
    total: 'true',
  }
  return request(`/api/member/song/monthdownlist`, data, createOption(query))
}
