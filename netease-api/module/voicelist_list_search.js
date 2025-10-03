//声音搜索
const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    limit: query.limit || '200',
    offset: query.offset || '0',
    name: query.name || null,
    displayStatus: query.displayStatus || null,
    type: query.type || null,
    voiceFeeType: query.voiceFeeType || null,
    radioId: query.voiceListId,
  }
  return request('/api/voice/workbench/voice/list', data, createOption(query))
}
