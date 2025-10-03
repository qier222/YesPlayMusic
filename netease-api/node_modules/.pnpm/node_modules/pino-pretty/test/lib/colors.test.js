'use strict'

const { test } = require('tap')
const getColorizerPrivate = require('../../lib/colors')
const { colorizerFactory: getColorizerPublic } = require('../../index')

const testDefaultColorizer = getColorizer => async t => {
  const colorizer = getColorizer()
  let colorized = colorizer(10)
  t.equal(colorized, 'TRACE')

  colorized = colorizer(20)
  t.equal(colorized, 'DEBUG')

  colorized = colorizer(30)
  t.equal(colorized, 'INFO')

  colorized = colorizer(40)
  t.equal(colorized, 'WARN')

  colorized = colorizer(50)
  t.equal(colorized, 'ERROR')

  colorized = colorizer(60)
  t.equal(colorized, 'FATAL')

  colorized = colorizer(900)
  t.equal(colorized, 'USERLVL')

  colorized = colorizer('info')
  t.equal(colorized, 'INFO')

  colorized = colorizer('use-default')
  t.equal(colorized, 'USERLVL')

  colorized = colorizer.message('foo')
  t.equal(colorized, 'foo')

  colorized = colorizer.greyMessage('foo')
  t.equal(colorized, 'foo')
}

const testColoringColorizer = getColorizer => async t => {
  const colorizer = getColorizer(true)
  let colorized = colorizer(10)
  t.equal(colorized, '\u001B[90mTRACE\u001B[39m')

  colorized = colorizer(20)
  t.equal(colorized, '\u001B[34mDEBUG\u001B[39m')

  colorized = colorizer(30)
  t.equal(colorized, '\u001B[32mINFO\u001B[39m')

  colorized = colorizer(40)
  t.equal(colorized, '\u001B[33mWARN\u001B[39m')

  colorized = colorizer(50)
  t.equal(colorized, '\u001B[31mERROR\u001B[39m')

  colorized = colorizer(60)
  t.equal(colorized, '\u001B[41mFATAL\u001B[49m')

  colorized = colorizer(900)
  t.equal(colorized, '\u001B[37mUSERLVL\u001B[39m')

  colorized = colorizer('info')
  t.equal(colorized, '\u001B[32mINFO\u001B[39m')

  colorized = colorizer('use-default')
  t.equal(colorized, '\u001B[37mUSERLVL\u001B[39m')

  colorized = colorizer.message('foo')
  t.equal(colorized, '\u001B[36mfoo\u001B[39m')

  colorized = colorizer.greyMessage('foo')
  t.equal(colorized, '\u001B[90mfoo\u001B[39m')
}

const testCustomColoringColorizer = getColorizer => async t => {
  const customLevels = {
    0: 'INFO',
    1: 'ERR',
    default: 'USERLVL'
  }
  const customLevelNames = {
    info: 0,
    err: 1
  }
  const customColors = [
    [0, 'not-a-color'],
    [1, 'red']
  ]
  const opts = {
    customLevels,
    customLevelNames
  }

  const colorizer = getColorizer(true, customColors)
  const colorizerWithCustomPropUse = getColorizer(true, customColors, true)
  let colorized = colorizer(1, opts)
  t.equal(colorized, '\u001B[31mERR\u001B[39m')

  colorized = colorizer(0, opts)
  t.equal(colorized, '\u001B[37mINFO\u001B[39m')

  colorized = colorizer(900)
  t.equal(colorized, '\u001B[37mUSERLVL\u001B[39m')

  colorized = colorizer('err', opts)
  t.equal(colorized, '\u001B[31mERR\u001B[39m')

  colorized = colorizer('info', opts)
  t.equal(colorized, '\u001B[37mINFO\u001B[39m')

  colorized = colorizer('use-default')
  t.equal(colorized, '\u001B[37mUSERLVL\u001B[39m')

  colorized = colorizer(40, opts)
  t.equal(colorized, '\u001B[33mWARN\u001B[39m')

  colorized = colorizerWithCustomPropUse(50, opts)
  t.equal(colorized, '\u001B[37mUSERLVL\u001B[39m')
}

test('returns default colorizer - private export', testDefaultColorizer(getColorizerPrivate))
test('returns default colorizer - public export', testDefaultColorizer(getColorizerPublic))
test('returns colorizing colorizer - private export', testColoringColorizer(getColorizerPrivate))
test('returns colorizing colorizer - public export', testColoringColorizer(getColorizerPublic))
test('returns custom colorizing colorizer - private export', testCustomColoringColorizer(getColorizerPrivate))
test('returns custom colorizing colorizer - public export', testCustomColoringColorizer(getColorizerPublic))
