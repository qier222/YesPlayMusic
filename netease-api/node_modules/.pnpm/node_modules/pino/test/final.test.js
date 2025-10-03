'use strict'
const pino = require('..')
const fs = require('fs')
const { test } = require('tap')
const { sleep, getPathToNull } = require('./helper')

test('replaces onTerminated option', async ({ throws }) => {
  throws(() => {
    pino({
      onTerminated: () => {}
    })
  }, Error('The onTerminated option has been removed, use pino.final instead'))
})

test('throws if not supplied a logger instance', async ({ throws }) => {
  throws(() => {
    pino.final()
  }, Error('expected a pino logger instance'))
})

test('throws if the supplied handler is not a function', async ({ throws }) => {
  throws(() => {
    pino.final(pino(), 'dummy')
  }, Error('if supplied, the handler parameter should be a function'))
})

test('throws if not supplied logger with pino.destination instance with sync false', async ({ throws, doesNotThrow }) => {
  throws(() => {
    pino.final(pino(fs.createWriteStream(getPathToNull())), () => {})
  }, Error('final requires a stream that has a flushSync method, such as pino.destination'))

  doesNotThrow(() => {
    pino.final(pino(pino.destination({ sync: false })), () => {})
  })

  doesNotThrow(() => {
    pino.final(pino(pino.destination({ sync: false })), () => {})
  })
})

test('returns an exit listener function', async ({ equal }) => {
  equal(typeof pino.final(pino(pino.destination({ sync: false })), () => {}), 'function')
})

test('listener function immediately sync flushes when fired (sync false)', async ({ pass, fail }) => {
  const dest = pino.destination({ dest: getPathToNull(), sync: false })
  let passed = false
  dest.flushSync = () => {
    passed = true
    pass('flushSync called')
  }
  pino.final(pino(dest), () => {})()
  await sleep(10)
  if (passed === false) fail('flushSync not called')
})

test('listener function immediately sync flushes when fired (sync true)', async ({ pass, fail }) => {
  const dest = pino.destination({ dest: getPathToNull(), sync: true })
  let passed = false
  dest.flushSync = () => {
    passed = true
    pass('flushSync called')
  }
  pino.final(pino(dest), () => {})()
  await sleep(10)
  if (passed === false) fail('flushSync not called')
})

test('swallows the non-ready error', async ({ doesNotThrow }) => {
  const dest = pino.destination({ dest: getPathToNull(), sync: false })
  doesNotThrow(() => {
    pino.final(pino(dest), () => {})()
  })
})

test('listener function triggers handler function parameter', async ({ pass, fail }) => {
  const dest = pino.destination({ dest: getPathToNull(), sync: false })
  let passed = false
  pino.final(pino(dest), () => {
    passed = true
    pass('handler function triggered')
  })()
  await sleep(10)
  if (passed === false) fail('handler function not triggered')
})

test('passes any error to the handler', async ({ equal }) => {
  const dest = pino.destination({ dest: getPathToNull(), sync: false })
  pino.final(pino(dest), (err) => {
    equal(err.message, 'test')
  })(Error('test'))
})

test('passes a specialized final logger instance', async ({ equal, not, error }) => {
  const dest = pino.destination({ dest: getPathToNull(), sync: false })
  const logger = pino(dest)
  pino.final(logger, (err, finalLogger) => {
    error(err)
    equal(typeof finalLogger.trace, 'function')
    equal(typeof finalLogger.debug, 'function')
    equal(typeof finalLogger.info, 'function')
    equal(typeof finalLogger.warn, 'function')
    equal(typeof finalLogger.error, 'function')
    equal(typeof finalLogger.fatal, 'function')

    not(finalLogger.trace, logger.trace)
    not(finalLogger.debug, logger.debug)
    not(finalLogger.info, logger.info)
    not(finalLogger.warn, logger.warn)
    not(finalLogger.error, logger.error)
    not(finalLogger.fatal, logger.fatal)

    equal(finalLogger.child, logger.child)
    equal(finalLogger.levels, logger.levels)
  })()
})

test('returns a specialized final logger instance if no handler is passed', async ({ equal, not }) => {
  const dest = pino.destination({ dest: getPathToNull(), sync: false })
  const logger = pino(dest)
  const finalLogger = pino.final(logger)
  equal(typeof finalLogger.trace, 'function')
  equal(typeof finalLogger.debug, 'function')
  equal(typeof finalLogger.info, 'function')
  equal(typeof finalLogger.warn, 'function')
  equal(typeof finalLogger.error, 'function')
  equal(typeof finalLogger.fatal, 'function')

  not(finalLogger.trace, logger.trace)
  not(finalLogger.debug, logger.debug)
  not(finalLogger.info, logger.info)
  not(finalLogger.warn, logger.warn)
  not(finalLogger.error, logger.error)
  not(finalLogger.fatal, logger.fatal)

  equal(finalLogger.child, logger.child)
  equal(finalLogger.levels, logger.levels)
})

test('final logger instances synchronously flush after a log method call', async ({ pass, fail, error }) => {
  const dest = pino.destination({ dest: getPathToNull(), sync: false })
  const logger = pino(dest)
  let passed = false
  let count = 0
  dest.flushSync = () => {
    count++
    if (count === 2) {
      passed = true
      pass('flushSync called')
    }
  }
  pino.final(logger, (err, finalLogger) => {
    error(err)
    finalLogger.info('hello')
  })()
  await sleep(10)
  if (passed === false) fail('flushSync not called')
})

test('also instruments custom log methods', async ({ pass, fail, error }) => {
  const dest = pino.destination({ dest: getPathToNull(), sync: false })
  const logger = pino({
    customLevels: {
      foo: 35
    }
  }, dest)
  let passed = false
  let count = 0
  dest.flushSync = () => {
    count++
    if (count === 2) {
      passed = true
      pass('flushSync called')
    }
  }
  pino.final(logger, (err, finalLogger) => {
    error(err)
    finalLogger.foo('hello')
  })()
  await sleep(10)
  if (passed === false) fail('flushSync not called')
})
