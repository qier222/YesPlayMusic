const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    refer: 'inbox_invite',
    roomId: query.roomId,
    inviterId: query.inviterId,
  }
  return request(
    `/api/listen/together/play/invitation/accept`,
    data,
    createOption(query),
  )
}
