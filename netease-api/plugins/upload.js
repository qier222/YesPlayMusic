const { default: axios } = require('axios')
const createOption = require('../util/option.js')
module.exports = async (query, request) => {
  const data = {
    bucket: 'yyimgs',
    ext: 'jpg',
    filename: query.imgFile.name,
    local: false,
    nos_product: 0,
    return_body: `{"code":200,"size":"$(ObjectSize)"}`,
    type: 'other',
  }
  //   获取key和token
  const res = await request(
    `/api/nos/token/alloc`,
    data,
    createOption(query, 'weapi'),
  )
  //   上传图片
  const res2 = await axios({
    method: 'post',
    url: `https://nosup-hz1.127.net/yyimgs/${res.body.result.objectKey}?offset=0&complete=true&version=1.0`,
    headers: {
      'x-nos-token': res.body.result.token,
      'Content-Type': 'image/jpeg',
    },
    data: query.imgFile.data,
  })

  return {
    // ...res.body.result,
    // ...res2.data,
    // ...res3.body,
    url_pre: 'https://p1.music.126.net/' + res.body.result.objectKey,
    imgId: res.body.result.docId,
  }
}
