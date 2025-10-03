'use strict'

const os = require('os')
const { createWriteStream } = require('fs')
const { join } = require('path')
const { test } = require('tap')
const { fork } = require('child_process')
const writer = require('flush-write-stream')
const { once, getPathToNull } = require('./helper')

test('asynchronous logging', async ({ equal, teardown }) => {
  const now = Date.now
  const hostname = os.hostname
  const proc = process
  global.process = {
    __proto__: process,
    pid: 123456
  }
  Date.now = () => 1459875739796
  os.hostname = () => 'abcdefghijklmnopqr'
  delete require.cache[require.resolve('../')]
  const pino = require('../')
  let expected = ''
  let actual = ''
  const normal = pino(writer((s, enc, cb) => {
    expected += s
    cb()
  }))

  const dest = createWriteStream(getPathToNull())
  dest.write = (s) => {
    actual += s
  }
  const asyncLogger = pino(dest)

  let i = 44
  while (i--) {
    normal.info('h')
    asyncLogger.info('h')
  }

  const expected2 = expected.split('\n')[0]
  let actual2 = ''

  const child = fork(join(__dirname, '/fixtures/syncfalse.js'), { silent: true })
  child.stdout.pipe(writer((s, enc, cb) => {
    actual2 += s
    cb()
  }))
  await once(child, 'close')
  equal(actual, expected)
  equal(actual2.trim(), expected2)

  teardown(() => {
    os.hostname = hostname
    Date.now = now
    global.process = proc
  })
})

test('sync false with child', async ({ equal, teardown }) => {
  const now = Date.now
  const hostname = os.hostname
  const proc = process
  global.process = {
    __proto__: process,
    pid: 123456
  }
  Date.now = function () {
    return 1459875739796
  }
  os.hostname = function () {
    return 'abcdefghijklmnopqr'
  }
  delete require.cache[require.resolve('../')]
  const pino = require('../')
  let expected = ''
  let actual = ''
  const normal = pino(writer((s, enc, cb) => {
    expected += s
    cb()
  })).child({ hello: 'world' })

  const dest = createWriteStream(getPathToNull())
  dest.write = function (s) { actual += s }
  const asyncLogger = pino(dest).child({ hello: 'world' })

  let i = 500
  while (i--) {
    normal.info('h')
    asyncLogger.info('h')
  }

  asyncLogger.flush()

  const expected2 = expected.split('\n')[0]
  let actual2 = ''

  const child = fork(join(__dirname, '/fixtures/syncfalse-child.js'), { silent: true })
  child.stdout.pipe(writer((s, enc, cb) => {
    actual2 += s
    cb()
  }))
  await once(child, 'close')
  equal(actual, expected)
  equal(actual2.trim(), expected2)

  teardown(() => {
    os.hostname = hostname
    Date.now = now
    global.process = proc
  })
})

test('throw an error if extreme is passed', async ({ throws }) => {
  const pino = require('..')
  throws(() => {
    pino({ extreme: true })
  })
})

test('flush does nothing with sync true (default)', async () => {
  const instance = require('..')()
  instance.flush()
})

test('pino.extreme() emits a warning', async ({ equal }) => {
  const pino = require('..')
  process.removeAllListeners('warning')
  process.nextTick(() => pino.extreme(0))
  const warning = await once(process, 'warning')
  const expected = 'The pino.extreme() option is deprecated and will be removed in v7. Use pino.destination({ sync: false }) instead.'
  equal(expected, warning.message)
  equal('extreme_deprecation', warning.code)
})

test('pino.extreme() defaults to stdout', async ({ equal }) => {
  const pino = require('..')
  process.removeAllListeners('warning')
  const dest = pino.extreme()
  equal(dest.fd, process.stdout.fd)
})
