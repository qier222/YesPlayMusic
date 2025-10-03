// 听歌打卡

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    logs: JSON.stringify([
      {
        action: 'play',
        json: {
          download: 0,
          end: 'playend',
          id: query.id,
          sourceId: query.sourceid,
          time: query.time,
          type: 'song',
          wifi: 0,
          source: 'list',
          mainsite: 1,
          content: '',
        },
      },
    ]),
  }

  return request(`/api/feedback/weblog`, data, createOption(query, 'weapi'))
}
