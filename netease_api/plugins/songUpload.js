const axios = require('axios')
module.exports = async (query, request) => {
  //   获取key和token
  const tokenRes = await request(
    'POST',
    `https://music.163.com/weapi/nos/token/alloc`,
    {
      bucket: 'jd-musicrep-privatecloud-audio-public',
      ext: 'mp3',
      filename: query.songFile.name.replace('.mp3', ''),
      local: false,
      nos_product: 3,
      type: 'audio',
      md5: query.songFile.md5,
    },
    { crypto: 'weapi', cookie: query.cookie, proxy: query.proxy },
  )

  // 上传
  const objectKey = tokenRes.body.result.objectKey.replace('/', '%2F')
  try {
    await axios({
      method: 'post',
      url: `http://45.127.129.8/jd-musicrep-privatecloud-audio-public/${objectKey}?offset=0&complete=true&version=1.0`,
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
    console.log('error', error.response)
    throw error.response
  }
  return {
    ...tokenRes,
  }
}
