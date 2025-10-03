'use strict'
var nul = process.platform === 'win32' ? '\\\\.\\NUL' : '/dev/null'
var bench = require('fastbench')
var stream = require('fs').createWriteStream(nul)
var alt0 = require('./')
var largeStr = JSON.stringify(require('./package.json'))
largeStr += largeStr
largeStr += largeStr

var run = bench([
  function alt0ManySmallConcats (cb) {
    stream.write(alt0(makeStr('a', 200)))
    setImmediate(cb)
  },
  function alt1ManySmallConcats (cb) {
    stream.write(alt1(makeStr('a', 200)))
    setImmediate(cb)
  },
  function alt2ManySmallConcats (cb) {
    stream.write(alt2(makeStr('a', 200)))
    setImmediate(cb)
  },
  function alt3ManySmallConcats (cb) {
    stream.write(alt3(makeStr('a', 200)))
    setImmediate(cb)
  },
  function alt4ManySmallConcats (cb) {
    stream.write(alt4(makeStr('a', 200)))
    setImmediate(cb)
  },
  function alt5ManySmallConcats (cb) {
    stream.write(alt5(makeStr('a', 200)))
    setImmediate(cb)
  },
  function alt6ManySmallConcats (cb) {
    stream.write(alt6(makeStr('a', 200)))
    setImmediate(cb)
  },
  function alt7ManySmallConcats (cb) {
    stream.write(alt7(makeStr('a', 200)))
    setImmediate(cb)
  },
  function alt8ManySmallConcats (cb) {
    stream.write(alt8(makeStr('a', 200)))
    setImmediate(cb)
  },
  function alt9ManySmallConcats (cb) {
    stream.write(alt9(makeStr('a', 200)))
    setImmediate(cb)
  },
  function alt0SeveralLargeConcats (cb) {
    stream.write(alt0(makeStr(largeStr, 10)))
    setImmediate(cb)
  },
  function alt1SeveralLargeConcats (cb) {
    stream.write(alt1(makeStr(largeStr, 10)))
    setImmediate(cb)
  },
  function alt2SeveralLargeConcats (cb) {
    stream.write(alt2(makeStr(largeStr, 10)))
    setImmediate(cb)
  },
  function alt3SeveralLargeConcats (cb) {
    stream.write(alt3(makeStr(largeStr, 10)))
    setImmediate(cb)
  },
  function alt4SeveralLargeConcats (cb) {
    stream.write(alt4(makeStr(largeStr, 10)))
    setImmediate(cb)
  },
  function alt5SeveralLargeConcats (cb) {
    stream.write(alt5(makeStr(largeStr, 10)))
    setImmediate(cb)
  },
  function alt6SeveralLargeConcats (cb) {
    stream.write(alt6(makeStr(largeStr, 10)))
    setImmediate(cb)
  },
  function alt7SeveralLargeConcats (cb) {
    stream.write(alt7(makeStr(largeStr, 10)))
    setImmediate(cb)
  },
  function alt8SeveralLargeConcats (cb) {
    stream.write(alt8(makeStr(largeStr, 10)))
    setImmediate(cb)
  },
  function alt9SeveralLargeConcats (cb) {
    stream.write(alt9(makeStr(largeStr, 10)))
    setImmediate(cb)
  },
  function alt0ExponentialSmallConcats (cb) {
    stream.write(alt0(makeExpoStr('a', 12)))
    setImmediate(cb)
  },
  function alt1ExponentialSmallConcats (cb) {
    stream.write(alt1(makeExpoStr('a', 12)))
    setImmediate(cb)
  },
  function alt2ExponentialSmallConcats (cb) {
    stream.write(alt2(makeExpoStr('a', 12)))
    setImmediate(cb)
  },
  function alt3ExponentialSmallConcats (cb) {
    stream.write(alt3(makeExpoStr('a', 12)))
    setImmediate(cb)
  },
  function alt4ExponentialSmallConcats (cb) {
    stream.write(alt4(makeExpoStr('a', 12)))
    setImmediate(cb)
  },
  function alt5ExponentialSmallConcats (cb) {
    stream.write(alt5(makeExpoStr('a', 12)))
    setImmediate(cb)
  },
  function alt6ExponentialSmallConcats (cb) {
    stream.write(alt6(makeExpoStr('a', 12)))
    setImmediate(cb)
  },
  function alt7ExponentialSmallConcats (cb) {
    stream.write(alt7(makeExpoStr('a', 12)))
    setImmediate(cb)
  },
  function alt8ExponentialSmallConcats (cb) {
    stream.write(alt8(makeExpoStr('a', 12)))
    setImmediate(cb)
  },
  function alt9ExponentialSmallConcats (cb) {
    stream.write(alt9(makeExpoStr('a', 12)))
    setImmediate(cb)
  },
  function alt0ExponentialLargeConcats (cb) {
    stream.write(alt0(makeExpoStr(largeStr, 7)))
    setImmediate(cb)
  },
  function alt1ExponentialLargeConcats (cb) {
    stream.write(alt1(makeExpoStr(largeStr, 7)))
    setImmediate(cb)
  },
  function alt2ExponentialLargeConcats (cb) {
    stream.write(alt2(makeExpoStr(largeStr, 7)))
    setImmediate(cb)
  },
  function alt3ExponentialLargeConcats (cb) {
    stream.write(alt3(makeExpoStr(largeStr, 7)))
    setImmediate(cb)
  },
  function alt4ExponentialLargeConcats (cb) {
    stream.write(alt4(makeExpoStr(largeStr, 7)))
    setImmediate(cb)
  },
  function alt5ExponentialLargeConcats (cb) {
    stream.write(alt5(makeExpoStr(largeStr, 7)))
    setImmediate(cb)
  },
  function alt6ExponentialLargeConcats (cb) {
    stream.write(alt6(makeExpoStr(largeStr, 7)))
    setImmediate(cb)
  },
  function alt7ExponentialLargeConcats (cb) {
    stream.write(alt7(makeExpoStr(largeStr, 7)))
    setImmediate(cb)
  },
  function alt8ExponentialLargeConcats (cb) {
    stream.write(alt8(makeExpoStr(largeStr, 7)))
    setImmediate(cb)
  },
  function alt9ExponentialLargeConcats (cb) {
    stream.write(alt9(makeExpoStr(largeStr, 7)))
    setImmediate(cb)
  }
], 10000)

run(run)

var rx = /()/
function alt1 (s) {
  rx.test(s)
  return s
}
function alt2 (s) {
  rx.exec(s)
  return s
}

function alt3 (s) {
  s | 0
  return s
}

function alt4 (s) {
  ~s
  return s
}

function alt5 (s) {
  escape(s)
  return s
}

function alt6 (s) {
  unescape(s)
  return s
}

function alt7 (s) {
  parseInt(s, 10)
  return s
}

function alt8 (s) {
  parseFloat(s)
  return s
}

function alt9 (s) {
  alt9[s] = null
  return s
}

function makeStr (str, concats) {
  var s = ''
  while (concats--) {
    s += str
  }
  return s
}

function makeExpoStr (str, concats) {
  var s = str
  while (concats--) {
    s += s
  }
  return s
}
