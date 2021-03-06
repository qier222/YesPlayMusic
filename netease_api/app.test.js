const fs = require('fs')
const path = require('path')

let app
before(() => {
  app = require('./app.js')
  global.host = 'http://localhost:' + app.server.address().port
})
after((done) => {
  app.server.close(done)
})

fs.readdirSync(path.join(__dirname, 'test')).forEach((file) => {
  require(path.join(__dirname, 'test', file))
})
