'use strict'

const test = require('ava')
const build = require('./')

process.removeAllListeners('warning')

test('Create warning with zero parameter', t => {
  const { create } = build()
  const buildWarnOpts = create('FastifyWarning', 'CODE', 'Not available')
  const opts = buildWarnOpts()
  t.is(opts.name, 'FastifyWarning')
  t.is(opts.message, 'Not available')
  t.is(opts.code, 'CODE')
})

test('Create error with 1 parameter', t => {
  const { create } = build()
  const buildWarningOpts = create('FastifyWarning', 'CODE', 'hey %s')
  const opts = buildWarningOpts('alice')
  t.is(opts.name, 'FastifyWarning')
  t.is(opts.message, 'hey alice')
  t.is(opts.code, 'CODE')
})

test('Create error with 2 parameters', t => {
  const { create } = build()
  const buildWarnOpts = create('FastifyWarning', 'CODE', 'hey %s, I like your %s')
  const opts = buildWarnOpts('alice', 'attitude')
  t.is(opts.name, 'FastifyWarning')
  t.is(opts.message, 'hey alice, I like your attitude')
  t.is(opts.code, 'CODE')
})

test('Create error with 3 parameters', t => {
  const { create } = build()
  const buildWarnOpts = create('FastifyWarning', 'CODE', 'hey %s, I like your %s %s')
  const opts = buildWarnOpts('alice', 'attitude', 'see you')
  t.is(opts.name, 'FastifyWarning')
  t.is(opts.message, 'hey alice, I like your attitude see you')
  t.is(opts.code, 'CODE')
})

test('Should throw when error code has no fastify name', t => {
  const { create } = build()
  try {
    create()
  } catch (err) {
    t.is(err.message, 'Warning name must not be empty')
  }
})

test('Should throw when error has no code', t => {
  const { create } = build()
  try {
    create('name')
  } catch (err) {
    t.is(err.message, 'Warning code must not be empty')
  }
})

test('Should throw when error has no message', t => {
  const { create } = build()
  try {
    create('name', 'code')
  } catch (err) {
    t.is(err.message, 'Warning message must not be empty')
  }
})

test.serial.cb('emit should emit a given code only once', t => {
  t.plan(4)
  const { create, emit, emitted } = build()

  process.on('warning', onWarning)
  function onWarning (warning) {
    t.is(warning.name, 'FastifyDeprecation')
    t.is(warning.code, 'CODE')
    t.is(warning.message, 'Hello world')
    t.true(emitted.get('CODE'))
  }

  create('FastifyDeprecation', 'CODE', 'Hello world')
  emit('CODE')
  emit('CODE')
  setImmediate(() => {
    process.removeListener('warning', onWarning)
    t.end()
  })
})

test.serial.cb('emit with interpolated string', t => {
  t.plan(4)
  const { create, emit, emitted } = build()

  process.on('warning', onWarning)
  function onWarning (warning) {
    t.is(warning.name, 'FastifyDeprecation')
    t.is(warning.code, 'CODE')
    t.is(warning.message, 'Hello world')
    t.true(emitted.get('CODE'))
  }

  create('FastifyDeprecation', 'CODE', 'Hello %s')
  emit('CODE', 'world')
  emit('CODE', 'world')

  setImmediate(() => {
    process.removeListener('warning', onWarning)
    t.end()
  })
})

test('Cannot reuse the same code more than once', t => {
  const { create } = build()
  create('FastifyWarning', 'CODE', 'Not available')
  try {
    create('FastifyWarning', 'CODE', 'Not available')
  } catch (err) {
    t.is(err.message, "The code 'CODE' already exist")
  }
})
