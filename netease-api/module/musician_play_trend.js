// 音乐人歌曲播放趋势

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    startTime: query.startTime,
    endTime: query.endTime,
  }
  return request(
    `/api/creator/musician/play/count/statistic/data/trend/get`,
    data,
    createOption(query, 'weapi'),
  )
}
