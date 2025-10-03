const QRCode = require('qrcode')
const createOption = require('../util/option.js')
module.exports = async (query, request) => {
  const data = {
    verifyConfigId: query.vid,
    verifyType: query.type,
    token: query.token,
    params: JSON.stringify({
      event_id: query.evid,
      sign: query.sign,
    }),
    size: 150,
  }

  const res = await request(
    `/api/frontrisk/verify/getqrcode`,
    data,
    createOption(query, 'weapi'),
  )
  const result = `https://st.music.163.com/encrypt-pages?qrCode=${
    res.body.data.qrCode
  }&verifyToken=${query.token}&verifyId=${query.vid}&verifyType=${
    query.type
  }&params=${JSON.stringify({
    event_id: query.evid,
    sign: query.sign,
  })}`
  return {
    status: 200,
    body: {
      code: 200,
      data: {
        qrCode: res.body.data.qrCode,
        qrurl: result,
        qrimg: await QRCode.toDataURL(result),
      },
    },
  }
}
