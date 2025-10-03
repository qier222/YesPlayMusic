// 歌曲链接 - v1
// 此版本不再采用 br 作为音质区分的标准
// 而是采用 standard, exhigh, lossless, hires, jyeffect(高清环绕声), sky(沉浸环绕声), jymaster(超清母带) 进行音质判断
// 当unblock为true时, 会尝试使用unblockneteasemusic进行解锁, 同时音质设置不会生效, 但仍然为必须传入参数

const logger = require('../util/logger.js')
const createOption = require('../util/option.js')
module.exports = async (query, request) => {
  const match = require('@unblockneteasemusic/server')
  const source = ['pyncmd', 'bodian', 'kuwo', 'qq', 'migu', 'kugou']
  require('dotenv').config()
  const data = {
    ids: '[' + query.id + ']',
    level: query.level,
    encodeType: 'flac',
  }
  if (query.unblock === 'true') {
    try {
      const result = await match(query.id, source)
      logger.info('开始解灰', query.id, result)
      if (result.url.includes('kuwo')) {
        const useProxy = process.env.ENABLE_PROXY || 'false'
        var proxyUrl = useProxy === 'true' ? process.env.PROXY_URL + result.url : result.url
      }
      let url = Array.isArray(result) ? (result[0]?.url || result[0]) : (result.url || result)
      if (url) {
        return {
          status: 200,
          body: {
            code: 200,
            data: [
              {
                id: Number(query.id),
                url,
                type: 'flac',
                level: query.level,
                freeTrialInfo: 'null',
                fee: 0,
                proxyUrl: proxyUrl || '',
              },
            ],
          },
          cookie: [],
        }
      }
    } catch (e) {
      console.error('Error in unblockneteasemusic:', e)
    }
  }
  if (data.level == 'sky') {
    data.immerseType = 'c51'
  }
  return request(`/api/song/enhance/player/url/v1`, data, createOption(query))
}
