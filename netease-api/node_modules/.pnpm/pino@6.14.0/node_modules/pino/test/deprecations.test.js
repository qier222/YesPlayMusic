'use strict'
/* eslint no-prototype-builtins: 0 */

const { hostname } = require('os')
const { test } = require('tap')
const { sink, once } = require('./helper')
const pino = require('../')

process.removeAllListeners('warning')

test('useLevelLabels', async ({ match, equal }) => {
  process.on('warning', onWarning)
  function onWarning (warn) {
    equal(warn.code, 'PINODEP001')
  }

  const stream = sink()
  const logger = pino({
    useLevelLabels: true
  }, stream)

  const o = once(stream, 'data')
  logger.info('hello world')
  match(await o, { level: 'info' })
  process.removeListener('warning', onWarning)
})

test('changeLevelName', async ({ match, equal }) => {
  process.on('warning', onWarning)
  function onWarning (warn) {
    equal(warn.code, 'PINODEP002')
  }

  const stream = sink()
  const logger = pino({
    changeLevelName: 'priority'
  }, stream)

  const o = once(stream, 'data')
  logger.info('hello world')
  match(await o, { priority: 30 })
  process.removeListener('warning', onWarning)
})

test('levelKey', async ({ match, equal }) => {
  process.on('warning', onWarning)
  function onWarning (warn) {
    equal(warn.code, 'PINODEP002')
  }

  const stream = sink()
  const logger = pino({
    levelKey: 'priority'
  }, stream)

  const o = once(stream, 'data')
  logger.info('hello world')
  match(await o, { priority: 30 })
  process.removeListener('warning', onWarning)
})

test('useLevelLabels and changeLevelName', async ({ match, equal }) => {
  let count = 0
  process.on('warning', onWarning)
  function onWarning (warn) {
    equal(warn.code, count === 0 ? 'PINODEP001' : 'PINODEP002')
    count += 1
  }

  const stream = sink()
  const logger = pino({
    changeLevelName: 'priority',
    useLevelLabels: true
  }, stream)

  const o = once(stream, 'data')
  logger.info('hello world')
  match(await o, { priority: 'info' })
  process.removeListener('warning', onWarning)
})

test('pino.* serializer', async ({ match, equal, pass }) => {
  process.on('warning', onWarning)
  function onWarning (warn) {
    equal(warn.code, 'PINODEP003')
  }

  const stream = sink()
  const logger = pino({
    serializers: {
      [Symbol.for('pino.*')] (log) {
        pass('called')
        return log
      }
    }
  }, stream)

  const o = once(stream, 'data')
  logger.info('hello world')
  match(await o, { level: 30 })
  process.removeListener('warning', onWarning)
})

test('child(bindings.serializers)', async ({ match, equal, pass }) => {
  process.on('warning', onWarning)
  function onWarning (warn) {
    equal(warn.code, 'PINODEP004')
  }

  const stream = sink()
  const parent = pino({ serializers: { test: () => 'parent' } }, stream)
  const child = parent.child({
    serializers: {
      test () {
        pass('called')
        return 'child'
      }
    }
  })

  const o = once(stream, 'data')
  child.fatal({ test: 'test' })
  match(await o, { test: 'child' })
  process.removeListener('warning', onWarning)
})

test('child(bindings.formatters)', async ({ match, equal, pass }) => {
  process.on('warning', onWarning)
  function onWarning (warn) {
    equal(warn.code, 'PINODEP005')
  }

  const stream = sink()
  const logger = pino({
    formatters: {
      level (label, number) {
        return {
          log: {
            level: label
          }
        }
      },
      bindings (bindings) {
        return {
          process: {
            pid: bindings.pid
          },
          host: {
            name: bindings.hostname
          }
        }
      },
      log (obj) {
        return { hello: 'world', ...obj }
      }
    }
  }, stream)

  const child = logger.child({
    foo: 'bar',
    nested: { object: true },
    formatters: {
      bindings (bindings) {
        pass('called')
        return { ...bindings, faz: 'baz' }
      }
    }
  })

  const o = once(stream, 'data')
  child.info('hello world')
  match(await o, {
    log: {
      level: 'info'
    },
    process: {
      pid: process.pid
    },
    host: {
      name: hostname()
    },
    hello: 'world',
    foo: 'bar',
    nested: { object: true },
    faz: 'baz'
  })
  process.removeListener('warning', onWarning)
})

test('child(bindings.customLevels)', async ({ match, equal, pass }) => {
  process.on('warning', onWarning)
  function onWarning (warn) {
    equal(warn.code, 'PINODEP006')
  }

  const stream = sink()
  const logger = pino(stream).child({
    childMsg: 'ok',
    customLevels: {
      foo: 35
    }
  }, {
    formatters: {
      level (label, number) {
        if (label === 'foo' && number === 35) {
          pass('using customLevels')
        }
        return { level: number }
      }
    }
  })

  const o = once(stream, 'data')
  logger.foo('test')
  match(await o, {
    level: 35,
    childMsg: 'ok',
    msg: 'test'
  })
  process.removeListener('warning', onWarning)
})

test('child(bindings.level)', async ({ equal, pass }) => {
  process.on('warning', onWarning)
  function onWarning (warn) {
    equal(warn.code, 'PINODEP007')
  }

  const stream = sink()
  const logger = pino({
    level: 'info'
  }, stream).child({
    level: 'trace'
  })

  const o = once(stream, 'data')
  logger.info('test')
  if (await o === null) {
    pass('child can overrid parent level')
  }
  process.removeListener('warning', onWarning)
})
