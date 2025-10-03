const mm = require('music-metadata')
const uploadPlugin = require('../plugins/songUpload')
const md5 = require('md5')
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
  query.songFile.name = Buffer.from(query.songFile.name, 'latin1').toString(
    'utf-8',
  )
  const filename = query.songFile.name
    .replace('.' + ext, '')
    .replace(/\s/g, '')
    .replace(/\./g, '_')
  const bitrate = 999000
  if (!query.songFile) {
    return Promise.reject({
      status: 500,
      body: {
        msg: '请上传音乐文件',
        code: 500,
      },
    })
  }
  if (!query.songFile.md5) {
    // 命令行上传没有md5和size信息,需要填充
    query.songFile.md5 = md5(query.songFile.data)
    query.songFile.size = query.songFile.data.byteLength
  }
  const res = await request(
    `/api/cloud/upload/check`,
    {
      bitrate: String(bitrate),
      ext: '',
      length: query.songFile.size,
      md5: query.songFile.md5,
      songId: '0',
      version: 1,
    },
    createOption(query),
  )
  let artist = ''
  let album = ''
  let songName = ''
  try {
    const metadata = await mm.parseBuffer(
      query.songFile.data,
      query.songFile.mimetype,
    )
    const info = metadata.common

    if (info.title) {
      songName = info.title
    }
    if (info.album) {
      album = info.album
    }
    if (info.artist) {
      artist = info.artist
    }
    // if (metadata.native.ID3v1) {
    //   metadata.native.ID3v1.forEach((item) => {
    //     // logger.info(item.id, item.value)
    //     if (item.id === 'title') {
    //       songName = item.value
    //     }
    //     if (item.id === 'artist') {
    //       artist = item.value
    //     }
    //     if (item.id === 'album') {
    //       album = item.value
    //     }
    //   })
    //   // logger.info({
    //   //   songName,
    //   //   album,
    //   //   songName,
    //   // })
    // }
    // logger.info({
    //   songName,
    //   album,
    //   songName,
    // })
  } catch (error) {
    logger.info(error)
  }
  const tokenRes = await request(
    `/api/nos/token/alloc`,
    {
      bucket: '',
      ext: ext,
      filename: filename,
      local: false,
      nos_product: 3,
      type: 'audio',
      md5: query.songFile.md5,
    },
    createOption(query),
  )

  if (res.body.needUpload) {
    const uploadInfo = await uploadPlugin(query, request)
    // logger.info('uploadInfo', uploadInfo.body.result.resourceId)
  }
  // logger.info(tokenRes.body.result)
  const res2 = await request(
    `/api/upload/cloud/info/v2`,
    {
      md5: query.songFile.md5,
      songid: res.body.songId,
      filename: query.songFile.name,
      song: songName || filename,
      album: album || '未知专辑',
      artist: artist || '未知艺术家',
      bitrate: String(bitrate),
      resourceId: tokenRes.body.result.resourceId,
    },
    createOption(query),
  )
  // logger.info({ res2, privateCloud: res2.body.privateCloud })
  // logger.info(res.body.songId, 'songid')
  const res3 = await request(
    `/api/cloud/pub/v2`,
    {
      songid: res2.body.songId,
    },
    createOption(query),
  )
  // logger.info({ res3 })
  return {
    status: 200,
    body: {
      ...res.body,
      ...res3.body,
      // ...uploadInfo,
    },
    cookie: res.cookie,
  }
}
