universal-deep-strict-equal
================================

A port of [Node v6's internal _deepEqual function](https://github.com/nodejs/node/blob/v6.3.0/lib/assert.js#L145) in a universal style.

[![Build Status][travis-image]][travis-url]
[![NPM version][npm-image]][npm-url]
[![License][license-image]][license-url]

[![Sauce Test Status][saucelabs-image]][saucelabs-url]

*Issues and improvements should be done in [Node.js](https://github.com/nodejs/node/issues) first.*


API
---------------------------------------

`deepEqual(actual, expected, [strict])`


USAGE
---------------------------------------

```javascript
var deepEqual = require('universal-deep-strict-equal');

deepEqual({a:1}, {a:'1'}); // => true
deepEqual({a:1}, {a:'1'}, false); // => true
deepEqual({a:1}, {a:'1'}, true); // => false
```


INSTALL
---------------------------------------

```
npm install universal-deep-strict-equal
```


AUTHOR
---------------------------------------
* [Takuto Wada](https://github.com/twada)


CONTRIBUTORS
---------------------------------------
* [azu](https://github.com/azu)


LICENSE
---------------------------------------
Licensed under the [MIT](http://twada.mit-license.org/) license.


[travis-url]: https://travis-ci.org/twada/universal-deep-strict-equal
[travis-image]: https://secure.travis-ci.org/twada/universal-deep-strict-equal.svg?branch=master

[npm-url]: https://npmjs.org/package/universal-deep-strict-equal
[npm-image]: https://badge.fury.io/js/universal-deep-strict-equal.svg

[license-url]: http://twada.mit-license.org/
[license-image]: https://img.shields.io/badge/license-MIT-brightgreen.svg

[saucelabs-url]: https://saucelabs.com/u/udse
[saucelabs-image]: https://saucelabs.com/browser-matrix/udse.svg
