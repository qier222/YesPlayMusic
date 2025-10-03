const assert = require('assert')
const { default: axios } = require('axios')
const host = global.host || 'http://localhost:3000'
describe('测试获取歌曲是否正常', () => {
  it('歌曲的 url 不应该为空', (done) => {
    const qs = {
      id: 1969519579,
      br: 999000,
      realIP: global.cnIp,
    }

    axios
      .get(`${host}/song/url`, {
        params: qs,
      })
      .then(({ status, data }) => {
        if (status == 200) {
          assert(!!data.data[0].url)
        }
        done()
      })
      .catch((err) => {
        done(err)
      })
  })
})
