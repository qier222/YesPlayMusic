// 用户详情

const createOption = require('../util/option.js')
module.exports = async (query, request) => {
  const res = await request(
    `/api/v1/user/detail/${query.uid}`,
    {},
    createOption(query, 'weapi'),
  )
  const result = JSON.stringify(res).replace(
    /avatarImgId_str/g,
    'avatarImgIdStr',
  )
  return JSON.parse(result)
}
