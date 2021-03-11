const mm = require('music-metadata')
const uploadPlugin = require('../plugins/songUpload')
const md5 = require('md5')
module.exports = async (query, request) => {
  query.cookie.os = 'pc'
  query.cookie.appver = '2.7.1.198277'
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
    'POST',
    `https://interface.music.163.com/api/cloud/upload/check`,
    {
      bitrate: String(bitrate),
      ext: '',
      length: query.songFile.size,
      md5: query.songFile.md5,
      songId: '0',
      version: 1,
    },
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
  let artist = ''
  let album = ''
  let songName = ''
  try {
    const metadata = await mm.parseBuffer(query.songFile.data, 'audio/mpeg')
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
    //     // console.log(item.id, item.value)
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
    //   // console.log({
    //   //   songName,
    //   //   album,
    //   //   songName,
    //   // })
    // }
    // console.log({
    //   songName,
    //   album,
    //   songName,
    // })
  } catch (error) {
    console.log(error)
  }
  const tokenRes = await request(
    'POST',
    `https://music.163.com/weapi/nos/token/alloc`,
    {
      bucket: '',
      ext: 'mp3',
      filename: query.songFile.name.replace('.mp3', ''),
      local: false,
      nos_product: 3,
      type: 'audio',
      md5: query.songFile.md5,
    },
    { crypto: 'weapi', cookie: query.cookie, proxy: query.proxy },
  )

  if (res.body.needUpload) {
    const uploadInfo = await uploadPlugin(query, request)
    // console.log('uploadInfo', uploadInfo.body.result.resourceId)
  }
  // console.log(tokenRes.body.result)
  const res2 = await request(
    'POST',
    `https://music.163.com/api/upload/cloud/info/v2`,
    {
      md5: query.songFile.md5,
      songid: res.body.songId,
      filename: query.songFile.name,
      song: songName || query.songFile.name.replace('.mp3', ''),
      album: album || '未知专辑',
      artist: artist || '未知艺术家',
      bitrate: String(bitrate),
      resourceId: tokenRes.body.result.resourceId,
    },
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
  // console.log({ res2, privateCloud: res2.body.privateCloud })
  // console.log(res.body.songId, 'songid')
  const res3 = await request(
    'POST',
    `https://interface.music.163.com/api/cloud/pub/v2`,
    {
      songid: res2.body.songId,
    },
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
  // console.log({ res3 })
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
