'use strict'

const { Writable } = require('stream')
const { test } = require('tap')
const { join } = require('path')
const execa = require('execa')
const writer = require('flush-write-stream')
const { once } = require('./helper')
const pino = require('../')
const strip = require('strip-ansi')

test('can be enabled via exported pino function', async ({ not }) => {
  let actual = ''
  const child = execa(process.argv[0], [join(__dirname, 'fixtures', 'pretty', 'basic.js')])

  child.stdout.pipe(writer((s, enc, cb) => {
    actual += s
    cb()
  }))
  await once(child, 'close')
  not(strip(actual).match(/\(123456 on abcdefghijklmnopqr\): h/), null)
})

test('can be enabled via exported pino function with pretty configuration', async ({ not }) => {
  let actual = ''
  const child = execa(process.argv[0], [join(__dirname, 'fixtures', 'pretty', 'level-first.js')])

  child.stdout.pipe(writer((s, enc, cb) => {
    actual += s
    cb()
  }))
  await once(child, 'close')
  not(strip(actual).match(/^INFO.*h/), null)
})

test('can be enabled via exported pino function with prettifier', async ({ not }) => {
  let actual = ''
  const child = execa(process.argv[0], [join(__dirname, 'fixtures', 'pretty', 'pretty-factory.js')])

  child.stdout.pipe(writer((s, enc, cb) => {
    actual += s
    cb()
  }))

  await once(child, 'close')
  not(strip(actual).match(/^INFO.*h/), null)
})

test('does not throw error when enabled with stream specified', async ({ doesNotThrow }) => {
  doesNotThrow(() => pino({ prettyPrint: true }, process.stdout))
})

test('throws when prettyPrint is true but pino-pretty module is not installed', async ({ throws }) => {
  // pino pretty *is* installed, and probably also cached, so rather than
  // messing with the filesystem the simplest way to generate a not found
  // error is to simulate it:
  const pinoPretty = require('pino-pretty')
  require.cache[require.resolve('pino-pretty')].exports = () => {
    throw Error('Cannot find module \'pino-pretty\'')
  }
  throws(() => pino({ prettyPrint: true }), 'Missing `pino-pretty` module: `pino-pretty` must be installed separately')
  require.cache[require.resolve('pino-pretty')].exports = pinoPretty
})

test('support older pino-pretty', async ({ doesNotThrow }) => {
  // pino pretty *is* installed, and probably also cached, so rather than
  // messing with the filesystem the simplest way to generate a not found
  // error is to simulate it:
  const pinoPretty = require('pino-pretty')
  const prettyFactory = pinoPretty.prettyFactory
  pinoPretty.prettyFactory = undefined
  require.cache[require.resolve('pino-pretty')].exports = prettyFactory

  doesNotThrow(() => pino({ prettyPrint: true }))

  delete require.cache[require.resolve('pino-pretty')]
})

test('throws when prettyPrint has invalid options', async ({ throws }) => {
  throws(() => pino({ prettyPrint: { ignore: ['hostname'] } }), 'opts.ignore.split is not a function')
})

test('can send pretty print to custom stream', async ({ equal }) => {
  const dest = new Writable({
    objectMode: true,
    write (formatted, enc) {
      equal(/^INFO.*foo\n$/.test(formatted), true)
    }
  })

  const log = pino({
    prettifier: require('pino-pretty'),
    prettyPrint: {
      levelFirst: true,
      colorize: false
    }
  }, dest)
  log.info('foo')
})

test('ignores `undefined` from prettifier', async ({ equal }) => {
  let actual = ''
  const child = execa(process.argv[0], [join(__dirname, 'fixtures', 'pretty', 'skipped-output.js')])

  child.stdout.pipe(writer((s, enc) => {
    actual += s
  }))

  await once(child, 'close')
  equal(actual, '')
})

test('parses and outputs chindings', async ({ equal, not }) => {
  let actual = ''
  const child = execa(process.argv[0], [join(__dirname, 'fixtures', 'pretty', 'child.js')])

  child.stdout.pipe(writer((s, enc, cb) => {
    actual += s
    cb()
  }))
  await once(child, 'close')
  not(strip(actual).match(/\(123456 on abcdefghijklmnopqr\): h/), null)
  not(strip(actual).match(/\(123456 on abcdefghijklmnopqr\): h2/), null)
  not(strip(actual).match(/a: 1/), null)
  not(strip(actual).match(/b: 2/), null)
  equal(strip(actual).match(/a: 1/g).length, 3)
})

test('applies updated chindings', async ({ not }) => {
  let actual = ''
  const child = execa(process.argv[0], [join(__dirname, 'fixtures', 'pretty', 'child-with-updated-chindings.js')])

  child.stdout.pipe(writer((s, enc, cb) => {
    actual += s
    cb()
  }))
  await once(child, 'close')
  not(strip(actual).match(/foo: 123/), null)
  not(strip(actual).match(/foo: 456/), null)
  not(strip(actual).match(/bar: 789/), null)
})

test('applies formatters', async ({ not }) => {
  let actual = ''
  const child = execa(process.argv[0], [join(__dirname, 'fixtures', 'pretty', 'formatters.js')])

  child.stdout.pipe(writer((s, enc, cb) => {
    actual += s
    cb()
  }))
  await once(child, 'close')
  not(strip(actual).match(/\(123456 on abcdefghijklmnopqr\): h/), null)
  not(strip(actual).match(/foo: "formatted_bar"/), null)
})

test('parses and outputs chindings with serializer', async ({ equal, not }) => {
  let actual = ''
  const child = execa(process.argv[0], [join(__dirname, 'fixtures', 'pretty', 'child-with-serializer.js')])

  child.stdout.pipe(writer((s, enc, cb) => {
    actual += s
    cb()
  }))
  await once(child, 'close')
  not(strip(actual).match(/\(123456 on abcdefghijklmnopqr\): h/), null)
  not(strip(actual).match(/\(123456 on abcdefghijklmnopqr\): h2/), null)
  not(strip(actual).match(/\(123456 on abcdefghijklmnopqr\): h3/), null)
  not(strip(actual).match(/\(123456 on abcdefghijklmnopqr\): h4/), null)
  not(strip(actual).match(/a: 2/), null)
  not(strip(actual).match(/a: 16/), null)
  not(strip(actual).match(/a: 42/), null)
  equal(strip(actual).match(/a: /g).length, 4)
})

test('applies serializers', async ({ not }) => {
  let actual = ''
  const child = execa(process.argv[0], [join(__dirname, 'fixtures', 'pretty', 'serializers.js')])

  child.stdout.pipe(writer((s, enc, cb) => {
    actual += s
    cb()
  }))
  await once(child, 'close')
  not(strip(actual).match(/\(123456 on abcdefghijklmnopqr\): h/), null)
  not(strip(actual).match(/foo: "bar"/), null)
})

test('applies redaction rules', async ({ equal, not }) => {
  let actual = ''
  const child = execa(process.argv[0], [join(__dirname, 'fixtures', 'pretty', 'redact.js')])

  child.stdout.pipe(writer((s, enc, cb) => {
    actual += s
    cb()
  }))
  await once(child, 'close')
  not(strip(actual).match(/\(123456 on abcdefghijklmnopqr\): h/), null)
  not(strip(actual).match(/\[Redacted\]/), null)
  equal(strip(actual).match(/object/), null)
})

test('dateformat', async ({ not }) => {
  let actual = ''
  const child = execa(process.argv[0], [join(__dirname, 'fixtures', 'pretty', 'dateformat.js')])

  child.stdout.pipe(writer((s, enc, cb) => {
    actual += s
    cb()
  }))
  await once(child, 'close')
  not(strip(actual).match(/\(123456 on abcdefghijklmnopqr\): h/), null)
})

test('without timestamp', async ({ not }) => {
  let actual = ''
  const child = execa(process.argv[0], [join(__dirname, 'fixtures', 'pretty', 'no-time.js')])

  child.stdout.pipe(writer((s, enc, cb) => {
    actual += s
    cb()
  }))
  await once(child, 'close')
  not(strip(actual).slice(2), '[]')
})

test('with custom timestamp', async ({ equal }) => {
  let actual = ''
  const child = execa(process.argv[0], [join(__dirname, 'fixtures', 'pretty', 'custom-time.js')])

  child.stdout.pipe(writer((s, enc, cb) => {
    actual += s
    cb()
  }))
  await once(child, 'close')
  equal(strip(actual).slice(0, 6), '[test]')
})

test('with custom timestamp label', async ({ equal }) => {
  let actual = ''
  const child = execa(process.argv[0], [join(__dirname, 'fixtures', 'pretty', 'custom-time-label.js')])

  child.stdout.pipe(writer((s, enc, cb) => {
    actual += s
    cb()
  }))
  await once(child, 'close')
  equal(strip(actual).slice(0, 6), '[test]')
})

test('errors', async ({ not }) => {
  let actual = ''
  const child = execa(process.argv[0], [join(__dirname, 'fixtures', 'pretty', 'error.js')])

  child.stdout.pipe(writer((s, enc, cb) => {
    actual += s
    cb()
  }))
  await once(child, 'close')
  not(strip(actual).match(/\(123456 on abcdefghijklmnopqr\): kaboom/), null)
  not(strip(actual).match(/\(123456 on abcdefghijklmnopqr\): with a message/), null)
  not(strip(actual).match(/.*error\.js.*/), null)
})

test('errors with props', async ({ not }) => {
  let actual = ''
  const child = execa(process.argv[0], [join(__dirname, 'fixtures', 'pretty', 'error-props.js')])

  child.stdout.pipe(writer((s, enc, cb) => {
    actual += s
    cb()
  }))
  await once(child, 'close')
  not(strip(actual).match(/\(123456 on abcdefghijklmnopqr\): kaboom/), null)
  not(strip(actual).match(/code: ENOENT/), null)
  not(strip(actual).match(/errno: 1/), null)
  not(strip(actual).match(/.*error-props\.js.*/), null)
})

test('final works with pretty', async ({ not }) => {
  let actual = ''
  const child = execa(process.argv[0], [join(__dirname, 'fixtures', 'pretty', 'final.js')])

  child.stdout.pipe(writer((s, enc, cb) => {
    actual += s
    cb()
  }))
  await once(child, 'close')
  not(strip(actual).match(/WARN\s+\(123456 on abcdefghijklmnopqr\): pino.final with prettyPrint does not support flushing/), null)
  not(strip(actual).match(/INFO\s+\(123456 on abcdefghijklmnopqr\): beforeExit/), null)
})

test('final works when returning a logger', async ({ not }) => {
  let actual = ''
  const child = execa(process.argv[0], [join(__dirname, 'fixtures', 'pretty', 'final-return.js')])

  child.stdout.pipe(writer((s, enc, cb) => {
    actual += s
    cb()
  }))
  await once(child, 'close')
  not(strip(actual).match(/WARN\s+\(123456 on abcdefghijklmnopqr\): pino.final with prettyPrint does not support flushing/), null)
  not(strip(actual).match(/INFO\s+\(123456 on abcdefghijklmnopqr\): after/), null)
})

test('final works without prior logging', async ({ not }) => {
  let actual = ''
  const child = execa(process.argv[0], [join(__dirname, 'fixtures', 'pretty', 'final-no-log-before.js')])

  child.stdout.pipe(writer((s, enc, cb) => {
    actual += s
    cb()
  }))
  await once(child, 'close')
  not(strip(actual).match(/WARN\s*: pino.final with prettyPrint does not support flushing/), null)
  not(strip(actual).match(/INFO\s*\(123456 on abcdefghijklmnopqr\): beforeExit/), null)
})

test('suppress flush sync warning when corresponding option is specified', async ({ equal }) => {
  let actual = ''
  const child = execa(process.argv[0], [join(__dirname, 'fixtures', 'pretty', 'suppress-flush-sync-warning.js')])

  child.stdout.pipe(writer((s, enc, cb) => {
    actual += s
    cb()
  }))
  await once(child, 'close')
  equal(strip(actual).match(/WARN\s+\(123456 on abcdefghijklmnopqr\): pino.final with prettyPrint does not support flushing/), null)
})

test('works as expected with an object with the msg prop', async ({ not }) => {
  let actual = ''
  const child = execa(process.argv[0], [join(__dirname, 'fixtures', 'pretty', 'obj-msg-prop.js')])

  child.stdout.pipe(writer((s, enc, cb) => {
    actual += s
    cb()
  }))
  await once(child, 'close')
  not(strip(actual).match(/\(123456 on abcdefghijklmnopqr\): hello/), null)
})

test('should not lose stream metadata for streams with `needsMetadataGsym` flag', async ({ not }) => {
  const dest = new Writable({
    objectMode: true,
    write () {
      not(typeof this.lastLevel === 'undefined', true)
      not(typeof this.lastMsg === 'undefined', true)
      not(typeof this.lastObj === 'undefined', true)
      not(typeof this.lastTime === 'undefined', true)
      not(typeof this.lastLogger === 'undefined', true)
    }
  })

  dest[pino.symbols.needsMetadataGsym] = true

  const log = pino({
    prettyPrint: true
  }, dest)
  log.info('foo')
})

test('should not add stream metadata for streams without `needsMetadataGsym` flag', async ({ equal }) => {
  const dest = new Writable({
    objectMode: true,
    write () {
      equal(typeof this.lastLevel === 'undefined', true)
      equal(typeof this.lastMsg === 'undefined', true)
      equal(typeof this.lastObj === 'undefined', true)
      equal(typeof this.lastTime === 'undefined', true)
      equal(typeof this.lastLogger === 'undefined', true)
    }
  })

  const log = pino({
    prettyPrint: true
  }, dest)
  log.info('foo')
})
