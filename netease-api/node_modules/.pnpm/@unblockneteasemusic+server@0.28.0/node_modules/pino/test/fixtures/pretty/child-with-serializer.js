global.process = { __proto__: process, pid: 123456 }
Date.now = function () { return 1459875739796 }
require('os').hostname = function () { return 'abcdefghijklmnopqr' }
const pino = require(require.resolve('./../../../'))
const log = pino({
  prettyPrint: true,
  serializers: {
    a (num) {
      return num * 2
    }
  }
})
log.info({ a: 1 }, 'h')
const child = log.child({ a: 8 })
child.info('h2')
child.child({ b: 2 }).info('h3')
child.info({ a: 21 }, 'h4')
