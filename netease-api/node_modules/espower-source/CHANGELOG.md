## [2.3.0](https://github.com/power-assert-js/espower-source/releases/tag/v2.3.0) (2018-06-12)


#### Features

* [Support ES2018 syntax](https://github.com/power-assert-js/espower-source/pull/20)


## [2.2.0](https://github.com/power-assert-js/espower-source/releases/tag/v2.2.0) (2017-05-05)


#### Features

* [add `ecmaVersion` and `sourceType` to options](https://github.com/power-assert-js/espower-source/pull/17)
* [add `sourceRoot` property to generated SourceMap](https://github.com/power-assert-js/espower-source/pull/18)


## [2.1.0](https://github.com/power-assert-js/espower-source/releases/tag/v2.1.0) (2017-04-09)


#### Features

* [support file SourceMap](https://github.com/power-assert-js/espower-source/pull/14) by [@shepherdwind](https://github.com/shepherdwind)


### [2.0.1](https://github.com/power-assert-js/espower-source/releases/tag/v2.0.1) (2017-02-13)


#### Bug Fixes

* [fix: ecmaVersion 7 => 2017 to support async await](https://github.com/power-assert-js/espower-source/pull/13) by [@dead-horse](https://github.com/dead-horse)


## [2.0.0](https://github.com/power-assert-js/espower-source/releases/tag/v2.0.0) (2016-11-12)


#### Features

* [Integrate `empower-assert` to enable transparent assertion enhancement](https://github.com/power-assert-js/espower-source/pull/11)
* Embed value capturing helper into transpiled code (by upgrading espower to 2.0.0) ([78a57687](https://github.com/power-assert-js/espower-source/commit/78a57687b142ae99a0eae3566042a1467c016b1e))


#### Breaking Changes

* [Drop support for prebuilt bundle, bower, and Node v0.10](https://github.com/power-assert-js/espower-source/pull/12)

We stopped providing prebuilt bundle for browsers. Please build your own by using browserify, webpack and so on.
We also dropped bower support. Please use npm instead.


## [1.2.0](https://github.com/power-assert-js/espower-source/releases/tag/v1.2.0) (2016-10-25)


#### Features

* [show SyntaxError detail](https://github.com/power-assert-js/espower-source/pull/10) (by [@shibukawa](https://github.com/shibukawa))


## [1.1.0](https://github.com/power-assert-js/espower-source/releases/tag/v1.1.0) (2016-01-22)


#### Bug Fixes

* relax too strict originalCode checking ([458ef9f1](https://github.com/power-assert-js/espower-source/commit/458ef9f1e916e3496945f046bafd36497c08fe10))


#### Features

* [add async-await support](https://github.com/power-assert-js/espower-source/pull/8) (by [@jamestalmage](https://github.com/jamestalmage))


## [1.0.0](https://github.com/power-assert-js/espower-source/releases/tag/v1.0.0) (2015-08-08)


#### Bug Fixes

* properties of outgoing SourceMap is broken when `typeof options.sourceMap` is string ([af6ba419](https://github.com/power-assert-js/espower-source/commit/af6ba419fb01ee79a4fefe4c3acc23d94bd7c1b3))
* preserve sourceRoot if incoming sourceMap contains sourceRoot ([c95e3252](https://github.com/power-assert-js/espower-source/commit/c95e32520335556b41dff73c692b5a22dc105950))

#### Features

* transfer to power-assert-js organization ([ff22316e](https://github.com/power-assert-js/espower-source/commit/ff22316eb0c45bf5ec4bb91cadc13005cfd23d30))
* ship bundle for browsers with npm module ([36b4ed84](https://github.com/power-assert-js/espower-source/commit/36b4ed845048edc7749d6c0f3e61db29dfe74d21))
* [sourceRoot option](https://github.com/power-assert-js/espower-source/pull/7)
* throw EspowerError when `originalCode` is not specified ([04d86abb](https://github.com/power-assert-js/espower-source/commit/04d86abb40af1499fde55a419346666d3b90d35a))
* clarify parameter prerequisite and its outcome ([95ed841b](https://github.com/power-assert-js/espower-source/commit/95ed841bdde5bf422fa63b0680f75d4ac82b6b74))


## [0.10.0](https://github.com/power-assert-js/espower-source/releases/tag/v0.10.0) (2014-11-11)


* **espower-source:**
  * update espower to 0.10.0 ([cd05911e](https://github.com/power-assert-js/espower-source/commit/cd05911e9199ea079f8522348624387b92a97208))


### 0.9.1 (2014-09-15)


#### Features

* **espower-source:** update espower to 0.9.1 ([8acad23d](https://github.com/power-assert-js/espower-source/commit/8acad23d1eeb613c539ed1dba09830b86e932c0f))


## 0.9.0 (2014-08-31)


#### Features

* **espower-source:** backport espowerify to support multi-stage sourcemaps ([71de737c](https://github.com/power-assert-js/espower-source/commit/71de737cb16231db852a44592e896a43c447298b))


## 0.8.0 (2014-08-12)


#### Features

* **espower-source:**
  * update espower to 0.8.0 ([ae15a229](https://github.com/power-assert-js/espower-source/commit/ae15a229367c65a7a590104f3fb0fc0b2a7582d0))
  * simple xtend would be better for options handling ([6bea0a92](https://github.com/power-assert-js/espower-source/commit/6bea0a9241aba71f2dcae9c285561e68d91531bb))


#### Breaking Changes

  * update espower to 0.8.0 ([ae15a229](https://github.com/power-assert-js/espower-source/commit/ae15a229367c65a7a590104f3fb0fc0b2a7582d0))

If you already customize instrumentation pattern using `powerAssertVariableName` and `targetMethods`, you need to migarte. To migrate, change your code from the following:

```javascript
var espowerSource = require('espower-source');
var options = {
    powerAssertVariableName: 'yourAssert',
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
var modifiedCode = espowerSource(originalCode, filepath, options);
```

To:

```javascript
var espowerSource = require('espower-source');
var options = {
    patterns: [
        'yourAssert(value, [message])',
        'yourAssert.okay(value, [message])',
        'yourAssert.equal(actual, expected, [message])',
        'yourAssert.customEqual(actual, expected, [message])'
    ]
};
var modifiedCode = espowerSource(originalCode, filepath, options);
```
