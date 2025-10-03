'use strict'

const { test } = require('tap')
const { join } = require('path')
const { fork } = require('child_process')
const { once } = require('./helper')
const writer = require('flush-write-stream')

test('do not use SonicBoom is someone tampered with process.stdout.write', async ({ not }) => {
  let actual = ''
  const child = fork(join(__dirname, 'fixtures', 'stdout-hack-protection.js'), { silent: true })

  child.stdout.pipe(writer((s, enc, cb) => {
    actual += s
    cb()
  }))
  await once(child, 'close')
  not(actual.match(/^hack/), null)
})
