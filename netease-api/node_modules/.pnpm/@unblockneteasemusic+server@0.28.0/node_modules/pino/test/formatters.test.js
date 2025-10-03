'use strict'
/* eslint no-prototype-builtins: 0 */

const { hostname } = require('os')
const { test } = require('tap')
const { sink, once } = require('./helper')
const pino = require('../')

test('level formatter', async ({ match }) => {
  const stream = sink()
  const logger = pino({
    formatters: {
      level (label, number) {
        return {
          log: {
            level: label
          }
        }
      }
    }
  }, stream)

  const o = once(stream, 'data')
  logger.info('hello world')
  match(await o, {
    log: {
      level: 'info'
    }
  })
})

test('bindings formatter', async ({ match }) => {
  const stream = sink()
  const logger = pino({
    formatters: {
      bindings (bindings) {
        return {
          process: {
            pid: bindings.pid
          },
          host: {
            name: bindings.hostname
          }
        }
      }
    }
  }, stream)

  const o = once(stream, 'data')
  logger.info('hello world')
  match(await o, {
    process: {
      pid: process.pid
    },
    host: {
      name: hostname()
    }
  })
})

test('no bindings formatter', async ({ match, notOk }) => {
  const stream = sink()
  const logger = pino({
    formatters: {
      bindings (bindings) {
        return null
      }
    }
  }, stream)

  const o = once(stream, 'data')
  logger.info('hello world')
  const log = await o
  notOk(log.hasOwnProperty('pid'))
  notOk(log.hasOwnProperty('hostname'))
  match(log, { msg: 'hello world' })
})

test('log formatter', async ({ match, equal }) => {
  const stream = sink()
  const logger = pino({
    formatters: {
      log (obj) {
        equal(obj.hasOwnProperty('msg'), false)
        return { hello: 'world', ...obj }
      }
    }
  }, stream)

  const o = once(stream, 'data')
  logger.info({ foo: 'bar', nested: { object: true } }, 'hello world')
  match(await o, {
    hello: 'world',
    foo: 'bar',
    nested: { object: true }
  })
})

test('Formatters combined', async ({ match }) => {
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

  const o = once(stream, 'data')
  logger.info({ foo: 'bar', nested: { object: true } }, 'hello world')
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
    nested: { object: true }
  })
})

test('Formatters in child logger', async ({ match }) => {
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
    nested: { object: true }
  }, {
    formatters: {
      bindings (bindings) {
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
})

test('Formatters without bindings in child logger', async ({ match }) => {
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
    nested: { object: true }
  }, {
    formatters: {
      log (obj) {
        return { other: 'stuff', ...obj }
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
    foo: 'bar',
    other: 'stuff',
    nested: { object: true }
  })
})

test('elastic common schema format', async ({ match, type }) => {
  const stream = sink()
  const ecs = {
    formatters: {
      level (label, number) {
        return {
          log: {
            level: label,
            logger: 'pino'
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
        return { ecs: { version: '1.4.0' }, ...obj }
      }
    },
    messageKey: 'message',
    timestamp: () => `,"@timestamp":"${new Date(Date.now()).toISOString()}"`
  }

  const logger = pino({ ...ecs }, stream)

  const o = once(stream, 'data')
  logger.info({ foo: 'bar' }, 'hello world')
  const log = await o
  type(log['@timestamp'], 'string')
  match(log, {
    log: { level: 'info', logger: 'pino' },
    process: { pid: process.pid },
    host: { name: hostname() },
    ecs: { version: '1.4.0' },
    foo: 'bar',
    message: 'hello world'
  })
})
