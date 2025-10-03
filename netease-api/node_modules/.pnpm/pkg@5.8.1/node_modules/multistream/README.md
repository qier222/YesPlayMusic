# multistream [![travis][travis-image]][travis-url] [![npm][npm-image]][npm-url] [![downloads][downloads-image]][downloads-url] [![javascript style guide][standard-image]][standard-url]

[travis-image]: https://img.shields.io/travis/feross/multistream/master.svg
[travis-url]: https://travis-ci.org/feross/multistream
[npm-image]: https://img.shields.io/npm/v/multistream.svg
[npm-url]: https://npmjs.org/package/multistream
[downloads-image]: https://img.shields.io/npm/dm/multistream.svg
[downloads-url]: https://npmjs.org/package/multistream
[standard-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[standard-url]: https://standardjs.com

#### A stream that emits multiple other streams one after another (streams3)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/multistream.svg)](https://saucelabs.com/u/multistream)

![cat](https://raw.githubusercontent.com/feross/multistream/master/img.jpg)

Simple, robust streams3 version of [combined-stream](https://www.npmjs.org/package/combined-stream). Allows you to combine multiple streams into a single stream. When the first stream ends, the next one starts, and so on, until all streams are consumed.

This module is used by [WebTorrent](http://webtorrent.io), specifically [create-torrent](https://github.com/feross/create-torrent).

### install

```
npm install multistream
```

### usage

Use `multistream` like this:

```js
var MultiStream = require('multistream')
var fs = require('fs')

var streams = [
  fs.createReadStream(__dirname + '/numbers/1.txt'),
  fs.createReadStream(__dirname + '/numbers/2.txt'),
  fs.createReadStream(__dirname + '/numbers/3.txt')
]

new MultiStream(streams).pipe(process.stdout) // => 123
```

You can also create an object-mode stream with `MultiStream.obj(streams)`.

To lazily create the streams, wrap them in a function:

```js
var streams = [
  fs.createReadStream(__dirname + '/numbers/1.txt'),
  function () { // will be executed when the stream is active
    return fs.createReadStream(__dirname + '/numbers/2.txt')
  },
  function () { // same
    return fs.createReadStream(__dirname + '/numbers/3.txt')
  }
]

new MultiStream(streams).pipe(process.stdout) // => 123
```

Alternatively, streams may be created by an asynchronous "factory" function:

```js
var count = 0
function factory (cb) {
  if (count > 3) return cb(null, null)
  count++
  setTimeout(function () {
    cb(null, fs.createReadStream(__dirname + '/numbers/' + count + '.txt'))
  }, 100)
}

new MultiStream(factory).pipe(process.stdout) // => 123
```

### contributors

- [Feross Aboukhadijeh](http://feross.org)
- [Mathias Buus](https://github.com/mafintosh/)
- [Yuri Astrakhan](https://github.com/nyurik/)

### license

MIT. Copyright (c) [Feross Aboukhadijeh](http://feross.org).
