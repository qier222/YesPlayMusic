'use strict'

const { test, teardown } = require('tap')
const { join } = require('path')
const { fork } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const proxyquire = require('proxyquire')
const SonicBoom = require('.')

const files = []
let count = 0

function file () {
  const file = path.join(os.tmpdir(), `sonic-boom-${process.pid}-${process.hrtime().toString()}-${count++}`)
  files.push(file)
  return file
}

teardown(() => {
  files.forEach((file) => {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file)
      }
    } catch (e) {
      console.log(e)
    }
  })
})

test('sync false', (t) => {
  buildTests(t.test, false)
  t.end()
})

test('sync true', (t) => {
  buildTests(t.test, true)
  t.end()
})

function buildTests (test, sync) {
  test('write things to a file descriptor', (t) => {
    t.plan(6)

    const dest = file()
    const fd = fs.openSync(dest, 'w')
    const stream = new SonicBoom({ fd, sync })

    stream.on('ready', () => {
      t.pass('ready emitted')
    })

    t.ok(stream.write('hello world\n'))
    t.ok(stream.write('something else\n'))

    stream.end()

    stream.on('finish', () => {
      fs.readFile(dest, 'utf8', (err, data) => {
        t.error(err)
        t.equal(data, 'hello world\nsomething else\n')
      })
    })
    stream.on('close', () => {
      t.pass('close emitted')
    })
  })

  test('write things in a streaming fashion', (t) => {
    t.plan(8)

    const dest = file()
    const fd = fs.openSync(dest, 'w')
    const stream = new SonicBoom({ fd, sync })

    stream.once('drain', () => {
      fs.readFile(dest, 'utf8', (err, data) => {
        t.error(err)
        t.equal(data, 'hello world\n')
        t.ok(stream.write('something else\n'))
      })

      stream.once('drain', () => {
        fs.readFile(dest, 'utf8', (err, data) => {
          t.error(err)
          t.equal(data, 'hello world\nsomething else\n')
          stream.end()
        })
      })
    })

    t.ok(stream.write('hello world\n'))

    stream.on('finish', () => {
      t.pass('finish emitted')
    })
    stream.on('close', () => {
      t.pass('close emitted')
    })
  })

  test('can be piped into', (t) => {
    t.plan(4)

    const dest = file()
    const fd = fs.openSync(dest, 'w')
    const stream = new SonicBoom({ fd, sync })
    const source = fs.createReadStream(__filename)

    source.pipe(stream)

    stream.on('finish', () => {
      fs.readFile(__filename, 'utf8', (err, expected) => {
        t.error(err)
        fs.readFile(dest, 'utf8', (err, data) => {
          t.error(err)
          t.equal(data, expected)
        })
      })
    })
    stream.on('close', () => {
      t.pass('close emitted')
    })
  })

  test('write things to a file', (t) => {
    t.plan(6)

    const dest = file()
    const stream = new SonicBoom({ dest, sync })

    stream.on('ready', () => {
      t.pass('ready emitted')
    })

    t.ok(stream.write('hello world\n'))
    t.ok(stream.write('something else\n'))

    stream.end()

    stream.on('finish', () => {
      fs.readFile(dest, 'utf8', (err, data) => {
        t.error(err)
        t.equal(data, 'hello world\nsomething else\n')
      })
    })
    stream.on('close', () => {
      t.pass('close emitted')
    })
  })

  test('flushSync', (t) => {
    t.plan(4)

    const dest = file()
    const fd = fs.openSync(dest, 'w')
    const stream = new SonicBoom({ fd, minLength: 4096, sync })

    t.ok(stream.write('hello world\n'))
    t.ok(stream.write('something else\n'))

    stream.flushSync()

    // let the file system settle down things
    setImmediate(function () {
      stream.end()
      const data = fs.readFileSync(dest, 'utf8')
      t.equal(data, 'hello world\nsomething else\n')

      stream.on('close', () => {
        t.pass('close emitted')
      })
    })
  })

  test('destroy', (t) => {
    t.plan(5)

    const dest = file()
    const fd = fs.openSync(dest, 'w')
    const stream = new SonicBoom({ fd, sync })

    t.ok(stream.write('hello world\n'))
    stream.destroy()
    t.throws(() => { stream.write('hello world\n') })

    fs.readFile(dest, 'utf8', function (err, data) {
      t.error(err)
      t.equal(data, 'hello world\n')
    })

    stream.on('finish', () => {
      t.fail('finish emitted')
    })

    stream.on('close', () => {
      t.pass('close emitted')
    })
  })

  test('destroy while opening', (t) => {
    t.plan(1)

    const dest = file()
    const stream = new SonicBoom({ dest })

    stream.destroy()
    stream.on('close', () => {
      t.pass('close emitted')
    })
  })

  test('minLength', (t) => {
    t.plan(8)

    const dest = file()
    const stream = new SonicBoom({ dest, minLength: 4096, sync })

    stream.on('ready', () => {
      t.pass('ready emitted')
    })

    t.ok(stream.write('hello world\n'))
    t.ok(stream.write('something else\n'))

    const fail = t.fail
    stream.on('drain', fail)

    // bad use of timer
    // TODO refactor
    setTimeout(function () {
      fs.readFile(dest, 'utf8', (err, data) => {
        t.error(err)
        t.equal(data, '')

        stream.end()

        stream.on('finish', () => {
          fs.readFile(dest, 'utf8', (err, data) => {
            t.error(err)
            t.equal(data, 'hello world\nsomething else\n')
          })
        })
      })
    }, 100)

    stream.on('close', () => {
      t.pass('close emitted')
    })
  })

  test('flush', (t) => {
    t.plan(5)

    const dest = file()
    const fd = fs.openSync(dest, 'w')
    const stream = new SonicBoom({ fd, minLength: 4096, sync })

    stream.on('ready', () => {
      t.pass('ready emitted')
    })

    t.ok(stream.write('hello world\n'))
    t.ok(stream.write('something else\n'))

    stream.flush()

    stream.on('drain', () => {
      fs.readFile(dest, 'utf8', (err, data) => {
        t.error(err)
        t.equal(data, 'hello world\nsomething else\n')
        stream.end()
      })
    })
  })

  test('reopen', (t) => {
    t.plan(9)

    const dest = file()
    const stream = new SonicBoom({ dest, sync })

    t.ok(stream.write('hello world\n'))
    t.ok(stream.write('something else\n'))

    const after = dest + '-moved'

    stream.once('drain', () => {
      t.pass('drain emitted')

      fs.renameSync(dest, after)
      stream.reopen()

      stream.once('ready', () => {
        t.pass('ready emitted')
        t.ok(stream.write('after reopen\n'))

        stream.on('drain', () => {
          fs.readFile(after, 'utf8', (err, data) => {
            t.error(err)
            t.equal(data, 'hello world\nsomething else\n')
            fs.readFile(dest, 'utf8', (err, data) => {
              t.error(err)
              t.equal(data, 'after reopen\n')
              stream.end()
            })
          })
        })
      })
    })
  })

  test('reopen with buffer', (t) => {
    t.plan(9)

    const dest = file()
    const stream = new SonicBoom({ dest, minLength: 4096, sync })

    t.ok(stream.write('hello world\n'))
    t.ok(stream.write('something else\n'))

    const after = dest + '-moved'

    stream.once('ready', () => {
      t.pass('drain emitted')

      stream.flush()
      fs.renameSync(dest, after)
      stream.reopen()

      stream.once('ready', () => {
        t.pass('ready emitted')
        t.ok(stream.write('after reopen\n'))
        stream.flush()

        stream.on('drain', () => {
          fs.readFile(after, 'utf8', (err, data) => {
            t.error(err)
            t.equal(data, 'hello world\nsomething else\n')
            fs.readFile(dest, 'utf8', (err, data) => {
              t.error(err)
              t.equal(data, 'after reopen\n')
              stream.end()
            })
          })
        })
      })
    })
  })

  test('reopen if not open', (t) => {
    t.plan(3)

    const dest = file()
    const stream = new SonicBoom({ dest, sync })

    t.ok(stream.write('hello world\n'))
    t.ok(stream.write('something else\n'))

    stream.reopen()

    stream.end()
    stream.on('close', function () {
      t.pass('ended')
    })
  })

  test('end after reopen', (t) => {
    t.plan(4)

    const dest = file()
    const stream = new SonicBoom({ dest, minLength: 4096, sync })

    stream.once('ready', () => {
      t.pass('ready emitted')
      const after = dest + '-moved'
      stream.reopen(after)
      stream.write('after reopen\n')
      stream.on('finish', () => {
        t.pass('finish emitted')
        fs.readFile(after, 'utf8', (err, data) => {
          t.error(err)
          t.equal(data, 'after reopen\n')
        })
      })
      stream.end()
    })
  })

  test('end after 2x reopen', (t) => {
    t.plan(4)

    const dest = file()
    const stream = new SonicBoom({ dest, minLength: 4096, sync })

    stream.once('ready', () => {
      t.pass('ready emitted')
      stream.reopen(dest + '-moved')
      const after = dest + '-moved-moved'
      stream.reopen(after)
      stream.write('after reopen\n')
      stream.on('finish', () => {
        t.pass('finish emitted')
        fs.readFile(after, 'utf8', (err, data) => {
          t.error(err)
          t.equal(data, 'after reopen\n')
        })
      })
      stream.end()
    })
  })

  test('end if not ready', (t) => {
    t.plan(3)

    const dest = file()
    const stream = new SonicBoom({ dest, minLength: 4096, sync })
    const after = dest + '-moved'
    stream.reopen(after)
    stream.write('after reopen\n')
    stream.on('finish', () => {
      t.pass('finish emitted')
      fs.readFile(after, 'utf8', (err, data) => {
        t.error(err)
        t.equal(data, 'after reopen\n')
      })
    })
    stream.end()
  })

  test('reopen with file', (t) => {
    t.plan(9)

    const dest = file()
    const stream = new SonicBoom({ dest, minLength: 0, sync })

    t.ok(stream.write('hello world\n'))
    t.ok(stream.write('something else\n'))

    const after = dest + '-new'

    stream.once('drain', () => {
      t.pass('drain emitted')

      stream.reopen(after)

      stream.once('ready', () => {
        t.pass('ready emitted')
        t.ok(stream.write('after reopen\n'))

        stream.on('drain', () => {
          fs.readFile(dest, 'utf8', (err, data) => {
            t.error(err)
            t.equal(data, 'hello world\nsomething else\n')
            fs.readFile(after, 'utf8', (err, data) => {
              t.error(err)
              t.equal(data, 'after reopen\n')
              stream.end()
            })
          })
        })
      })
    })
  })

  test('chunk data accordingly', (t) => {
    t.plan(2)

    const child = fork(join(__dirname, 'fixtures', 'firehose.js'), { silent: true })
    const str = Buffer.alloc(10000).fill('a').toString()

    let data = ''

    child.stdout.on('data', function (chunk) {
      data += chunk.toString()
    })

    child.stdout.on('end', function () {
      t.equal(data, str)
    })

    child.on('close', function (code) {
      t.equal(code, 0)
    })
  })

  test('write later on recoverable error', (t) => {
    t.plan(8)

    const fakeFs = Object.create(fs)
    const SonicBoom = proxyquire('.', {
      fs: fakeFs
    })

    const dest = file()
    const fd = fs.openSync(dest, 'w')
    const stream = new SonicBoom({ fd, minLength: 0, sync })

    stream.on('ready', () => {
      t.pass('ready emitted')
    })
    stream.on('error', () => {
      t.pass('error emitted')
    })

    if (sync) {
      fakeFs.writeSync = function (fd, buf, enc) {
        t.pass('fake fs.writeSync called')
        throw new Error('recoverable error')
      }
    } else {
      fakeFs.write = function (fd, buf, enc, cb) {
        t.pass('fake fs.write called')
        setTimeout(() => cb(new Error('recoverable error')), 0)
      }
    }

    t.ok(stream.write('hello world\n'))

    setTimeout(() => {
      if (sync) {
        fakeFs.writeSync = fs.writeSync
      } else {
        fakeFs.write = fs.write
      }

      t.ok(stream.write('something else\n'))

      stream.end()
      stream.on('finish', () => {
        fs.readFile(dest, 'utf8', (err, data) => {
          t.error(err)
          t.equal(data, 'hello world\nsomething else\n')
        })
      })
      stream.on('close', () => {
        t.pass('close emitted')
      })
    }, 0)
  })

  test('reopen throws an error', (t) => {
    t.plan(sync ? 10 : 9)

    const fakeFs = Object.create(fs)
    const SonicBoom = proxyquire('.', {
      fs: fakeFs
    })

    const dest = file()
    const stream = new SonicBoom({ dest, sync })

    t.ok(stream.write('hello world\n'))
    t.ok(stream.write('something else\n'))

    const after = dest + '-moved'

    stream.on('error', () => {
      t.pass('error emitted')
    })

    stream.once('drain', () => {
      t.pass('drain emitted')

      fs.renameSync(dest, after)
      if (sync) {
        fakeFs.openSync = function (file, flags) {
          t.pass('fake fs.openSync called')
          throw new Error('open error')
        }
      } else {
        fakeFs.open = function (file, flags, cb) {
          t.pass('fake fs.open called')
          setTimeout(() => cb(new Error('open error')), 0)
        }
      }

      if (sync) {
        try {
          stream.reopen()
        } catch (err) {
          t.pass('reopen throwed')
        }
      } else {
        stream.reopen()
      }

      setTimeout(() => {
        t.ok(stream.write('after reopen\n'))

        stream.end()
        stream.on('finish', () => {
          fs.readFile(after, 'utf8', (err, data) => {
            t.error(err)
            t.equal(data, 'hello world\nsomething else\nafter reopen\n')
          })
        })
        stream.on('close', () => {
          t.pass('close emitted')
        })
      }, 0)
    })
  })
}

test('retry on EAGAIN', (t) => {
  t.plan(7)

  const fakeFs = Object.create(fs)
  fakeFs.write = function (fd, buf, enc, cb) {
    t.pass('fake fs.write called')
    fakeFs.write = fs.write
    const err = new Error('EAGAIN')
    err.code = 'EAGAIN'
    process.nextTick(cb, err)
  }
  const SonicBoom = proxyquire('.', {
    fs: fakeFs
  })

  const dest = file()
  const fd = fs.openSync(dest, 'w')
  const stream = new SonicBoom({ fd, sync: false, minLength: 0 })

  stream.on('ready', () => {
    t.pass('ready emitted')
  })

  t.ok(stream.write('hello world\n'))
  t.ok(stream.write('something else\n'))

  stream.end()

  stream.on('finish', () => {
    fs.readFile(dest, 'utf8', (err, data) => {
      t.error(err)
      t.equal(data, 'hello world\nsomething else\n')
    })
  })
  stream.on('close', () => {
    t.pass('close emitted')
  })
})

test('retry on EAGAIN (sync)', (t) => {
  t.plan(7)

  const fakeFs = Object.create(fs)
  fakeFs.writeSync = function (fd, buf, enc, cb) {
    t.pass('fake fs.writeSync called')
    fakeFs.writeSync = fs.writeSync
    const err = new Error('EAGAIN')
    err.code = 'EAGAIN'
    throw err
  }
  const SonicBoom = proxyquire('.', {
    fs: fakeFs
  })

  const dest = file()
  const fd = fs.openSync(dest, 'w')
  const stream = new SonicBoom({ fd, minLength: 0, sync: true })

  stream.on('ready', () => {
    t.pass('ready emitted')
  })

  t.ok(stream.write('hello world\n'))
  t.ok(stream.write('something else\n'))

  stream.end()

  stream.on('finish', () => {
    fs.readFile(dest, 'utf8', (err, data) => {
      t.error(err)
      t.equal(data, 'hello world\nsomething else\n')
    })
  })
  stream.on('close', () => {
    t.pass('close emitted')
  })
})

test('retry in flushSync on EAGAIN', (t) => {
  t.plan(7)

  const fakeFs = Object.create(fs)
  const SonicBoom = proxyquire('.', {
    fs: fakeFs
  })

  const dest = file()
  const fd = fs.openSync(dest, 'w')
  const stream = new SonicBoom({ fd, sync: false, minLength: 0 })

  stream.on('ready', () => {
    t.pass('ready emitted')
  })

  t.ok(stream.write('hello world\n'))

  fakeFs.writeSync = function (fd, buf, enc) {
    t.pass('fake fs.write called')
    fakeFs.writeSync = fs.writeSync
    const err = new Error('EAGAIN')
    err.code = 'EAGAIN'
    throw err
  }

  t.ok(stream.write('something else\n'))

  stream.flushSync()
  stream.end()

  stream.on('finish', () => {
    fs.readFile(dest, 'utf8', (err, data) => {
      t.error(err)
      t.equal(data, 'hello world\nsomething else\n')
    })
  })
  stream.on('close', () => {
    t.pass('close emitted')
  })
})

test('write buffers that are not totally written', (t) => {
  t.plan(9)

  const fakeFs = Object.create(fs)
  fakeFs.write = function (fd, buf, enc, cb) {
    t.pass('fake fs.write called')
    fakeFs.write = function (fd, buf, enc, cb) {
      t.pass('calling real fs.write, ' + buf)
      fs.write(fd, buf, enc, cb)
    }
    process.nextTick(cb, null, 0)
  }
  const SonicBoom = proxyquire('.', {
    fs: fakeFs
  })

  const dest = file()
  const fd = fs.openSync(dest, 'w')
  const stream = new SonicBoom({ fd, minLength: 0, sync: false })

  stream.on('ready', () => {
    t.pass('ready emitted')
  })

  t.ok(stream.write('hello world\n'))
  t.ok(stream.write('something else\n'))

  stream.end()

  stream.on('finish', () => {
    fs.readFile(dest, 'utf8', (err, data) => {
      t.error(err)
      t.equal(data, 'hello world\nsomething else\n')
    })
  })
  stream.on('close', () => {
    t.pass('close emitted')
  })
})

test('write buffers that are not totally written with sync mode', (t) => {
  t.plan(9)

  const fakeFs = Object.create(fs)
  fakeFs.writeSync = function (fd, buf, enc) {
    t.pass('fake fs.write called')
    fakeFs.writeSync = (fd, buf, enc) => {
      t.pass('calling real fs.writeSync, ' + buf)
      return fs.writeSync(fd, buf, enc)
    }
    return 0
  }
  const SonicBoom = proxyquire('.', {
    fs: fakeFs
  })

  const dest = file()
  const fd = fs.openSync(dest, 'w')
  const stream = new SonicBoom({ fd, minLength: 0, sync: true })

  stream.on('ready', () => {
    t.pass('ready emitted')
  })

  t.ok(stream.write('hello world\n'))
  t.ok(stream.write('something else\n'))

  stream.end()

  stream.on('finish', () => {
    fs.readFile(dest, 'utf8', (err, data) => {
      t.error(err)
      t.equal(data, 'hello world\nsomething else\n')
    })
  })
  stream.on('close', () => {
    t.pass('close emitted')
  })
})

test('sync writing is fully sync', (t) => {
  t.plan(6)

  const fakeFs = Object.create(fs)
  fakeFs.writeSync = function (fd, buf, enc, cb) {
    t.pass('fake fs.write called')
    return fs.writeSync(fd, buf, enc)
  }
  const SonicBoom = proxyquire('.', {
    fs: fakeFs
  })

  const dest = file()
  const fd = fs.openSync(dest, 'w')
  const stream = new SonicBoom({ fd, minLength: 0, sync: true })
  t.ok(stream.write('hello world\n'))
  t.ok(stream.write('something else\n'))

  // 'drain' will be only emitted once,
  // the number of assertions at the top check this.
  stream.on('drain', () => {
    t.pass('drain emitted')
  })

  const data = fs.readFileSync(dest, 'utf8')
  t.equal(data, 'hello world\nsomething else\n')
})

// These they will fail on Node 6, as we cannot allocate a string this
// big. It's considered a won't fix on Node 6, as it's deprecated.
if (process.versions.node.indexOf('6.') !== 0) {
  test('write enormously large buffers async', (t) => {
    t.plan(3)

    const dest = file()
    const fd = fs.openSync(dest, 'w')
    const stream = new SonicBoom({ fd, minLength: 0, sync: false })

    const buf = Buffer.alloc(1024).fill('x').toString() // 1 MB
    let length = 0

    for (let i = 0; i < 1024 * 512; i++) {
      length += buf.length
      stream.write(buf)
    }

    stream.end()

    stream.on('finish', () => {
      fs.stat(dest, (err, stat) => {
        t.error(err)
        t.equal(stat.size, length)
      })
    })
    stream.on('close', () => {
      t.pass('close emitted')
    })
  })

  test('write enormously large buffers sync', (t) => {
    t.plan(3)

    const dest = file()
    const fd = fs.openSync(dest, 'w')
    const stream = new SonicBoom({ fd, minLength: 0, sync: true })

    const buf = Buffer.alloc(1024).fill('x').toString() // 1 MB
    let length = 0

    for (let i = 0; i < 1024 * 512; i++) {
      length += buf.length
      stream.write(buf)
    }

    stream.end()

    stream.on('finish', () => {
      fs.stat(dest, (err, stat) => {
        t.error(err)
        t.equal(stat.size, length)
      })
    })
    stream.on('close', () => {
      t.pass('close emitted')
    })
  })
}

test('write enormously large buffers sync with utf8 multi-byte split', (t) => {
  t.plan(4)

  const dest = file()
  const fd = fs.openSync(dest, 'w')
  const stream = new SonicBoom({ fd, minLength: 0, sync: true })

  let buf = Buffer.alloc((1024 * 16) - 2).fill('x') // 16MB - 3B
  const length = buf.length + 4
  buf = buf.toString() + '🌲' // 16 MB + 1B

  stream.write(buf)

  stream.end()

  stream.on('finish', () => {
    fs.stat(dest, (err, stat) => {
      t.error(err)
      t.equal(stat.size, length)
      const char = Buffer.alloc(4)
      const fd = fs.openSync(dest, 'r')
      fs.readSync(fd, char, 0, 4, length - 4)
      t.equal(char.toString(), '🌲')
    })
  })
  stream.on('close', () => {
    t.pass('close emitted')
  })
})

// for context see this issue https://github.com/pinojs/pino/issues/871
test('file specified by dest path available immediately when options.sync is true', (t) => {
  t.plan(3)
  const dest = file()
  const stream = new SonicBoom({ dest, sync: true })
  t.ok(stream.write('hello world\n'))
  t.ok(stream.write('something else\n'))
  stream.flushSync()
  t.pass('file opened and written to without error')
})

test('sync error handling', (t) => {
  t.plan(1)
  try {
    /* eslint no-new: off */
    new SonicBoom({ dest: '/path/to/nowwhere', sync: true })
    t.fail('must throw synchronously')
  } catch (err) {
    t.pass('an error happened')
  }
})
