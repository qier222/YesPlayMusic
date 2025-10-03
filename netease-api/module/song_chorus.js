// 副歌时间
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  return request(
    `/api/song/chorus`,
    {
      ids: JSON.stringify([query.id]),
    },
    createOption(query),
  )
}
