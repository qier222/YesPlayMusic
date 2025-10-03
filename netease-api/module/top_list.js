// 排行榜
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  if (query.idx) {
    return Promise.resolve({
      status: 500,
      body: {
        code: 500,
        msg: '不支持此方式调用,只支持id调用',
      },
    })
  }

  const data = {
    id: query.id,
    n: '500',
    s: '0',
  }
  return request(`/api/playlist/v4/detail`, data, createOption(query))
}
