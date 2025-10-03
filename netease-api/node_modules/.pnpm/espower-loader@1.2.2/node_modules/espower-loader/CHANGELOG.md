### [1.2.2](https://github.com/power-assert-js/espower-loader/releases/tag/v1.2.2) (2017-04-24)


#### Bug Fixes

  * [fix the filepath of the stack](https://github.com/power-assert-js/espower-loader/pull/7) by [@popomore](https://github.com/popomore)


### [1.2.1](https://github.com/power-assert-js/espower-loader/releases/tag/v1.2.1) (2017-04-09)


  * [update source-map-support to 0.4.x](https://github.com/power-assert-js/espower-loader/pull/6) by [@shepherdwind](https://github.com/shepherdwind)


## [1.2.0](https://github.com/power-assert-js/espower-loader/releases/tag/v1.2.0) (2016-11-13)


#### Features

* use `process.cwd()` by default ([67edccdb](https://github.com/power-assert-js/espower-loader/commit/67edccdb898ecc6a9011716addc79346bef340cf))


## [1.1.0](https://github.com/power-assert-js/espower-loader/releases/tag/v1.1.0) (2016-11-12)


#### Features

* [Enable transparent assertion enhancement, embed value capturing helper into transpiled code (by upgrading espower-source to 2.0.0)](https://github.com/power-assert-js/espower-loader/pull/5)


### [1.0.1](https://github.com/power-assert-js/espower-loader/releases/tag/v1.0.1) (2016-07-30)


  * upgrade minimatch to ^3.0.0 ([5b63cc9](https://github.com/power-assert-js/espower-loader/commit/5b63cc9f3cb6a48678b0d676fecc02076bfb4e0e))


## [1.0.0](https://github.com/power-assert-js/espower-loader/releases/tag/v1.0.0) (2015-08-21)


#### Features

  * transfer to power-assert-js organization ([2e155de8](https://github.com/power-assert-js/espower-loader/commit/2e155de84900584ae678c4a9d413b92ffe5051ee))
  * [use options.cwd for default sourceRoot](https://github.com/power-assert-js/espower-loader/pull/4)


## [0.11.0](https://github.com/power-assert-js/espower-loader/releases/tag/v0.11.0) (2015-05-06)


#### Features

* [Adjust line and column number in stack traces](https://github.com/power-assert-js/espower-loader/pull/3)


## [0.10.0](https://github.com/power-assert-js/espower-loader/releases/tag/v0.10.0) (2014-11-11)


* **espower-loader:**
  * update espower-source to 0.10.0 ([0994df9a](https://github.com/power-assert-js/espower-loader/commit/0994df9a82129bee712543f80bc94b16fe83f23f))


### 0.9.1 (2014-09-17)


#### Features

* **espower-loader:** update espower-source to 0.9.1 ([de14b9ad](https://github.com/power-assert-js/espower-loader/commit/de14b9ad5cc6d12a8193529fe6344608d2e23eaf))


## 0.9.0 (2014-09-02)


#### Features

* **espower-loader:** use espower-source 0.9.0 ([c5329f39](https://github.com/power-assert-js/espower-loader/commit/c5329f397d4ab8e434a1788d0fa1c2eb7670a25c))


## 0.8.0 (2014-08-12)


#### Features

* **espower-loader:** update espower-source to 0.8.0 ([54c2143b](https://github.com/power-assert-js/espower-loader/commit/54c2143bba3966aaf61f1a4d331f3543257f9222))


#### Breaking Changes

If you already customize instrumentation pattern using `powerAssertVariableName` and `targetMethods`, you need to migarte. To migrate, change your code from the following:

```javascript
require('espower-loader')({
    cwd: process.cwd(),
    pattern: 'test/**/*.js',
    espowerOptions: {
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
    }
});
```

To:

```javascript
require('espower-loader')({
    cwd: process.cwd(),
    pattern: 'test/**/*.js',
    espowerOptions: {
        patterns: [
            'yourAssert(value, [message])',
            'yourAssert.okay(value, [message])',
            'yourAssert.equal(actual, expected, [message])',
            'yourAssert.customEqual(actual, expected, [message])'
        ]
    }
});
```
