module.exports = Meter

var util = require("util")

var Transform = require("stream").Transform

if (!Transform) {
  Transform = require("readable-stream/transform")
}

function Meter(maxBytes) {
  if (!(this instanceof Meter)) return new Meter(maxBytes)
  Transform.call(this)

  this.bytes = 0
  this.maxBytes = maxBytes || Number.MAX_VALUE
}
util.inherits(Meter, Transform)

Meter.prototype._transform = function (chunk, encoding, cb) {
  this.bytes += chunk.length
  this.push(chunk)
  if (this.bytes > this.maxBytes) {
    return cb(new Error("Stream exceeded specified max of " + this.maxBytes + " bytes."))
  }
  cb()
}