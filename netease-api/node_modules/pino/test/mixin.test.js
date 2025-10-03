'use strict'

const os = require('os')
const { test } = require('tap')
const { sink, once } = require('./helper')
const pino = require('../')

const { pid } = process
const hostname = os.hostname()
const level = 50
const name = 'error'

test('mixin object is included', async ({ ok, same }) => {
  let n = 0
  const stream = sink()
  const instance = pino({
    mixin () {
      return { hello: ++n }
    }
  }, stream)
  instance.level = name
  instance[name]('test')
  const result = await once(stream, 'data')
  ok(new Date(result.time) <= new Date(), 'time is greater than Date.now()')
  delete result.time
  same(result, {
    pid,
    hostname,
    level,
    msg: 'test',
    hello: 1
  })
})

test('mixin object is new every time', async ({ plan, ok, same }) => {
  plan(6)

  let n = 0
  const stream = sink()
  const instance = pino({
    mixin () {
      return { hello: n }
    }
  }, stream)
  instance.level = name

  while (++n < 4) {
    const msg = `test #${n}`
    stream.pause()
    instance[name](msg)
    stream.resume()
    const result = await once(stream, 'data')
    ok(new Date(result.time) <= new Date(), 'time is greater than Date.now()')
    delete result.time
    same(result, {
      pid,
      hostname,
      level,
      msg,
      hello: n
    })
  }
})

test('mixin object is not called if below log level', async ({ ok }) => {
  const stream = sink()
  const instance = pino({
    mixin () {
      ok(false, 'should not call mixin function')
    }
  }, stream)
  instance.level = 'error'
  instance.info('test')
})

test('mixin object + logged object', async ({ ok, same }) => {
  const stream = sink()
  const instance = pino({
    mixin () {
      return { foo: 1, bar: 2 }
    }
  }, stream)
  instance.level = name
  instance[name]({ bar: 3, baz: 4 })
  const result = await once(stream, 'data')
  ok(new Date(result.time) <= new Date(), 'time is greater than Date.now()')
  delete result.time
  same(result, {
    pid,
    hostname,
    level,
    foo: 1,
    bar: 3,
    baz: 4
  })
})

test('mixin not a function', async ({ throws }) => {
  const stream = sink()
  throws(function () {
    pino({ mixin: 'not a function' }, stream)
  })
})

test('mixin can use context', async ({ ok }) => {
  const stream = sink()
  const instance = pino({
    mixin (context) {
      ok(context !== null && context !== undefined, 'context should be defined')
      return Object.assign({
        error: context.message,
        stack: context.stack
      })
    }
  }, stream)
  instance.level = name
  instance[name]({
    message: '123',
    stack: 'stack'
  }, 'test')
})

test('mixin works without context', async ({ ok }) => {
  const stream = sink()
  const instance = pino({
    mixin (context) {
      ok(context !== null && context !== undefined, 'context is still defined w/o passing mergeObject')

      return {
        something: true
      }
    }
  }, stream)
  instance.level = name
  instance[name]('test')
})
