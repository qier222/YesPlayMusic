const axios = require('axios')
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
    'POST',
    `https://music.163.com/weapi/nos/token/alloc`,
    data,
    { crypto: 'weapi', cookie: query.cookie, proxy: query.proxy },
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
  //   获取裁剪后图片的id
  const imgSize = query.imgSize || 300
  const imgX = query.imgX || 0
  const imgY = query.imgY || 0
  const res3 = await request(
    'POST',
    `https://music.163.com/upload/img/op?id=${res.body.result.docId}&op=${imgX}y${imgY}y${imgSize}y${imgSize}`,
    {},
    { crypto: 'weapi', cookie: query.cookie, proxy: query.proxy },
  )

  return {
    // ...res.body.result,
    // ...res2.data,
    // ...res3.body,
    url_pre: 'https://p1.music.126.net/' + res.body.result.objectKey,
    url: res3.body.url,
    imgId: res3.body.id,
  }
}
