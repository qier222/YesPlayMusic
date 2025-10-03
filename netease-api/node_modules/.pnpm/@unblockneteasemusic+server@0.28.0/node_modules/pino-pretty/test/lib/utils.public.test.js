'use strict'

const tap = require('tap')
const getColorizer = require('../../lib/colors')
const utils = require('../../lib/utils')
const rimraf = require('rimraf')
const { join } = require('path')
const fs = require('fs')

tap.test('prettifyErrorLog', t => {
  const { prettifyErrorLog } = utils

  t.test('returns string with default settings', async t => {
    const err = Error('Something went wrong')
    const str = prettifyErrorLog({ log: err })
    t.ok(str.startsWith('    Error: Something went wrong'))
  })

  t.test('returns string with custom ident', async t => {
    const err = Error('Something went wrong')
    const str = prettifyErrorLog({ log: err, ident: '  ' })
    t.ok(str.startsWith('  Error: Something went wrong'))
  })

  t.test('returns string with custom eol', async t => {
    const err = Error('Something went wrong')
    const str = prettifyErrorLog({ log: err, eol: '\r\n' })
    t.ok(str.startsWith('    Error: Something went wrong\r\n'))
  })

  t.end()
})

tap.test('prettifyLevel', t => {
  const { prettifyLevel } = utils

  t.test('returns `undefined` for unknown level', async t => {
    const colorized = prettifyLevel({ log: {} })
    t.equal(colorized, undefined)
  })

  t.test('returns non-colorized value for default colorizer', async t => {
    const log = {
      level: 30
    }
    const colorized = prettifyLevel({ log })
    t.equal(colorized, 'INFO')
  })

  t.test('returns colorized value for color colorizer', async t => {
    const log = {
      level: 30
    }
    const colorizer = getColorizer(true)
    const colorized = prettifyLevel({ log, colorizer })
    t.equal(colorized, '\u001B[32mINFO\u001B[39m')
  })

  t.end()
})

tap.test('prettifyMessage', t => {
  const { prettifyMessage } = utils

  t.test('returns `undefined` if `messageKey` not found', async t => {
    const str = prettifyMessage({ log: {} })
    t.equal(str, undefined)
  })

  t.test('returns `undefined` if `messageKey` not string', async t => {
    const str = prettifyMessage({ log: { msg: {} } })
    t.equal(str, undefined)
  })

  t.test('returns non-colorized value for default colorizer', async t => {
    const str = prettifyMessage({ log: { msg: 'foo' } })
    t.equal(str, 'foo')
  })

  t.test('returns non-colorized value for alternate `messageKey`', async t => {
    const str = prettifyMessage({ log: { message: 'foo' }, messageKey: 'message' })
    t.equal(str, 'foo')
  })

  t.test('returns colorized value for color colorizer', async t => {
    const colorizer = getColorizer(true)
    const str = prettifyMessage({ log: { msg: 'foo' }, colorizer })
    t.equal(str, '\u001B[36mfoo\u001B[39m')
  })

  t.test('returns colorized value for color colorizer for alternate `messageKey`', async t => {
    const colorizer = getColorizer(true)
    const str = prettifyMessage({ log: { message: 'foo' }, messageKey: 'message', colorizer })
    t.equal(str, '\u001B[36mfoo\u001B[39m')
  })

  t.test('returns message formatted by `messageFormat` option', async t => {
    const str = prettifyMessage({ log: { msg: 'foo', context: 'appModule' }, messageFormat: '{context} - {msg}' })
    t.equal(str, 'appModule - foo')
  })

  t.test('returns message formatted by `messageFormat` option - missing prop', async t => {
    const str = prettifyMessage({ log: { context: 'appModule' }, messageFormat: '{context} - {msg}' })
    t.equal(str, 'appModule - ')
  })

  t.test('returns message formatted by `messageFormat` option - levelLabel & useOnlyCustomProps false', async t => {
    const str = prettifyMessage({ log: { msg: 'foo', context: 'appModule', level: 30 }, messageFormat: '[{level}] {levelLabel} {context} - {msg}', customLevels: {} })
    t.equal(str, '[30] INFO appModule - foo')
  })

  t.test('returns message formatted by `messageFormat` option - levelLabel & useOnlyCustomProps true', async t => {
    const str = prettifyMessage({ log: { msg: 'foo', context: 'appModule', level: 30 }, messageFormat: '[{level}] {levelLabel} {context} - {msg}', customLevels: { 30: 'CHECK' }, useOnlyCustomProps: true })
    t.equal(str, '[30] CHECK appModule - foo')
  })

  t.test('returns message formatted by `messageFormat` option - levelLabel & customLevels', async t => {
    const str = prettifyMessage({ log: { msg: 'foo', context: 'appModule', level: 123 }, messageFormat: '[{level}] {levelLabel} {context} - {msg}', customLevels: { 123: 'CUSTOM' } })
    t.equal(str, '[123] CUSTOM appModule - foo')
  })

  t.test('returns message formatted by `messageFormat` option - levelLabel, customLevels & useOnlyCustomProps', async t => {
    const str = prettifyMessage({ log: { msg: 'foo', context: 'appModule', level: 123 }, messageFormat: '[{level}] {levelLabel} {context} - {msg}', customLevels: { 123: 'CUSTOM' }, useOnlyCustomProps: true })
    t.equal(str, '[123] CUSTOM appModule - foo')
  })

  t.test('returns message formatted by `messageFormat` option - levelLabel, customLevels & useOnlyCustomProps false', async t => {
    const str = prettifyMessage({ log: { msg: 'foo', context: 'appModule', level: 40 }, messageFormat: '[{level}] {levelLabel} {context} - {msg}', customLevels: { 123: 'CUSTOM' }, useOnlyCustomProps: false })
    t.equal(str, '[40] WARN appModule - foo')
  })

  t.test('`messageFormat` supports nested curly brackets', async t => {
    const str = prettifyMessage({ log: { level: 30 }, messageFormat: '{{level}}-{level}-{{level}-{level}}' })
    t.equal(str, '{30}-30-{30-30}')
  })

  t.test('`messageFormat` supports nested object', async t => {
    const str = prettifyMessage({ log: { level: 30, request: { url: 'localhost/test' }, msg: 'foo' }, messageFormat: '{request.url} - param: {request.params.process} - {msg}' })
    t.equal(str, 'localhost/test - param:  - foo')
  })

  t.test('`messageFormat` supports function definition', async t => {
    const str = prettifyMessage({
      log: { level: 30, request: { url: 'localhost/test' }, msg: 'incoming request' },
      messageFormat: (log, messageKey, levelLabel) => {
        let msg = log[messageKey]
        if (msg === 'incoming request') msg = `--> ${log.request.url}`
        return msg
      }
    })
    t.equal(str, '--> localhost/test')
  })

  t.end()
})

tap.test('prettifyMetadata', t => {
  const { prettifyMetadata } = utils

  t.test('returns `undefined` if no metadata present', async t => {
    const str = prettifyMetadata({ log: {} })
    t.equal(str, undefined)
  })

  t.test('works with only `name` present', async t => {
    const str = prettifyMetadata({ log: { name: 'foo' } })
    t.equal(str, '(foo)')
  })

  t.test('works with only `pid` present', async t => {
    const str = prettifyMetadata({ log: { pid: '1234' } })
    t.equal(str, '(1234)')
  })

  t.test('works with only `hostname` present', async t => {
    const str = prettifyMetadata({ log: { hostname: 'bar' } })
    t.equal(str, '(on bar)')
  })

  t.test('works with only `name` & `pid` present', async t => {
    const str = prettifyMetadata({ log: { name: 'foo', pid: '1234' } })
    t.equal(str, '(foo/1234)')
  })

  t.test('works with only `name` & `hostname` present', async t => {
    const str = prettifyMetadata({ log: { name: 'foo', hostname: 'bar' } })
    t.equal(str, '(foo on bar)')
  })

  t.test('works with only `pid` & `hostname` present', async t => {
    const str = prettifyMetadata({ log: { pid: '1234', hostname: 'bar' } })
    t.equal(str, '(1234 on bar)')
  })

  t.test('works with only `name`, `pid`, & `hostname` present', async t => {
    const str = prettifyMetadata({ log: { name: 'foo', pid: '1234', hostname: 'bar' } })
    t.equal(str, '(foo/1234 on bar)')
  })

  t.test('works with only `name` & `caller` present', async t => {
    const str = prettifyMetadata({ log: { name: 'foo', caller: 'baz' } })
    t.equal(str, '(foo) <baz>')
  })

  t.test('works with only `pid` & `caller` present', async t => {
    const str = prettifyMetadata({ log: { pid: '1234', caller: 'baz' } })
    t.equal(str, '(1234) <baz>')
  })

  t.test('works with only `hostname` & `caller` present', async t => {
    const str = prettifyMetadata({ log: { hostname: 'bar', caller: 'baz' } })
    t.equal(str, '(on bar) <baz>')
  })

  t.test('works with only `name`, `pid`, & `caller` present', async t => {
    const str = prettifyMetadata({ log: { name: 'foo', pid: '1234', caller: 'baz' } })
    t.equal(str, '(foo/1234) <baz>')
  })

  t.test('works with only `name`, `hostname`, & `caller` present', async t => {
    const str = prettifyMetadata({ log: { name: 'foo', hostname: 'bar', caller: 'baz' } })
    t.equal(str, '(foo on bar) <baz>')
  })

  t.test('works with only `caller` present', async t => {
    const str = prettifyMetadata({ log: { caller: 'baz' } })
    t.equal(str, '<baz>')
  })

  t.test('works with only `pid`, `hostname`, & `caller` present', async t => {
    const str = prettifyMetadata({ log: { pid: '1234', hostname: 'bar', caller: 'baz' } })
    t.equal(str, '(1234 on bar) <baz>')
  })

  t.test('works with all four present', async t => {
    const str = prettifyMetadata({ log: { name: 'foo', pid: '1234', hostname: 'bar', caller: 'baz' } })
    t.equal(str, '(foo/1234 on bar) <baz>')
  })

  t.end()
})

tap.test('prettifyObject', t => {
  const { prettifyObject } = utils

  t.test('returns empty string if no properties present', async t => {
    const str = prettifyObject({ input: {} })
    t.equal(str, '')
  })

  t.test('works with single level properties', async t => {
    const str = prettifyObject({ input: { foo: 'bar' } })
    t.equal(str, '    foo: "bar"\n')
  })

  t.test('works with multiple level properties', async t => {
    const str = prettifyObject({ input: { foo: { bar: 'baz' } } })
    t.equal(str, '    foo: {\n      "bar": "baz"\n    }\n')
  })

  t.test('skips specified keys', async t => {
    const str = prettifyObject({ input: { foo: 'bar', hello: 'world' }, skipKeys: ['foo'] })
    t.equal(str, '    hello: "world"\n')
  })

  t.test('ignores predefined keys', async t => {
    const str = prettifyObject({ input: { foo: 'bar', pid: 12345 } })
    t.equal(str, '    foo: "bar"\n')
  })

  t.test('works with error props', async t => {
    const err = Error('Something went wrong')
    const serializedError = {
      message: err.message,
      stack: err.stack
    }
    const str = prettifyObject({ input: { error: serializedError } })
    t.ok(str.startsWith('    error:'))
    t.ok(str.includes('     "message": "Something went wrong",'))
    t.ok(str.includes('         Error: Something went wrong'))
  })

  t.end()
})

tap.test('prettifyTime', t => {
  const { prettifyTime } = utils

  t.test('returns `undefined` if `time` or `timestamp` not in log', async t => {
    const str = prettifyTime({ log: {} })
    t.equal(str, undefined)
  })

  t.test('returns prettified formatted time from custom field', async t => {
    const log = { customtime: 1554642900000 }
    let str = prettifyTime({ log, translateFormat: true, timestampKey: 'customtime' })
    t.equal(str, '[2019-04-07 13:15:00.000 +0000]')

    str = prettifyTime({ log, translateFormat: false, timestampKey: 'customtime' })
    t.equal(str, '[1554642900000]')
  })

  t.test('returns prettified formatted time', async t => {
    let log = { time: 1554642900000 }
    let str = prettifyTime({ log, translateFormat: true })
    t.equal(str, '[2019-04-07 13:15:00.000 +0000]')

    log = { timestamp: 1554642900000 }
    str = prettifyTime({ log, translateFormat: true })
    t.equal(str, '[2019-04-07 13:15:00.000 +0000]')

    log = { time: '2019-04-07T09:15:00.000-04:00' }
    str = prettifyTime({ log, translateFormat: true })
    t.equal(str, '[2019-04-07 13:15:00.000 +0000]')

    log = { timestamp: '2019-04-07T09:15:00.000-04:00' }
    str = prettifyTime({ log, translateFormat: true })
    t.equal(str, '[2019-04-07 13:15:00.000 +0000]')

    log = { time: 1554642900000 }
    str = prettifyTime({ log, translateFormat: 'd mmm yyyy H:MM' })
    t.equal(str, '[7 Apr 2019 13:15]')

    log = { timestamp: 1554642900000 }
    str = prettifyTime({ log, translateFormat: 'd mmm yyyy H:MM' })
    t.equal(str, '[7 Apr 2019 13:15]')

    log = { time: '2019-04-07T09:15:00.000-04:00' }
    str = prettifyTime({ log, translateFormat: 'd mmm yyyy H:MM' })
    t.equal(str, '[7 Apr 2019 13:15]')

    log = { timestamp: '2019-04-07T09:15:00.000-04:00' }
    str = prettifyTime({ log, translateFormat: 'd mmm yyyy H:MM' })
    t.equal(str, '[7 Apr 2019 13:15]')
  })

  t.test('passes through value', async t => {
    let log = { time: 1554642900000 }
    let str = prettifyTime({ log })
    t.equal(str, '[1554642900000]')

    log = { timestamp: 1554642900000 }
    str = prettifyTime({ log })
    t.equal(str, '[1554642900000]')

    log = { time: '2019-04-07T09:15:00.000-04:00' }
    str = prettifyTime({ log })
    t.equal(str, '[2019-04-07T09:15:00.000-04:00]')

    log = { timestamp: '2019-04-07T09:15:00.000-04:00' }
    str = prettifyTime({ log })
    t.equal(str, '[2019-04-07T09:15:00.000-04:00]')
  })

  t.test('handles the 0 timestamp', async t => {
    let log = { time: 0 }
    let str = prettifyTime({ log })
    t.equal(str, '[0]')

    log = { timestamp: 0 }
    str = prettifyTime({ log })
    t.equal(str, '[0]')
  })

  t.test('works with epoch as a number or string', (t) => {
    t.plan(3)
    const epoch = 1522431328992
    const asNumber = prettifyTime({
      log: { time: epoch, msg: 'foo' },
      translateFormat: true
    })
    const asString = prettifyTime({
      log: { time: `${epoch}`, msg: 'foo' },
      translateFormat: true
    })
    const invalid = prettifyTime({
      log: { time: '2 days ago', msg: 'foo' },
      translateFormat: true
    })
    t.same(asString, '[2018-03-30 17:35:28.992 +0000]')
    t.same(asNumber, '[2018-03-30 17:35:28.992 +0000]')
    t.same(invalid, '[2 days ago]')
  })

  t.end()
})

tap.test('#filterLog', t => {
  const { filterLog } = utils
  const logData = {
    level: 30,
    time: 1522431328992,
    data1: {
      data2: { 'data-3': 'bar' }
    }
  }

  t.test('filterLog removes single entry', async t => {
    const result = filterLog(logData, ['data1.data2.data-3'])
    t.same(result, { level: 30, time: 1522431328992, data1: { data2: { } } })
  })

  t.test('filterLog removes multiple entries', async t => {
    const result = filterLog(logData, ['time', 'data1'])
    t.same(result, { level: 30 })
  })

  const logData2 = Object.assign({
    'logging.domain.corp/operation': {
      id: 'foo',
      producer: 'bar'
    }
  }, logData)

  t.test('filterLog removes entry with escape sequence', async t => {
    const result = filterLog(logData2, ['data1', 'logging\\.domain\\.corp/operation'])
    t.same(result, { level: 30, time: 1522431328992 })
  })

  t.test('filterLog removes entry with escape sequence nested', async t => {
    const result = filterLog(logData2, ['data1', 'logging\\.domain\\.corp/operation.producer'])
    t.same(result, { level: 30, time: 1522431328992, 'logging.domain.corp/operation': { id: 'foo' } })
  })

  t.end()
})

tap.test('#filterLog with circular references', t => {
  const { filterLog } = utils
  const logData = {
    level: 30,
    time: 1522431328992,
    data1: 'test'
  }
  logData.circular = logData

  t.test('filterLog removes single entry', async t => {
    const result = filterLog(logData, ['data1'])

    t.same(result.circular.level, result.level)
    t.same(result.circular.time, result.time)

    delete result.circular
    t.same(result, { level: 30, time: 1522431328992 })
  })

  t.end()
})

tap.test('buildSafeSonicBoom', t => {
  const { buildSafeSonicBoom } = utils

  function noop () {}

  const file = () => {
    const dest = join(__dirname, `${process.pid}-${process.hrtime().toString()}`)
    const fd = fs.openSync(dest, 'w')
    return { dest, fd }
  }

  t.test('should not write when error emitted and code is "EPIPE"', async t => {
    t.plan(1)

    const { fd, dest } = file()
    const stream = buildSafeSonicBoom({ sync: true, fd, mkdir: true })
    t.teardown(() => rimraf(dest, noop))

    stream.emit('error', { code: 'EPIPE' })
    stream.write('will not work')

    const dataFile = fs.readFileSync(dest)
    t.equal(dataFile.length, 0)
  })

  t.test('should stream.write works when error code is not "EPIPE"', async t => {
    t.plan(3)
    const { fd, dest } = file()
    const stream = buildSafeSonicBoom({ sync: true, fd, mkdir: true })

    t.teardown(() => rimraf(dest, noop))

    stream.on('error', () => t.pass('error emitted'))

    stream.emit('error', 'fake error description')

    t.ok(stream.write('will work'))

    const dataFile = fs.readFileSync(dest)
    t.equal(dataFile.toString(), 'will work')
  })

  t.end()
})
