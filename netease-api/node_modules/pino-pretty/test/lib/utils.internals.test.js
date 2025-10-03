'use strict'

const tap = require('tap')
const clone = require('rfdc')()
const stringifySafe = require('fast-safe-stringify')
const { internals } = require('../../lib/utils')

tap.test('#joinLinesWithIndentation', t => {
  t.test('joinLinesWithIndentation adds indentation to beginning of subsequent lines', async t => {
    const input = 'foo\nbar\nbaz'
    const result = internals.joinLinesWithIndentation({ input })
    t.equal(result, 'foo\n    bar\n    baz')
  })

  t.test('joinLinesWithIndentation accepts custom indentation, line breaks, and eol', async t => {
    const input = 'foo\nbar\r\nbaz'
    const result = internals.joinLinesWithIndentation({ input, ident: '  ', eol: '^' })
    t.equal(result, 'foo^  bar^  baz')
  })

  t.end()
})

tap.test('#formatTime', t => {
  const dateStr = '2019-04-06T13:30:00.000-04:00'
  const epoch = new Date(dateStr)
  const epochMS = epoch.getTime()

  t.test('passes through epoch if `translateTime` is `false`', async t => {
    const formattedTime = internals.formatTime(epochMS)
    t.equal(formattedTime, epochMS)
  })

  t.test('translates epoch milliseconds if `translateTime` is `true`', async t => {
    const formattedTime = internals.formatTime(epochMS, true)
    t.equal(formattedTime, '2019-04-06 17:30:00.000 +0000')
  })

  t.test('translates epoch milliseconds to UTC string given format', async t => {
    const formattedTime = internals.formatTime(epochMS, 'd mmm yyyy H:MM')
    t.equal(formattedTime, '6 Apr 2019 17:30')
  })

  t.test('translates epoch milliseconds to SYS:STANDARD', async t => {
    const formattedTime = internals.formatTime(epochMS, 'SYS:STANDARD')
    t.match(formattedTime, /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} [-+]?\d{4}/)
  })

  t.test('translates epoch milliseconds to SYS:<FORMAT>', async t => {
    const formattedTime = internals.formatTime(epochMS, 'SYS:d mmm yyyy H:MM')
    t.match(formattedTime, /\d{1} \w{3} \d{4} \d{1,2}:\d{2}/)
  })

  t.test('passes through date string if `translateTime` is `false`', async t => {
    const formattedTime = internals.formatTime(dateStr)
    t.equal(formattedTime, dateStr)
  })

  t.test('translates date string if `translateTime` is `true`', async t => {
    const formattedTime = internals.formatTime(dateStr, true)
    t.equal(formattedTime, '2019-04-06 17:30:00.000 +0000')
  })

  t.test('translates date string to UTC string given format', async t => {
    const formattedTime = internals.formatTime(dateStr, 'd mmm yyyy H:MM')
    t.equal(formattedTime, '6 Apr 2019 17:30')
  })

  t.test('translates date string to SYS:STANDARD', async t => {
    const formattedTime = internals.formatTime(dateStr, 'SYS:STANDARD')
    t.match(formattedTime, /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} [-+]?\d{4}/)
  })

  t.test('translates date string to UTC:<FORMAT>', async t => {
    const formattedTime = internals.formatTime(dateStr, 'UTC:d mmm yyyy H:MM')
    t.equal(formattedTime, '6 Apr 2019 17:30')
  })

  t.test('translates date string to SYS:<FORMAT>', async t => {
    const formattedTime = internals.formatTime(dateStr, 'SYS:d mmm yyyy H:MM')
    t.match(formattedTime, /\d{1} \w{3} \d{4} \d{1,2}:\d{2}/)
  })

  t.end()
})

tap.test('#createDate', t => {
  const wanted = 1624450038567

  t.test('accepts arguments the Date constructor would accept', async t => {
    t.plan(2)
    t.same(internals.createDate(1624450038567).getTime(), wanted)
    t.same(internals.createDate('2021-06-23T12:07:18.567Z').getTime(), wanted)
  })

  t.test('accepts epoch as a string', async t => {
    // If Date() accepts this argument, the createDate function is not needed
    // and can be replaced with Date()
    t.plan(2)
    t.notSame(new Date('16244500385-67').getTime(), wanted)
    t.same(internals.createDate('1624450038567').getTime(), wanted)
  })

  t.end()
})

tap.test('#isValidDate', t => {
  t.test('returns true for valid dates', async t => {
    t.same(internals.isValidDate(new Date()), true)
  })

  t.test('returns false for non-dates and invalid dates', async t => {
    t.plan(2)
    t.same(internals.isValidDate('20210621'), false)
    t.same(internals.isValidDate(new Date('2021-41-99')), false)
  })

  t.end()
})

tap.test('#prettifyError', t => {
  t.test('prettifies error', t => {
    const error = Error('Bad error!')
    const lines = stringifySafe(error, Object.getOwnPropertyNames(error), 2)

    const prettyError = internals.prettifyError({ keyName: 'errorKey', lines, ident: '    ', eol: '\n' })
    t.match(prettyError, /\s*errorKey: {\n\s*"stack":[\s\S]*"message": "Bad error!"/)
    t.end()
  })

  t.end()
})

tap.test('#deleteLogProperty', t => {
  const logData = {
    level: 30,
    data1: {
      data2: { 'data-3': 'bar' }
    }
  }

  t.test('deleteLogProperty deletes property of depth 1', async t => {
    const log = clone(logData)
    internals.deleteLogProperty(log, 'data1')
    t.same(log, { level: 30 })
  })

  t.test('deleteLogProperty deletes property of depth 2', async t => {
    const log = clone(logData)
    internals.deleteLogProperty(log, 'data1.data2')
    t.same(log, { level: 30, data1: { } })
  })

  t.test('deleteLogProperty deletes property of depth 3', async t => {
    const log = clone(logData)
    internals.deleteLogProperty(log, 'data1.data2.data-3')
    t.same(log, { level: 30, data1: { data2: { } } })
  })

  t.end()
})

tap.test('#splitIgnoreKey', t => {
  t.test('splitIgnoreKey does not change key', async t => {
    const result = internals.splitIgnoreKey('data1')
    t.same(result, ['data1'])
  })

  t.test('splitIgnoreKey splits nested key', async t => {
    const result = internals.splitIgnoreKey('data1.data2.data-3')
    t.same(result, ['data1', 'data2', 'data-3'])
  })

  t.test('splitIgnoreKey splits nested keys ending with a dot', async t => {
    const result = internals.splitIgnoreKey('data1.data2.data-3.')
    t.same(result, ['data1', 'data2', 'data-3'])
  })

  t.test('splitIgnoreKey splits nested escaped key', async t => {
    const result = internals.splitIgnoreKey('logging\\.domain\\.corp/operation.foo.bar-2')
    t.same(result, ['logging.domain.corp/operation', 'foo', 'bar-2'])
  })

  t.test('splitIgnoreKey splits nested escaped key with special characters', async t => {
    const result = internals.splitIgnoreKey('logging\\.domain\\.corp/operation.!\t@#$%^&*()_+=-<>.bar\\.2')
    t.same(result, ['logging.domain.corp/operation', '!\t@#$%^&*()_+=-<>', 'bar.2'])
  })

  t.end()
})
