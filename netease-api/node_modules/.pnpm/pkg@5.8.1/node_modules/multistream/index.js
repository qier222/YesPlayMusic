/*! multistream. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
const stream = require('readable-stream')
const once = require('once')

function toStreams2Obj (s) {
  return toStreams2(s, { objectMode: true, highWaterMark: 16 })
}

function toStreams2Buf (s) {
  return toStreams2(s)
}

function toStreams2 (s, opts) {
  if (!s || typeof s === 'function' || s._readableState) return s

  const wrap = new stream.Readable(opts).wrap(s)
  if (s.destroy) {
    wrap.destroy = s.destroy.bind(s)
  }
  return wrap
}

class MultiStream extends stream.Readable {
  constructor (streams, opts) {
    super({ ...opts, autoDestroy: true })

    this._drained = false
    this._forwarding = false
    this._current = null
    this._toStreams2 = (opts && opts.objectMode) ? toStreams2Obj : toStreams2Buf

    if (typeof streams === 'function') {
      this._queue = streams
    } else {
      this._queue = streams.map(this._toStreams2)
      this._queue.forEach(stream => {
        if (typeof stream !== 'function') this._attachErrorListener(stream)
      })
    }

    this._next()
  }

  _read () {
    this._drained = true
    this._forward()
  }

  _forward () {
    if (this._forwarding || !this._drained || !this._current) return
    this._forwarding = true

    let chunk
    while (this._drained && (chunk = this._current.read()) !== null) {
      this._drained = this.push(chunk)
    }

    this._forwarding = false
  }

  _destroy (err, cb) {
    let streams = []
    if (this._current) streams.push(this._current)
    if (typeof this._queue !== 'function') streams = streams.concat(this._queue)

    if (streams.length === 0) {
      cb(err)
    } else {
      let counter = streams.length
      let er = err
      streams.forEach(stream => {
        destroy(stream, err, err => {
          er = er || err
          if (--counter === 0) {
            cb(er)
          }
        })
      })
    }
  }

  _next () {
    this._current = null

    if (typeof this._queue === 'function') {
      this._queue((err, stream) => {
        if (err) return this.destroy(err)
        stream = this._toStreams2(stream)
        this._attachErrorListener(stream)
        this._gotNextStream(stream)
      })
    } else {
      let stream = this._queue.shift()
      if (typeof stream === 'function') {
        stream = this._toStreams2(stream())
        this._attachErrorListener(stream)
      }
      this._gotNextStream(stream)
    }
  }

  _gotNextStream (stream) {
    if (!stream) {
      this.push(null)
      return
    }

    this._current = stream
    this._forward()

    const onReadable = () => {
      this._forward()
    }

    const onClose = () => {
      if (!stream._readableState.ended && !stream.destroyed) {
        const err = new Error('ERR_STREAM_PREMATURE_CLOSE')
        err.code = 'ERR_STREAM_PREMATURE_CLOSE'
        this.destroy(err)
      }
    }

    const onEnd = () => {
      this._current = null
      stream.removeListener('readable', onReadable)
      stream.removeListener('end', onEnd)
      stream.removeListener('close', onClose)
      stream.destroy()
      this._next()
    }

    stream.on('readable', onReadable)
    stream.once('end', onEnd)
    stream.once('close', onClose)
  }

  _attachErrorListener (stream) {
    if (!stream) return

    const onError = (err) => {
      stream.removeListener('error', onError)
      this.destroy(err)
    }

    stream.once('error', onError)
  }
}

MultiStream.obj = streams => (
  new MultiStream(streams, { objectMode: true, highWaterMark: 16 })
)

module.exports = MultiStream

// Normalize stream destroy w/ callback.
function destroy (stream, err, cb) {
  if (!stream.destroy || stream.destroyed) {
    cb(err)
  } else {
    const callback = once(er => cb(er || err))
    stream
      .on('error', callback)
      .on('close', () => callback())
      .destroy(err, callback)
  }
}
