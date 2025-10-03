# Asynchronous Logging

In essence, asynchronous logging enables even faster performance by Pino.

In Pino's standard mode of operation log messages are directly written to the
output stream as the messages are generated with a _blocking_ operation.
Asynchronous logging works by buffering
log messages and writing them in larger chunks.

```js
const pino = require('pino')
const logger = pino(pino.destination({
  dest: './my-file', // omit for stdout
  minLength: 4096, // Buffer before writing
  sync: false // Asynchronous logging
}))
```

* See [`pino.destination`](/docs/api.md#pino-destination)
* `pino.destination` is implemented on [`sonic-boom` ⇗](https://github.com/mcollina/sonic-boom).

## Caveats

This has a couple of important caveats:

* 4KB of spare RAM will be needed for logging
* As opposed to the default mode, there is not a one-to-one relationship between
  calls to logging methods (e.g. `logger.info`) and writes to a log file
* There is a possibility of the most recently buffered log messages being lost
  (up to 4KB of logs)
  * For instance, a power cut will mean up to 4KB of buffered logs will be lost

So in summary, use asynchronous logging only when performing an extreme amount of
logging, and it is acceptable to potentially lose the most recent logs.

* Pino will register handlers for the following process events/signals so that
  Pino can flush the asynchronous logger buffer:

  + `beforeExit`
  + `exit`
  + `uncaughtException`
  + `SIGHUP`
  + `SIGINT`
  + `SIGQUIT`
  + `SIGTERM`

  In all of these cases, except `SIGHUP`, the process is in a state that it
  *must* terminate. Thus, if an `onTerminated` function isn't registered when
  constructing a Pino instance (see [pino#constructor](api.md#constructor)),
  then Pino will invoke `process.exit(0)` when no error has occurred, or
  `process.exit(1)` otherwise. If an `onTerminated` function is supplied, it
  is the responsibility of the `onTerminated` function to manually exit the process.

  In the case of `SIGHUP`, we will look to see if any other handlers are
  registered for the event. If not, we will proceed as we do with all other
  signals. If there are more handlers registered than just our own, we will
  simply flush the asynchronous logging buffer.

### AWS Lambda

On AWS Lambda we recommend to call `dest.flushSync()` at the end
of each function execution to avoid losing data.

## Usage

The `pino.destination({ sync: false })` method will provide an asynchronous destination.

```js
const pino = require('pino')
const dest = pino.destination({ sync: false }) // logs to stdout with no args
const logger = pino(dest)
```

<a id='log-loss-prevention'></a>
## Log loss prevention

The following strategy can be used to minimize log loss:

```js
const pino = require('pino')
const dest = pino.destination({ sync: false })
const logger = pino(dest)

// asynchronously flush every 10 seconds to keep the buffer empty
// in periods of low activity
setInterval(function () {
  logger.flush()
}, 10000).unref()

// use pino.final to create a special logger that
// guarantees final tick writes
const handler = pino.final(logger, (err, finalLogger, evt) => {
  finalLogger.info(`${evt} caught`)
  if (err) finalLogger.error(err, 'error caused exit')
  process.exit(err ? 1 : 0)
})
// catch all the ways node might exit
process.on('beforeExit', () => handler(null, 'beforeExit'))
process.on('exit', () => handler(null, 'exit'))
process.on('uncaughtException', (err) => handler(err, 'uncaughtException'))
process.on('SIGINT', () => handler(null, 'SIGINT'))
process.on('SIGQUIT', () => handler(null, 'SIGQUIT'))
process.on('SIGTERM', () => handler(null, 'SIGTERM'))
```

* See [`pino.destination` api](/docs/api.md#pino-destination)
* See [`pino.final` api](/docs/api.md#pino-final)
* See [`destination` parameter](/docs/api.md#destination)
