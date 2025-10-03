# async-generator-function <sup>[![Version Badge][npm-version-svg]][package-url]</sup>

[![github actions][actions-image]][actions-url]
[![coverage][codecov-image]][codecov-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

[![npm badge][npm-badge-png]][package-url]

A function that returns the normally hidden `AsyncFunction` constructor, when available.

## Getting started

```sh
npm install --save async-generator-function
```

## Usage/Examples

```js
const assert = require('assert');
const AsyncGeneratorFunction = require('async-generator-function')();

const fn = new AsyncGeneratorFunction('return 1');

assert.equal(fn.toString(), 'async function* anonymous(\n) {\nreturn 1\n}');

const iterator = fn();
iterator.next().then(x => {
    assert.deepEqual(x, { done: true, value: 1 });
});
```

## Tests

Clone the repo, `npm install`, and run `npm test`

[package-url]: https://npmjs.org/package/async-generator-function
[npm-version-svg]: https://versionbadg.es/ljharb/async-generator-function.svg
[deps-svg]: https://david-dm.org/ljharb/async-generator-function.svg
[deps-url]: https://david-dm.org/ljharb/async-generator-function
[dev-deps-svg]: https://david-dm.org/ljharb/async-generator-function/dev-status.svg
[dev-deps-url]: https://david-dm.org/ljharb/async-generator-function#info=devDependencies
[npm-badge-png]: https://nodei.co/npm/async-generator-function.png?downloads=true&stars=true
[license-image]: https://img.shields.io/npm/l/async-generator-function.svg
[license-url]: LICENSE
[downloads-image]: https://img.shields.io/npm/dm/async-generator-function.svg
[downloads-url]: https://npm-stat.com/charts.html?package=async-generator-function
[codecov-image]: https://codecov.io/gh/ljharb/async-generator-function/branch/main/graphs/badge.svg
[codecov-url]: https://app.codecov.io/gh/ljharb/async-generator-function/
[actions-image]: https://img.shields.io/endpoint?url=https://github-actions-badge-u3jn4tfpocch.runkit.sh/ljharb/async-generator-function
[actions-url]: https://github.com/ljharb/async-generator-function/actions
