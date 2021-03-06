const uploadPlugin = require('../plugins/upload')
module.exports = async (query, request) => {
  const uploadInfo = await uploadPlugin(query, request)
  const res = await request(
    'POST',
    `https://music.163.com/weapi/playlist/cover/update`,
    {
      id: query.id,
      coverImgId: uploadInfo.imgId,
    },
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
  return {
    status: 200,
    body: {
      code: 200,
      data: {
        ...uploadInfo,
        ...res.body,
      },
    },
  }
}
