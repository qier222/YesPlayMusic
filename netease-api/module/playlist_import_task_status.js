// 歌单导入 - 任务状态
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  return request(
    `/api/playlist/import/task/status/v2`,
    {
      taskIds: JSON.stringify([query.id]),
    },
    createOption(query),
  )
}
