# into-stream [![Build Status](https://travis-ci.com/sindresorhus/into-stream.svg?branch=master)](https://travis-ci.com/github/sindresorhus/into-stream)

> Convert a string/promise/array/iterable/asynciterable/buffer/typedarray/arraybuffer/object into a stream

Correctly chunks up the input and handles backpressure.

## Install

```
$ npm install into-stream
```

## Usage

```js
const intoStream = require('into-stream');

intoStream('unicorn').pipe(process.stdout);
//=> 'unicorn'
```

## API

### intoStream(input)

Type: `Buffer | TypedArray | ArrayBuffer | string | Iterable<Buffer | string> | AsyncIterable<Buffer | string> | Promise`\
Returns: [Readable stream](https://nodejs.org/api/stream.html#stream_class_stream_readable)

Adheres to the requested chunk size, except for `array` where each element will be a chunk.

### intoStream.object(input)

Type: `object | Iterable<object> | AsyncIterable<object> | Promise`\
Returns: [Readable object stream](https://nodejs.org/api/stream.html#stream_object_mode)

## Related

- [to-readable-stream](https://github.com/sindresorhus/to-readable-stream) - Simpler version of this module
