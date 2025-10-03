const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    limit: query.limit || '200', // 每页数量
    offset: query.offset || '0', // 偏移量
    radioId: query.radioId || null, // 电台id
    programId: query.programId || '0', // 节目id
    position: query.position || '1', // 排序编号
  }
  return request(
    `/api/voice/workbench/radio/program/trans`,
    data,
    createOption(query),
  )
}
