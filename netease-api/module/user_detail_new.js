// 用户详情

const createOption = require('../util/option.js')
module.exports = async (query, request) => {
  const data = {
    all: 'true',
    userId: query.uid,
  }
  const res = await request(
    `/api/w/v1/user/detail/${query.uid}`,
    data,
    createOption(query, 'eapi'),
  )
  // const result = JSON.stringify(res).replace(
  //   /avatarImgId_str/g,
  //   "avatarImgIdStr"
  // );
  // return JSON.parse(result);
  return res
}
