'use strict'

const { test, teardown } = require('tap')
const { join } = require('path')
const { fork } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const proxyquire = require('proxyquire')
const SonicBoom = require('.')

const isWindows = process.platform === 'win32'

const MAX_WRITE = 16 * 1024
const files = []
let count = 0

function file () {
  const file = path.join(os.tmpdir(), `sonic-boom-${process.pid}-${process.hrtime().toString()}-${count++}`)
  files.push(file)
  return file
}

teardown(() => {
  const rmSync = fs.rmSync || fs.rmdirSync
  files.forEach((file) => {
    try {
      if (fs.existsSync(file)) {
        fs.statSync(file).isDirectory() ? rmSync(file, { recursive: true, maxRetries: 10 }) : fs.unlinkSync(file)
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
  // Reset the umask for testing
  process.umask(0o000)

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

  test('append', (t) => {
    t.plan(4)

    const dest = file()
    fs.writeFileSync(dest, 'hello world\n')
    const stream = new SonicBoom({ dest, append: false, sync })

    stream.on('ready', () => {
      t.pass('ready emitted')
    })

    t.ok(stream.write('something else\n'))

    stream.flush()

    stream.on('drain', () => {
      fs.readFile(dest, 'utf8', (err, data) => {
        t.error(err)
        t.equal(data, 'something else\n')
        stream.end()
      })
    })
  })

  test('mkdir', (t) => {
    t.plan(4)

    const dest = path.join(file(), 'out.log')
    const stream = new SonicBoom({ dest, mkdir: true, sync })

    stream.on('ready', () => {
      t.pass('ready emitted')
    })

    t.ok(stream.write('hello world\n'))

    stream.flush()

    stream.on('drain', () => {
      fs.readFile(dest, 'utf8', (err, data) => {
        t.error(err)
        t.equal(data, 'hello world\n')
        stream.end()
      })
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

  test('flush with no data', (t) => {
    t.plan(2)

    const dest = file()
    const fd = fs.openSync(dest, 'w')
    const stream = new SonicBoom({ fd, minLength: 4096, sync })

    stream.on('ready', () => {
      t.pass('ready emitted')
    })

    stream.flush()

    stream.on('drain', () => {
      t.pass('drain emitted')
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
        fakeFs.open = function (file, flags, mode, cb) {
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

  test('mode', { skip: isWindows }, (t) => {
    t.plan(6)

    const dest = file()
    const mode = 0o666
    const stream = new SonicBoom({ dest, sync, mode })

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
        t.equal(fs.statSync(dest).mode & 0o777, stream.mode)
      })
    })
  })

  test('mode default', { skip: isWindows }, (t) => {
    t.plan(6)

    const dest = file()
    const defaultMode = 0o666
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
        t.equal(fs.statSync(dest).mode & 0o777, defaultMode)
      })
    })
  })

  test('mode on mkdir', { skip: isWindows }, (t) => {
    t.plan(5)

    const dest = path.join(file(), 'out.log')
    const mode = 0o666
    const stream = new SonicBoom({ dest, mkdir: true, mode, sync })

    stream.on('ready', () => {
      t.pass('ready emitted')
    })

    t.ok(stream.write('hello world\n'))

    stream.flush()

    stream.on('drain', () => {
      fs.readFile(dest, 'utf8', (err, data) => {
        t.error(err)
        t.equal(data, 'hello world\n')
        t.equal(fs.statSync(dest).mode & 0o777, stream.mode)
        stream.end()
      })
    })
  })

  test('mode on append', { skip: isWindows }, (t) => {
    t.plan(5)

    const dest = file()
    fs.writeFileSync(dest, 'hello world\n', 'utf8', 0o422)
    const mode = isWindows ? 0o444 : 0o666
    const stream = new SonicBoom({ dest, append: false, mode, sync })

    stream.on('ready', () => {
      t.pass('ready emitted')
    })

    t.ok(stream.write('something else\n'))

    stream.flush()

    stream.on('drain', () => {
      fs.readFile(dest, 'utf8', (err, data) => {
        t.error(err)
        t.equal(data, 'something else\n')
        t.equal(fs.statSync(dest).mode & 0o777, stream.mode)
        stream.end()
      })
    })
  })

  test('emit write events', (t) => {
    t.plan(7)

    const dest = file()
    const stream = new SonicBoom({ dest, sync })

    stream.on('ready', () => {
      t.pass('ready emitted')
    })

    let length = 0
    stream.on('write', (bytes) => {
      length += bytes
    })

    t.ok(stream.write('hello world\n'))
    t.ok(stream.write('something else\n'))

    stream.end()

    stream.on('finish', () => {
      fs.readFile(dest, 'utf8', (err, data) => {
        t.error(err)
        t.equal(data, 'hello world\nsomething else\n')
        t.equal(length, 27)
      })
    })
    stream.on('close', () => {
      t.pass('close emitted')
    })
  })
}

test('drain deadlock', (t) => {
  t.plan(4)

  const dest = file()
  const stream = new SonicBoom({ dest, sync: false, minLength: 9999 })

  t.ok(stream.write(Buffer.alloc(1500).fill('x').toString()))
  t.ok(stream.write(Buffer.alloc(1500).fill('x').toString()))
  t.ok(!stream.write(Buffer.alloc(MAX_WRITE).fill('x').toString()))
  stream.on('drain', () => {
    t.pass()
  })
})

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

test('emit error on async EAGAIN', (t) => {
  t.plan(11)

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
  const stream = new SonicBoom({
    fd,
    sync: false,
    minLength: 12,
    retryEAGAIN: (err, writeBufferLen, remainingBufferLen) => {
      t.equal(err.code, 'EAGAIN')
      t.equal(writeBufferLen, 12)
      t.equal(remainingBufferLen, 0)
      return false
    }
  })

  stream.on('ready', () => {
    t.pass('ready emitted')
  })

  stream.once('error', err => {
    t.equal(err.code, 'EAGAIN')
    t.ok(stream.write('something else\n'))
  })

  t.ok(stream.write('hello world\n'))

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

test('emit error on EAGAIN (sync)', (t) => {
  t.plan(11)

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
  const stream = new SonicBoom({
    fd,
    minLength: 0,
    sync: true,
    retryEAGAIN: (err, writeBufferLen, remainingBufferLen) => {
      t.equal(err.code, 'EAGAIN')
      t.equal(writeBufferLen, 12)
      t.equal(remainingBufferLen, 0)
      return false
    }
  })

  stream.on('ready', () => {
    t.pass('ready emitted')
  })

  stream.once('error', err => {
    t.equal(err.code, 'EAGAIN')
    t.ok(stream.write('something else\n'))
  })

  t.ok(stream.write('hello world\n'))

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

test('throw error in flushSync on EAGAIN', (t) => {
  t.plan(11)

  const fakeFs = Object.create(fs)
  const SonicBoom = proxyquire('.', {
    fs: fakeFs
  })

  const dest = file()
  const fd = fs.openSync(dest, 'w')
  const stream = new SonicBoom({
    fd,
    sync: false,
    minLength: 1000,
    retryEAGAIN: (err, writeBufferLen, remainingBufferLen) => {
      t.equal(err.code, 'EAGAIN')
      t.equal(writeBufferLen, 12)
      t.equal(remainingBufferLen, 0)
      return false
    }
  })

  stream.on('ready', () => {
    t.pass('ready emitted')
  })

  const err = new Error('EAGAIN')
  err.code = 'EAGAIN'
  fakeFs.writeSync = function (fd, buf, enc) {
    Error.captureStackTrace(err)
    t.pass('fake fs.write called')
    fakeFs.writeSync = fs.writeSync
    throw err
  }

  t.ok(stream.write('hello world\n'))
  t.throws(stream.flushSync.bind(stream), err, 'EAGAIN')

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

test('retryEAGAIN receives remaining buffer on async if write fails', (t) => {
  t.plan(12)

  const fakeFs = Object.create(fs)
  const SonicBoom = proxyquire('.', {
    fs: fakeFs
  })

  const dest = file()
  const fd = fs.openSync(dest, 'w')
  const stream = new SonicBoom({
    fd,
    sync: false,
    minLength: 12,
    retryEAGAIN: (err, writeBufferLen, remainingBufferLen) => {
      t.equal(err.code, 'EAGAIN')
      t.equal(writeBufferLen, 12)
      t.equal(remainingBufferLen, 11)
      return false
    }
  })

  stream.on('ready', () => {
    t.pass('ready emitted')
  })

  stream.once('error', err => {
    t.equal(err.code, 'EAGAIN')
    t.ok(stream.write('done'))
  })

  fakeFs.write = function (fd, buf, enc, cb) {
    t.pass('fake fs.write called')
    fakeFs.write = fs.write
    const err = new Error('EAGAIN')
    err.code = 'EAGAIN'
    t.ok(stream.write('sonic boom\n'))
    process.nextTick(cb, err)
  }

  t.ok(stream.write('hello world\n'))

  stream.end()

  stream.on('finish', () => {
    fs.readFile(dest, 'utf8', (err, data) => {
      t.error(err)
      t.equal(data, 'hello world\nsonic boom\ndone')
    })
  })
  stream.on('close', () => {
    t.pass('close emitted')
  })
})

test('retryEAGAIN receives remaining buffer if exceeds maxWrite', (t) => {
  t.plan(17)

  const fakeFs = Object.create(fs)
  const SonicBoom = proxyquire('.', {
    fs: fakeFs
  })

  const dest = file()
  const fd = fs.openSync(dest, 'w')
  const buf = Buffer.alloc(MAX_WRITE - 2).fill('x').toString() // 1 MB
  const stream = new SonicBoom({
    fd,
    sync: false,
    minLength: MAX_WRITE - 1,
    retryEAGAIN: (err, writeBufferLen, remainingBufferLen) => {
      t.equal(err.code, 'EAGAIN', 'retryEAGAIN received EAGAIN error')
      t.equal(writeBufferLen, buf.length, 'writeBufferLen === buf.length')
      t.equal(remainingBufferLen, 23, 'remainingBufferLen === 23')
      return false
    }
  })

  stream.on('ready', () => {
    t.pass('ready emitted')
  })

  fakeFs.write = function (fd, buf, enc, cb) {
    t.pass('fake fs.write called')
    const err = new Error('EAGAIN')
    err.code = 'EAGAIN'
    process.nextTick(cb, err)
  }

  fakeFs.writeSync = function (fd, buf, enc, cb) {
    t.pass('fake fs.write called')
    const err = new Error('EAGAIN')
    err.code = 'EAGAIN'
    throw err
  }

  t.ok(stream.write(buf), 'write buf')
  t.notOk(stream.write('hello world\nsonic boom\n'), 'write hello world sonic boom')

  stream.once('error', err => {
    t.equal(err.code, 'EAGAIN', 'bubbled error should be EAGAIN')

    try {
      stream.flushSync()
    } catch (err) {
      t.equal(err.code, 'EAGAIN', 'thrown error should be EAGAIN')
      fakeFs.write = fs.write
      fakeFs.writeSync = fs.writeSync
      stream.end()
    }
  })

  stream.on('finish', () => {
    t.pass('finish emitted')
    fs.readFile(dest, 'utf8', (err, data) => {
      t.error(err)
      t.equal(data, `${buf}hello world\nsonic boom\n`, 'data on file should match written')
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

for (const fd of [1, 2]) {
  test(`fd ${fd}`, (t) => {
    t.plan(1)

    const fakeFs = Object.create(fs)
    const SonicBoom = proxyquire('.', {
      fs: fakeFs
    })

    const stream = new SonicBoom({ fd })

    fakeFs.close = function (fd, cb) {
      t.fail(`should not close fd ${fd}`)
    }

    stream.end()

    stream.on('close', () => {
      t.pass('close emitted')
    })
  })
}

test('write enormously large buffers async atomicly', (t) => {
  const fakeFs = Object.create(fs)
  const SonicBoom = proxyquire('.', {
    fs: fakeFs
  })

  const dest = file()
  const fd = fs.openSync(dest, 'w')
  const stream = new SonicBoom({ fd, minLength: 0, sync: false })

  const buf = Buffer.alloc(1023).fill('x').toString()

  fakeFs.write = function (fd, _buf, enc, cb) {
    if (_buf.length % buf.length !== 0) {
      t.fail('write called with wrong buffer size')
    }

    setImmediate(cb, null, _buf.length)
  }

  for (let i = 0; i < 1024 * 512; i++) {
    stream.write(buf)
  }

  setImmediate(() => {
    for (let i = 0; i < 1024 * 512; i++) {
      stream.write(buf)
    }

    stream.end()
  })

  stream.on('close', () => {
    t.pass('close emitted')
    t.end()
  })
})

test('write should not drop new data if buffer is not full', (t) => {
  t.plan(2)
  const fakeFs = Object.create(fs)
  const SonicBoom = proxyquire('.', {
    fs: fakeFs
  })

  const dest = file()
  const fd = fs.openSync(dest, 'w')
  const stream = new SonicBoom({ fd, minLength: 101, maxLength: 102, sync: false })

  const buf = Buffer.alloc(100).fill('x').toString()

  fakeFs.write = function (fd, _buf, enc, cb) {
    t.equal(_buf.length, buf.length + 2)
    setImmediate(cb, null, _buf.length)
    fakeFs.write = () => t.error('shouldnt call write again')
    stream.end()
  }

  stream.on('drop', (data) => {
    t.error('should not drop')
  })

  stream.write(buf)
  stream.write('aa')

  stream.on('close', () => {
    t.pass('close emitted')
  })
})

test('write should drop new data if buffer is full', (t) => {
  t.plan(3)
  const fakeFs = Object.create(fs)
  const SonicBoom = proxyquire('.', {
    fs: fakeFs
  })

  const dest = file()
  const fd = fs.openSync(dest, 'w')
  const stream = new SonicBoom({ fd, minLength: 101, maxLength: 102, sync: false })

  const buf = Buffer.alloc(100).fill('x').toString()

  fakeFs.write = function (fd, _buf, enc, cb) {
    t.equal(_buf.length, buf.length)
    setImmediate(cb, null, _buf.length)
    fakeFs.write = () => t.error('shouldnt call write more than once')
  }

  stream.on('drop', (data) => {
    t.equal(data.length, 3)
    stream.end()
  })

  stream.write(buf)
  stream.write('aaa')

  stream.on('close', () => {
    t.pass('close emitted')
  })
})

test('should throw if minLength >= maxWrite', (t) => {
  t.plan(1)
  t.throws(() => {
    const dest = file()
    const fd = fs.openSync(dest, 'w')

    new SonicBoom({
      fd,
      minLength: MAX_WRITE
    })
  })
})

test('make sure `maxWrite` is passed', (t) => {
  t.plan(1)
  const dest = file()
  const stream = new SonicBoom({ dest, maxLength: 65536 })
  t.equal(stream.maxLength, 65536)
})
