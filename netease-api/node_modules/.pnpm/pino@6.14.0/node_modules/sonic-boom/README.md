# sonic-boom&nbsp;&nbsp;![Node.js CI](https://github.com/mcollina/sonic-boom/workflows/Node.js%20CI/badge.svg)

Extremely fast utf8-only stream implementation to write to files and
file descriptors.

This implementation is partial, but support backpressure and `.pipe()` in is here.
However, it is 2-3x faster than Node Core `fs.createWriteStream()`:

```
benchSonic*1000: 1916.904ms
benchSonicSync*1000: 8605.265ms
benchSonic4k*1000: 1965.231ms
benchSonicSync4k*1000: 1588.224ms
benchCore*1000: 5851.959ms
benchConsole*1000: 7605.713ms
```

Note that sync mode without buffering is _slower_ than a Node Core WritableStream, however
this mode matches the expected behavior of `console.log()`.

Note that if this is used to log to a windows terminal (`cmd.exe` or
powershell), it is needed to run `chcp 65001` in the terminal to
correctly display utf-8 characters, see
[chcp](https://ss64.com/nt/chcp.html) for more details.

## Install

```
npm i sonic-boom
```

## Example

```js
'use strict'

const SonicBoom = require('sonic-boom')
const sonic = new SonicBoom({ fd: process.stdout.fd }) // or { dest: '/path/to/destination' }

for (let i = 0; i < 10; i++) {
  sonic.write('hello sonic\n')
}
```

## API

### SonicBoom(opts)

Creates a new instance of SonicBoom.

The options are:

* `fd`: a file descriptor, something that is returned by `fs.open` or
   `fs.openSync`.
* `dest`: a string that is a path to a file to be written to (mode `'a'`).
* `minLength`: the minimum lenght of the internal buffer that is
  required to be full before flushing.
* `sync`: perform writes synchronously (similar to `console.log`).

For `sync:false`  a `SonicBoom` instance will emit the `'ready'` event when a file descriptor is available. 
For `sync:true` this is not relevant because the `'ready'` event will be fired when the `SonicBoom` instance is created, before it can be subscribed to. 
   

### SonicBoom#write(string)

Writes the string to the file.
It will return false to signal the producer to slow down.

### SonicBoom#flush()

Writes the current buffer to the file if a write was not in progress.
Do nothing if `minLength` is zero or if it is already writing.

### SonicBoom#reopen([file])

Reopen the file in place, useful for log rotation.

Example:

```js
const stream = new SonicBoom('./my.log')
process.on('SIGUSR2', function () {
  stream.reopen()
})
```

### SonicBoom#flushSync()

Flushes the buffered data synchronously. This is a costly operation.

### SonicBoom#end()

Closes the stream, the data will be flushed down asynchronously

### SonicBoom#destroy()

Closes the stream immediately, the data is not flushed.

## License

MIT
