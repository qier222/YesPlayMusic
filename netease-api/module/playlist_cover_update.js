const uploadPlugin = require('../plugins/upload')
const createOption = require('../util/option.js')
module.exports = async (query, request) => {
  if (!query.imgFile) {
    return {
      status: 400,
      body: {
        code: 400,
        msg: 'imgFile is required',
      },
    }
  }
  const uploadInfo = await uploadPlugin(query, request)
  const res = await request(
    `/api/playlist/cover/update`,
    {
      id: query.id,
      coverImgId: uploadInfo.imgId,
    },
    createOption(query, 'weapi'),
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
