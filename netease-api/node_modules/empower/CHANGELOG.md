### [1.3.1](https://github.com/power-assert-js/empower/releases/tag/v1.3.1) (2018-09-08)


#### Bug Fixes

* [to work well with Jest, treat power-assert message as "not generated" to avoid message override](https://github.com/power-assert-js/empower/pull/29)


## [1.3.0](https://github.com/power-assert-js/empower/releases/tag/v1.3.0) (2018-06-12)


#### Features

* set stackStartFunction to self if undefined ([8d734cf1](https://github.com/power-assert-js/empower/commit/8d734cf1d501b868b4cd65d34b382a8f7170018d))

#### Chore

* update empower-core to 1.2.0, nothing has changed but has integrated into power-assert-runtime monorepo. ([1a3d2f66](1a3d2f666732e66fd6d1cd5419ce671a4d46e25a))


### [1.2.3](https://github.com/power-assert-js/empower/releases/tag/v1.2.3) (2017-06-09)


#### Bug Fixes

* [Re-instantiate AssertionError under Node v8 (and v7)](https://github.com/power-assert-js/empower/pull/26)


### [1.2.2](https://github.com/power-assert-js/empower/releases/tag/v1.2.2) (2017-06-03)


#### Bug Fixes

* [dealing with `err.name` on Node v8](https://github.com/power-assert-js/empower/pull/25)


### [1.2.1](https://github.com/power-assert-js/empower/releases/tag/v1.2.1) (2016-06-05)


  * remove xtend from dependencies ([366f5c9](https://github.com/power-assert-js/empower/commit/366f5c909151ddce59f22999987717a7e2626d31))
  * update empower-core to 0.6.1 ([9194fe8](https://github.com/power-assert-js/empower/commit/9194fe8d35906623934966e37a38a27ed4a23f1a))


## [1.2.0](https://github.com/power-assert-js/empower/releases/tag/v1.2.0) (2016-06-01)


#### Features

  * [Extract core functionality to empower-core](https://github.com/power-assert-js/empower/pull/22)


## [1.1.0](https://github.com/power-assert-js/empower/releases/tag/v1.1.0) (2015-11-07)


#### Features

  * [support async-await state flags](https://github.com/power-assert-js/empower/pull/17) (by [@jamestalmage](https://github.com/jamestalmage))


### [1.0.2](https://github.com/power-assert-js/empower/releases/tag/v1.0.2) (2015-10-22)


#### Bug Fixes

  * [make `_capt` and `_expr` methods not enumerable](https://github.com/power-assert-js/empower/pull/16)


### [1.0.1](https://github.com/power-assert-js/empower/releases/tag/v1.0.1) (2015-09-08)


  * apply licensify on build ([282259b](https://github.com/power-assert-js/empower/commit/282259b632333c62e02113e374baa76dd7cd2890))


## [1.0.0](https://github.com/power-assert-js/empower/releases/tag/v1.0.0) (2015-05-25)


#### Features

  * transfer to power-assert-js organization ([0cd9a89a](https://github.com/power-assert-js/empower/commit/0cd9a89ad3964c863e7f448ba46d565735850539))
  * support `deepStrictEqual` and `notDeepStrictEqual` ([bbaa9121](https://github.com/power-assert-js/empower/commit/bbaa91211bc7779a94934165b0d827ec89df6c5c))
  * use ponyfills for older browsers ([efea6e17](https://github.com/power-assert-js/empower/commit/efea6e173e28922eae7342d7e9f1f832992a99fd))


## [0.11.0](https://github.com/power-assert-js/empower/releases/tag/v0.11.0) (2015-04-18)


#### Features

* **empower:**
  * ship npm module with built bundle for browsers ([e9448d3b](https://github.com/power-assert-js/empower/commit/e9448d3bfd4b44e64810cb2d1e18d6a4e2c6ba4b))


## [0.10.0](https://github.com/power-assert-js/empower/releases/tag/v0.10.0) (2014-11-11)


* **empower:**
  * update escallmatch ([f7a0d970](https://github.com/power-assert-js/empower/commit/f7a0d970333cdec25aacaf3880473da5ccec24de))


### 0.9.1 (2014-10-07)

#### Bug Fixes

* **empower:** power-assert output doesn't appear in Node 0.11.x ([53e882e0](https://github.com/power-assert-js/empower/commit/53e882e00ad3dd8b45f262ab14ac782ed582b954))


## 0.9.0 (2014-09-01)


## 0.8.0 (2014-08-12)


#### Features


* **empower:**
  * [modularized by browserify](https://github.com/power-assert-js/empower/pull/12)
  * use `escallmatch` module to describe target patterns ([533a21a0](https://github.com/power-assert-js/empower/commit/533a21a0374f23f5ca4e198c17d1e20f10d705fa))
  * support assertion methods with three or more arguments ([d31dca86](https://github.com/power-assert-js/empower/commit/d31dca86de2b05ee88ca5df15579308368657d43))
  * if not in patterns, do not empower assertion function itself ([1d73a756](https://github.com/power-assert-js/empower/commit/1d73a7560ef586a45a0a9259e57c143b3b60caaa))
  * option `targetMethods` does not required any more ([8ffcc49f](https://github.com/power-assert-js/empower/commit/8ffcc49fcdb5523eb38e63a0e7cca34f752d9302))
  * rename `saveContextOnFail` option to `saveContextOnRethrow` ([1f6133b2](https://github.com/power-assert-js/empower/commit/1f6133b24be672f32cfd3b66522a7d14ca5d22e1))
  * rename `modifyMessageOnFail` option to `modifyMessageOnRethrow` ([0c8a88f0](https://github.com/power-assert-js/empower/commit/0c8a88f0592917ba15ac0c1bf21c8f39f39ab350))


#### Breaking Changes

* `saveContextOnFail` option is renamed to `saveContextOnRethrow`

There is nothing to change unless you are using `saveContextOnFail` option.

If you are using `saveContextOnFail` option, change your code from the following:

`empower(originalAssert, formatter, {saveContextOnFail: true})`

To:

`empower(originalAssert, formatter, {saveContextOnRethrow: true})`

 ([1f6133b2](https://github.com/power-assert-js/empower/commit/1f6133b24be672f32cfd3b66522a7d14ca5d22e1))

* `modifyMessageOnFail` option is renamed to `modifyMessageOnRethrow`

There is nothing to change unless you are using `modifyMessageOnFail` option.

If you are using `modifyMessageOnFail` option, change your code from the following:

`empower(originalAssert, formatter, {modifyMessageOnFail: true})`

To:

`empower(originalAssert, formatter, {modifyMessageOnRethrow: true})`

 ([0c8a88f0](https://github.com/power-assert-js/empower/commit/0c8a88f0592917ba15ac0c1bf21c8f39f39ab350))

* option `targetMethods` does not required any more

If you already customize enhancement pattern using `targetMethods`, you need to migarte. To migrate, change your code from the following:

```javascript
var yourAssert = require('./your-assert');
var empower = require('empower');
var formatter = require('power-assert-formatter')();
var options = {
    targetMethods: {
        oneArg: [
            'okay'
        ],
        twoArgs: [
            'equal',
            'customEqual'
        ]
    }
};
var assert = empower(yourAssert, formatter, options);
```

To:

```javascript
var yourAssert = require('./your-assert');
var empower = require('empower');
var formatter = require('power-assert-formatter')();
var options = {
    patterns: [
        'yourAssert(value, [message])',
        'yourAssert.okay(value, [message])',
        'yourAssert.equal(actual, expected, [message])',
        'yourAssert.customEqual(actual, expected, [message])'
    ]
};
var assert = empower(yourAssert, formatter, options);
```

([8ffcc49f](https://github.com/power-assert-js/empower/commit/8ffcc49fcdb5523eb38e63a0e7cca34f752d9302))
