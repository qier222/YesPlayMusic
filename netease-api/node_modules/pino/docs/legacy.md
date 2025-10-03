# Legacy

## Legacy Node Support

### Node v4

Node v4 is supported on the [Pino v4](#pino-v4-documentation) line.

### Node v0.10-v0.12

Node v0.10 or Node v0.12 is supported on the [Pino v2](#pino-v2-documentation) line.

## Documentation

### Pino v4 Documentation

<https://github.com/pinojs/pino/tree/v4.x.x/docs>

### Pino v3 Documentation

<https://github.com/pinojs/pino/tree/v3.x.x/docs>

### Pino v2 Documentation

<https://github.com/pinojs/pino/tree/v2.x.x/docs>

## Migration

### Pino v4 to Pino v5

#### Logging Destination

In Pino v4 the destination could be set by passing a stream as the
second parameter to the exported `pino` function. This is still the
case in v5. However it's strongly recommended to use `pino.destination`
which will write logs ~30% faster.

##### v4

```js
const stdoutLogger = require('pino')()
const stderrLogger = require('pino')(process.stderr)
const fileLogger = require('pino')(fs.createWriteStream('/log/path'))
```

##### v5

```js
const stdoutLogger = require('pino')() // pino.destination by default
const stderrLogger = require('pino')(pino.destination(2))
const fileLogger = require('pino')(pino.destination('/log/path'))
```

Note: This is not a breaking change, `WritableStream` instances are still
supported, but are slower than `pino.destination` which
uses the high speed [`sonic-boom` ⇗](https://github.com/mcollina/sonic-boom) library.

* See [`destination` parameter](/docs/api.md#destination)

#### Extreme Mode

The `extreme` setting does not exist as an option in Pino v5, instead use
a `pino.extreme` destination.

##### v4

```js
const stdoutLogger = require('pino')({extreme: true})
const stderrLogger = require('pino')({extreme: true}, process.stderr)
const fileLogger = require('pino')({extreme: true}, fs.createWriteStream('/log/path'))
```

##### v5

```js
const stdoutLogger = require('pino')(pino.extreme())
const stderrLogger = require('pino')(pino.extreme(2))
const fileLogger = require('pino')(pino.extreme('/log/path'))
```

* See [pino.extreme](/docs/api.md#pino-extreme)
* See [Extreme mode ⇗](/docs/extreme.md)


#### Pino CLI is now pino-pretty CLI

The Pino CLI is provided with Pino v4 for basic log prettification.

From Pino v5 the CLI is installed separately with `pino-pretty`.

##### v4
```sh
$ npm install -g pino
$ node app.js | pino
```

##### v5
```sh
$ npm install -g pino-pretty
$ node app.js | pino-pretty
```

* See [Pretty Printing documentation](/docs/pretty.md)

#### Programmatic Pretty Printing

The [`pino.pretty()`](https://github.com/pinojs/pino/blob/v4.x.x/docs/API.md#prettyoptions)
method has also been removed from Pino v5.

##### v4

```js
var pino = require('pino')
var pretty = pino.pretty()
pretty.pipe(process.stdout)
```

##### v5

Instead use the `prettyPrint` option (also available in v4):

```js
const logger = require('pino')({
  prettyPrint: process.env.NODE_ENV !== 'production'
})
```

In v5 the `pretty-print` module must be installed to use the `prettyPrint` option:

```sh
npm install --save-dev pino-pretty
```

* See [prettyPrint option](/docs/api.md#prettyPrint)
* See [Pretty Printing documentation](/docs/pretty.md)

#### Slowtime

In Pino v4 a `slowtime` option was supplied, which allowed for full ISO dates
in the timestamps instead of milliseconds since the Epoch. In Pino v5 this
has been completely removed, along with the `pino.stdTimeFunctions.slowTime`
function. In order to achieve the equivalent in v5, a custom
time function should be supplied:

##### v4

```js
const pino = require('pino')
const logger = pino({slowtime: true})
// following avoids deprecation warning in v4:
const loggerAlt = pino({timestamp: pino.stdTimeFunctions.slowTime})
```

##### v5

```js
const logger = require('pino')({
  timestamp: () => ',"time":"' + (new Date()).toISOString() + '"'
})
```

The practice of creating ISO dates in-process for logging purposes is strongly
recommended against. Instead consider post-processing the logs or using a transport
to convert the timestamps.


* See [timestamp option](/docs/api.md#timestamp)
