const { default: axios } = require('axios')
const createOption = require('../util/option.js')
const logger = require('../util/logger.js')
module.exports = async (query, request) => {
  let ext = 'mp3'
  // if (query.songFile.name.indexOf('flac') > -1) {
  //   ext = 'flac'
  // }
  if (query.songFile.name.includes('.')) {
    ext = query.songFile.name.split('.').pop()
  }
  const filename = query.songFile.name
    .replace('.' + ext, '')
    .replace(/\s/g, '')
    .replace(/\./g, '_')
  const bucket = 'jd-musicrep-privatecloud-audio-public'
  //   获取key和token
  const tokenRes = await request(
    `/api/nos/token/alloc`,
    {
      bucket: bucket,
      ext: ext,
      filename: filename,
      local: false,
      nos_product: 3,
      type: 'audio',
      md5: query.songFile.md5,
    },
    createOption(query, 'weapi'),
  )

  // 上传
  const objectKey = tokenRes.body.result.objectKey.replace('/', '%2F')
  try {
    const lbs = (
      await axios({
        method: 'get',
        url: `https://wanproxy.127.net/lbs?version=1.0&bucketname=${bucket}`,
      })
    ).data
    await axios({
      method: 'post',
      url: `${lbs.upload[0]}/${bucket}/${objectKey}?offset=0&complete=true&version=1.0`,
      headers: {
        'x-nos-token': tokenRes.body.result.token,
        'Content-MD5': query.songFile.md5,
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(query.songFile.size),
      },
      data: query.songFile.data,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    })
  } catch (error) {
    logger.info('error', error.response)
    throw error.response
  }
  return {
    ...tokenRes,
  }
}
