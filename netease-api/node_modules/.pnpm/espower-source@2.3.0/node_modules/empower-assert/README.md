empower-assert
====

Convert [assert](https://nodejs.org/api/assert.html) to [power-assert](https://github.com/power-assert-js/power-assert) on [ESTree AST](https://github.com/estree/estree).

[![NPM version][npm-image]][npm-url]
![Node.js version support][node-version]
[![build status][travis-image]][travis-url]
[![Dependency Status][deps-image]][deps-url]
![MIT License][license]

## Install

```bash
$ npm install --save-dev empower-assert
```

## Usage

```js
const empowerAssert = require('empower-assert');
const acorn = require('acorn');
const escodegen = require('escodegen');

let source = 
`'use strict';
const assert = require('assert');
function add(a, b) {
    assert(!isNaN(a));
    assert.equal(typeof b, 'number');
    assert.ok(!isNaN(b));
    return a + b;
}`;

let transformed = empowerAssert(acorn.parse(source));
console.log(escodegen.generate(transformed));
// 'use strict';
// const assert = require('power-assert');
// function add(a, b) {
//     assert(!isNaN(a));
//     assert.equal(typeof b, 'number');
//     assert.ok(!isNaN(b));
//     return a + b;
// }
```

## License

MIT License: Teppei Sato &lt;teppeis@gmail.com&gt;

This is a port of [babel-plugin-empower-assert](https://github.com/power-assert-js/babel-plugin-empower-assert).  
Copyright (c) 2016 Takuto Wada, https://github.com/power-assert-js/babel-plugin-empower-assert

[npm-image]: https://img.shields.io/npm/v/empower-assert.svg
[npm-url]: https://npmjs.org/package/empower-assert
[travis-image]: https://travis-ci.org/teppeis/empower-assert.svg?branch=master
[travis-url]: https://travis-ci.org/teppeis/empower-assert
[deps-image]: https://david-dm.org/teppeis/empower-assert.svg
[deps-url]: https://david-dm.org/teppeis/empower-assert
[node-version]: https://img.shields.io/badge/Node.js%20support-v0.12–v7-brightgreen.svg
[license]: https://img.shields.io/npm/l/empower-assert.svg
