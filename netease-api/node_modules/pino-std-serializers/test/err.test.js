'use strict'

const test = require('tap').test
const serializer = require('../lib/err')
const wrapErrorSerializer = require('../').wrapErrorSerializer

test('serializes Error objects', function (t) {
  t.plan(3)
  const serialized = serializer(Error('foo'))
  t.is(serialized.type, 'Error')
  t.is(serialized.message, 'foo')
  t.match(serialized.stack, /err\.test\.js:/)
})

test('serializes Error objects with extra properties', function (t) {
  t.plan(5)
  const err = Error('foo')
  err.statusCode = 500
  const serialized = serializer(err)
  t.is(serialized.type, 'Error')
  t.is(serialized.message, 'foo')
  t.ok(serialized.statusCode)
  t.is(serialized.statusCode, 500)
  t.match(serialized.stack, /err\.test\.js:/)
})

test('serializes Error objects with subclass "type"', function (t) {
  t.plan(1)
  class MyError extends Error {}
  const err = new MyError('foo')
  const serialized = serializer(err)
  t.is(serialized.type, 'MyError')
})

test('serializes nested errors', function (t) {
  t.plan(7)
  const err = Error('foo')
  err.inner = Error('bar')
  const serialized = serializer(err)
  t.is(serialized.type, 'Error')
  t.is(serialized.message, 'foo')
  t.match(serialized.stack, /err\.test\.js:/)
  t.is(serialized.inner.type, 'Error')
  t.is(serialized.inner.message, 'bar')
  t.match(serialized.inner.stack, /Error: bar/)
  t.match(serialized.inner.stack, /err\.test\.js:/)
})

test('prevents infinite recursion', function (t) {
  t.plan(4)
  const err = Error('foo')
  err.inner = err
  const serialized = serializer(err)
  t.is(serialized.type, 'Error')
  t.is(serialized.message, 'foo')
  t.match(serialized.stack, /err\.test\.js:/)
  t.notOk(serialized.inner)
})

test('cleans up infinite recursion tracking', function (t) {
  t.plan(8)
  const err = Error('foo')
  const bar = Error('bar')
  err.inner = bar
  bar.inner = err

  serializer(err)
  const serialized = serializer(err)

  t.is(serialized.type, 'Error')
  t.is(serialized.message, 'foo')
  t.match(serialized.stack, /err\.test\.js:/)
  t.ok(serialized.inner)
  t.is(serialized.inner.type, 'Error')
  t.is(serialized.inner.message, 'bar')
  t.match(serialized.inner.stack, /Error: bar/)
  t.notOk(serialized.inner.inner)
})

test('err.raw is available', function (t) {
  t.plan(1)
  const err = Error('foo')
  const serialized = serializer(err)
  t.equal(serialized.raw, err)
})

test('redefined err.constructor doesnt crash serializer', function (t) {
  t.plan(10)

  function check (a, name) {
    t.is(a.type, name)
    t.is(a.message, 'foo')
  }

  const err1 = TypeError('foo')
  err1.constructor = '10'

  const err2 = TypeError('foo')
  err2.constructor = undefined

  const err3 = Error('foo')
  err3.constructor = null

  const err4 = Error('foo')
  err4.constructor = 10

  class MyError extends Error {}
  const err5 = new MyError('foo')
  err5.constructor = undefined

  check(serializer(err1), 'TypeError')
  check(serializer(err2), 'TypeError')
  check(serializer(err3), 'Error')
  check(serializer(err4), 'Error')
  // We do not expect 'MyError' because err5.constructor has been blown away.
  // `err5.name` is 'Error' from the base class prototype.
  check(serializer(err5), 'Error')
})

test('pass through anything that is not an Error', function (t) {
  t.plan(3)

  function check (a) {
    t.is(serializer(a), a)
  }

  check('foo')
  check({ hello: 'world' })
  check([1, 2])
})

test('can wrap err serializers', function (t) {
  t.plan(5)
  const err = Error('foo')
  err.foo = 'foo'
  const serializer = wrapErrorSerializer(function (err) {
    delete err.foo
    err.bar = 'bar'
    return err
  })
  const serialized = serializer(err)
  t.is(serialized.type, 'Error')
  t.is(serialized.message, 'foo')
  t.match(serialized.stack, /err\.test\.js:/)
  t.notOk(serialized.foo)
  t.is(serialized.bar, 'bar')
})
