const logger = require('../util/logger.js')
const {
  login_cellphone,
  user_cloud,
  album_sublist,
  song_url,
} = require('../main')
async function test() {
  try {
    const result = await login_cellphone({
      phone: '手机号',
      password: '密码',
    })
    logger.info(result)
    const result2 = await user_cloud({
      cookie: result.body.cookie,
    })
    logger.info(result2.body)
    const result3 = await album_sublist({
      cookie: result.body.cookie,
    })
    logger.info(result3.body)
    const result4 = await song_url({
      cookie: result.body.cookie,
      id: 33894312,
    })
    logger.info(result4.body)
  } catch (error) {
    logger.info(error)
  }
}
test()
