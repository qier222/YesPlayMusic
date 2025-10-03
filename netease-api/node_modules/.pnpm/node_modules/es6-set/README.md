[![Build status][build-image]][build-url]
[![Tests coverage][cov-image]][cov-url]
[![npm version][npm-image]][npm-url]

# es6-set

## Set collection as specified in ECMAScript6

**Warning:  
v0.1 version does not ensure O(1) algorithm complexity (but O(n)). This shortcoming will be addressed in v1.0**

### Usage

If you want to make sure your environment implements `Set`, do:

```javascript
require("es6-set/implement");
```

If you'd like to use native version when it exists and fallback to polyfill if it doesn't, but without implementing `Set` on global scope, do:

```javascript
var Set = require("es6-set");
```

If you strictly want to use polyfill even if native `Set` exists, do:

```javascript
var Set = require("es6-set/polyfill");
```

### Installation

    $ npm install es6-set

To port it to Browser or any other (non CJS) environment, use your favorite CJS bundler. No favorite yet? Try: [Browserify](http://browserify.org/), [Webmake](https://github.com/medikoo/modules-webmake) or [Webpack](http://webpack.github.io/)

#### API

Best is to refer to [specification](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-set-objects). Still if you want quick look, follow examples:

```javascript
var Set = require("es6-set");

var set = new Set(["raz", "dwa", {}]);

set.size; // 3
set.has("raz"); // true
set.has("foo"); // false
set.add("foo"); // set
set.size; // 4
set.has("foo"); // true
set.has("dwa"); // true
set.delete("dwa"); // true
set.size; // 3

set.forEach(function (value) {
  // 'raz', {}, 'foo' iterated
});

// FF nightly only:
for (value of set) {
  // 'raz', {}, 'foo' iterated
}

var iterator = set.values();

iterator.next(); // { done: false, value: 'raz' }
iterator.next(); // { done: false, value: {} }
iterator.next(); // { done: false, value: 'foo' }
iterator.next(); // { done: true, value: undefined }

set.clear(); // undefined
set.size; // 0
```

## Tests

    $ npm test

## Security contact information

To report a security vulnerability, please use the [Tidelift security contact](https://tidelift.com/security). Tidelift will coordinate the fix and disclosure.

---

<div align="center">
	<b>
		<a href="https://tidelift.com/subscription/pkg/npm-es6-set?utm_source=npm-es6-set&utm_medium=referral&utm_campaign=readme">Get professional support for d with a Tidelift subscription</a>
	</b>
	<br>
	<sub>
		Tidelift helps make open source sustainable for maintainers while giving companies<br>assurances about security, maintenance, and licensing for their dependencies.
	</sub>
</div>

[build-image]: https://github.com/medikoo/es6-set/workflows/Integrate/badge.svg
[build-url]: https://github.com/medikoo/es6-set/actions?query=workflow%3AIntegrate
[cov-image]: https://img.shields.io/codecov/c/github/medikoo/es6-set.svg
[cov-url]: https://codecov.io/gh/medikoo/es6-set
[npm-image]: https://img.shields.io/npm/v/es6-set.svg
[npm-url]: https://www.npmjs.com/package/es6-set
