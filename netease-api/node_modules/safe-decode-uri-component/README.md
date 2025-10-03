# safe-decode-uri-component

[![Build Status](https://travis-ci.org/jridgewell/safe-decode-uri-component.svg?branch=master)](https://travis-ci.org/jridgewell/safe-decode-uri-component)

Decodes strings that were encoded by `encodeURI` and
`encodeURIComponent`, without throwing errors on invalid escapes.

```js
const base = "http://github.com";
const query = `?value=${encodeURIComponent('test ⚡')}`;

let url = base + query; // => "http://github.com?value=test%20%E2%9A%A1"

// Now, something happens and the url gets truncated:
// url = "http://github.com?value=test%20%E2%9A%A"

decodeURIComponent(url); // THROWS ERROR
```

Truncating "useless" characters from a URL happens for any number of
reasons.  Or, maybe your user just typed in a bad URL? Either way, it's
annoying when all you want is the decoded value, treating invalid
escapes as if they were just regular characters.


```js
const decode = require('safe-decode-uri-component');

decode(url); // => "http://github.com?value=test %E2%9A%A"
```

Notice that `%20` was decoded to a space, and the invalid sequence
`%E2%9A%A` remains. This is exactly like `decodeURIComponent`, except we
don't balk at an invalid sequence.

```js
decode("value=test%20%E2%9A%A1"); // => "value=test ⚡"
decode("value=test%20%E2%9A%A");  // => "value=test %E2%9A%A"
decode("value=test%20%E2%9A%");   // => "value=test %E2%9A%"
decode("value=test%20%E2%9A");    // => "value=test %E2%9A"
decode("value=test%20%E2%9");     // => "value=test %E2%9"
decode("value=test%20%E2%");      // => "value=test %E2%"
decode("value=test%20%E2");       // => "value=test %E2"
decode("value=test%20%E");        // => "value=test %E"
decode("value=test%20%");         // => "value=test %"
decode("value=test%20");          // => "value=test "
decode("value=test%2");           // => "value=test%2"
decode("value=test%");            // => "value=test%"
decode("value=test");             // => "value=test"
```

## Installation

```bash
npm install --save safe-decode-uri-component
```

## Node.js

We also provide a native Node.js module, available as the `native` tag:

```bash
npm install --save safe-decode-uri-component@native
```

It's way faster, faster than even native `decodeURIComponent`.

```
$ npm run benchmark

Short String (native) x 1,448,425 ops/sec ±0.97% (85 runs sampled)
Short String (safe) x 3,449,002 ops/sec ±0.73% (88 runs sampled)
Fastest is Short String (safe)

Medium String (native) x 18,491 ops/sec ±0.84% (90 runs sampled)
Medium String (safe) x 22,695 ops/sec ±0.81% (88 runs sampled)
Fastest is Medium String (safe)

Long String (native) x 33.56 ops/sec ±1.01% (58 runs sampled)
Long String (safe) x 41.83 ops/sec ±0.73% (54 runs sampled)
Fastest is Long String (safe)
```
