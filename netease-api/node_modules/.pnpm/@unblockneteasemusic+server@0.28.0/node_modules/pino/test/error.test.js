'use strict'

/* eslint no-prototype-builtins: 0 */

const os = require('os')
const { test } = require('tap')
const { sink, once } = require('./helper')
const pino = require('../')

const { pid } = process
const hostname = os.hostname()
const level = 50
const name = 'error'

test('err is serialized with additional properties set on the Error object', async ({ ok, same }) => {
  const stream = sink()
  const err = Object.assign(new Error('myerror'), { foo: 'bar' })
  const instance = pino(stream)
  instance.level = name
  instance[name](err)
  const result = await once(stream, 'data')
  ok(new Date(result.time) <= new Date(), 'time is greater than Date.now()')
  delete result.time
  same(result, {
    pid,
    hostname,
    level,
    type: 'Error',
    msg: err.message,
    stack: err.stack,
    foo: err.foo
  })
})

test('type should be retained, even if type is a property', async ({ ok, same }) => {
  const stream = sink()
  const err = Object.assign(new Error('myerror'), { type: 'bar' })
  const instance = pino(stream)
  instance.level = name
  instance[name](err)
  const result = await once(stream, 'data')
  ok(new Date(result.time) <= new Date(), 'time is greater than Date.now()')
  delete result.time
  same(result, {
    pid,
    hostname,
    level,
    type: 'bar',
    msg: err.message,
    stack: err.stack
  })
})

test('type, message and stack should be first level properties', async ({ ok, same }) => {
  const stream = sink()
  const err = Object.assign(new Error('foo'), { foo: 'bar' })
  const instance = pino(stream)
  instance.level = name
  instance[name](err)

  const result = await once(stream, 'data')
  ok(new Date(result.time) <= new Date(), 'time is greater than Date.now()')
  delete result.time
  same(result, {
    pid,
    hostname,
    level,
    type: 'Error',
    msg: err.message,
    stack: err.stack,
    foo: err.foo
  })
})

test('err serializer', async ({ ok, same }) => {
  const stream = sink()
  const err = Object.assign(new Error('myerror'), { foo: 'bar' })
  const instance = pino({
    serializers: {
      err: pino.stdSerializers.err
    }
  }, stream)

  instance.level = name
  instance[name]({ err })
  const result = await once(stream, 'data')
  ok(new Date(result.time) <= new Date(), 'time is greater than Date.now()')
  delete result.time
  same(result, {
    pid,
    hostname,
    level,
    err: {
      type: 'Error',
      message: err.message,
      stack: err.stack,
      foo: err.foo
    }
  })
})

test('an error with statusCode property is not confused for a http response', async ({ ok, same }) => {
  const stream = sink()
  const err = Object.assign(new Error('StatusCodeErr'), { statusCode: 500 })
  const instance = pino(stream)

  instance.level = name
  instance[name](err)
  const result = await once(stream, 'data')

  ok(new Date(result.time) <= new Date(), 'time is greater than Date.now()')
  delete result.time
  same(result, {
    pid,
    hostname,
    level,
    type: 'Error',
    msg: err.message,
    stack: err.stack,
    statusCode: err.statusCode
  })
})

test('stack is omitted if it is not set on err', t => {
  t.plan(2)
  const err = new Error('myerror')
  delete err.stack
  const instance = pino(sink(function (chunk, enc, cb) {
    t.ok(new Date(chunk.time) <= new Date(), 'time is greater than Date.now()')
    delete chunk.time
    t.equal(chunk.hasOwnProperty('stack'), false)
    cb()
  }))

  instance.level = name
  instance[name](err)
})

test('stack is rendered as any other property if it\'s not a string', t => {
  t.plan(3)
  const err = new Error('myerror')
  err.stack = null
  const instance = pino(sink(function (chunk, enc, cb) {
    t.ok(new Date(chunk.time) <= new Date(), 'time is greater than Date.now()')
    delete chunk.time
    t.equal(chunk.hasOwnProperty('stack'), true)
    t.equal(chunk.stack, null)
    cb()
  }))

  instance.level = name
  instance[name](err)
})

test('correctly ignores toString on errors', async ({ same }) => {
  const err = new Error('myerror')
  err.toString = () => undefined
  const stream = sink()
  const instance = pino({
    test: 'this'
  }, stream)
  instance.fatal(err)
  const result = await once(stream, 'data')
  delete result.time
  same(result, {
    pid,
    hostname,
    level: 60,
    type: 'Error',
    msg: err.message,
    stack: err.stack
  })
})
