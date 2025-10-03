'use strict'
var test = require('tap').test
var flatstr = require('.')

test('does not throw', function (t) {
  t.doesNotThrow(() => {
    flatstr('abc')
  })
  t.doesNotThrow(() => {
    flatstr({})
  })
  t.doesNotThrow(() => {
    flatstr(1)
  })
  t.doesNotThrow(() => {
    flatstr(null)
  })
  t.end()
})

test('returns the same value that was passed in', function (t) {
  var o = {}
  t.is(flatstr('abc'), 'abc')
  t.is(flatstr(o), o)
  t.end()
})
