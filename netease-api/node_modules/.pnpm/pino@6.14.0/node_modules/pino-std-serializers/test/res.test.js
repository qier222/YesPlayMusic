'use strict'

/* eslint-disable no-prototype-builtins */

const http = require('http')
const test = require('tap').test
const serializers = require('../lib/res')
const wrapResponseSerializer = require('../').wrapResponseSerializer

test('res.raw is not enumerable', function (t) {
  t.plan(1)

  const server = http.createServer(handler)
  server.unref()
  server.listen(0, () => {
    http.get(server.address(), () => {})
  })

  t.tearDown(() => server.close())

  function handler (req, res) {
    const serialized = serializers.resSerializer(res)
    t.is(serialized.propertyIsEnumerable('raw'), false)
    res.end()
  }
})

test('res.raw is available', function (t) {
  t.plan(2)

  const server = http.createServer(handler)
  server.unref()
  server.listen(0, () => {
    http.get(server.address(), () => {})
  })

  t.tearDown(() => server.close())

  function handler (req, res) {
    res.statusCode = 200
    const serialized = serializers.resSerializer(res)
    t.ok(serialized.raw)
    t.is(serialized.raw.statusCode, 200)
    res.end()
  }
})

test('can wrap response serializers', function (t) {
  t.plan(3)

  const server = http.createServer(handler)
  server.unref()
  server.listen(0, () => {
    http.get(server.address(), () => {})
  })

  t.tearDown(() => server.close())

  const serializer = wrapResponseSerializer(function (res) {
    t.ok(res.statusCode)
    t.is(res.statusCode, 200)
    delete res.statusCode
    return res
  })

  function handler (req, res) {
    res.statusCode = 200
    const serialized = serializer(res)
    t.notOk(serialized.statusCode)
    res.end()
  }
})

test('res.headers is serialized', function (t) {
  t.plan(1)

  const server = http.createServer(handler)
  server.unref()
  server.listen(0, () => {
    http.get(server.address(), () => {})
  })

  t.tearDown(() => server.close())

  function handler (req, res) {
    res.setHeader('x-custom', 'y')
    const serialized = serializers.resSerializer(res)
    t.is(serialized.headers['x-custom'], 'y')
    res.end()
  }
})
