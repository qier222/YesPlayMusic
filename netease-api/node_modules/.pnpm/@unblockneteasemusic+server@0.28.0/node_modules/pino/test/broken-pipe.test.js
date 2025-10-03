'use strict'

const t = require('tap')
const { join } = require('path')
const { fork } = require('child_process')
const { once } = require('./helper')
const pino = require('..')

function test (file) {
  file = join('fixtures', 'broken-pipe', file)
  t.test(file, { parallel: true }, async ({ equal }) => {
    const child = fork(join(__dirname, file), { silent: true })
    child.stdout.destroy()

    child.stderr.pipe(process.stdout)

    const res = await once(child, 'close')
    equal(res, 0) // process exits successfully
  })
}

t.jobs = 42

test('basic.js')
test('destination.js')
test('syncfalse.js')

t.test('let error pass through', ({ equal, plan }) => {
  plan(3)
  const stream = pino.destination()

  // side effect of the pino constructor is that it will set an
  // event handler for error
  pino(stream)

  process.nextTick(() => stream.emit('error', new Error('kaboom')))
  process.nextTick(() => stream.emit('error', new Error('kaboom')))

  stream.on('error', (err) => {
    equal(err.message, 'kaboom')
  })
})
