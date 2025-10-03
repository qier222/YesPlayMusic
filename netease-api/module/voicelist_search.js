const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    fee: '-1',
    limit: query.limit || '200',
    offset: query.offset || '0',
    podcastName: query.podcastName || '',
  }
  return request(
    `/api/voice/workbench/voicelist/search`,
    data,
    createOption(query),
  )
}
