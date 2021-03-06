const assert = require('assert')
const axios = require('axios')
const host = global.host || 'http://localhost:3000'

console.log('注意: 测试登录需在 test/login.test.js 中填写账号密码!!!')
const phone = ''
const password = ''
describe('测试登录是否正常', () => {
  it('手机登录 code 应该等于200', (done) => {
    const qs = {
      phone: process.env.NCM_API_TEST_LOGIN_PHONE || phone || '',
      password: process.env.NCM_API_TEST_LOGIN_PASSWORD || password || '',
    }

    axios
      .get(`${host}/login/cellphone`, {
        params: qs,
      })
      .then(({ status, data }) => {
        if (status == 200) {
          console.log('昵称:' + data.profile.nickname)
          assert(data.code === 200)
          done()
        } else {
          done('登录错误')
        }
      })
      .catch((err) => {
        done(err)
      })
  })
})
