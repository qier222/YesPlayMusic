empower-core
================================

[![power-assert][power-assert-banner]][power-assert-url]

[![Build Status][travis-image]][travis-url]
[![NPM package][npm-image]][npm-url]
[![License][license-image]][license-url]


Power Assert feature enhancer for assert function/object.


DESCRIPTION
---------------------------------------
`empower-core` is a core module of [power-assert](https://github.com/power-assert-js/power-assert) family. `empower-core` enhances standard `assert` function or any assert-like object to work with power-assert feature added code instrumented by [espower](https://github.com/power-assert-js/espower).


`empower-core` works with standard `assert` function (best fit with [Mocha](https://mochajs.org/)), and also supports assert-like objects/functions provided by various testing frameworks such as [QUnit](https://qunitjs.com/), [buster.js](http://docs.busterjs.org/en/latest/), and [nodeunit](https://github.com/caolan/nodeunit).


Pull-requests, issue reports and patches are always welcomed. See [power-assert](https://github.com/power-assert-js/power-assert) project for more documentation.


CHANGELOG
---------------------------------------
See [CHANGELOG](https://github.com/twada/power-assert-runtime/packages/empower-core/blob/master/CHANGELOG.md)


API
---------------------------------------

### var enhancedAssert = empowerCore(originalAssert, [options])

| return type            |
|:-----------------------|
| `function` or `object` |

`empower-core` function takes function or object(`originalAssert`) then returns PowerAssert feature added function/object based on `originalAssert`.
If `destructive` option is falsy, `originalAssert` will be unchanged. If `destructive` option is truthy, `originalAssert` will be manipulated directly and returned `enhancedAssert` will be the same instance of `originalAssert`.


#### originalAssert

| type                   | default value |
|:-----------------------|:--------------|
| `function` or `object` | N/A           |

`originalAssert` is an instance of standard `assert` function or any assert-like object. see [SUPPORTED ASSERTION LIBRARIES](https://github.com/twada/power-assert-runtime/packages/empower-core#supported-assertion-libraries) and [ASSERTION LIBRARIES KNOWN TO WORK](https://github.com/twada/power-assert-runtime/packages/empower-core#assertion-libraries-known-to-work) section. Be careful that `originalAssert` will be manipulated directly if `destructive` option is truthy.


#### options

| type     | default value |
|:---------|:--------------|
| `object` | (return value of `empowerCore.defaultOptions()`) |

Configuration options. If not passed, default options will be used.


#### options.destructive

| type      | default value |
|:----------|:--------------|
| `boolean` | `false`       |

If truthy, modify `originalAssert` destructively.

If `false`, empower-core mimics originalAssert as new object/function, so `originalAssert` will not be changed. If `true`, `originalAssert` will be manipulated directly and returned `enhancedAssert` will be the same instance of `originalAssert`.


#### options.bindReceiver

| type      | default value |
|:----------|:--------------|
| `boolean` | `true`        |

`bindReceiver` defaults to `true`, meaning assertion methods have their `this` value bound to the original assertion. Setting `bindReceiver` to false causes the `this` reference to be passed through from the actual invocation.


#### options.onError
#### options.onSuccess

| type       | default value |
|:-----------|:--------------|
| `function` | (function defined in `empowerCore.defaultOptions()`) |

Both methods are called with a single `event` argument, it will have the following properties:

- `event.enhanced` - `true` for methods matching `patterns`. `false` for methods matching `wrapOnlyPatterns`.

- `event.originalMessage` - The actual value the user provided for optional `message` parameter. This will be `undefined` if the user did not provide a value, even if the underlying assertion provides a default message.

- `event.defaultMessage` - If you use objects instead of strings to specify patterns (see below), the `defaultMessage` metadata will be copied directly on the event object.

- `event.matcherSpec` - This contains the complete parsed matcher spec as supplied, as well as any additional metadata you may have supplied (see patterns section below for details on how to supply additional metadata).

- `event.args` - An array of the actual arguments passed to the assertion.

- `event.assertionThrew` - Whether or not the underlying assertion threw an error. This will always be `true` in an `onError` callback, and always `false` in an `onSuccess` callback.

- `event.error` - Only present if `event.assertionThrew === true`. Contains the error thrown by the underlying assertion method.

- `event.returnValue` - Only present if `event.assertionThrew === false`. Contains the value return value returned by the underlying assertion method.

- `event.powerAssertContext` - Only present for methods that match `patterns`, and only in code that has been enhanced with the power-assert transform. It contains the information necessary for power-assert renderers to generate their output. Implementors of `onError` should usually attach it to the error object

  ```js
  function onError (errorEvent) {
    var e = errorEvent.error;
    if (errorEvent.powerAssertContext && /^AssertionError/.test(e.name)) {
        e.powerAssertContext = errorEvent.powerAssertContext;
    }
    throw e;
  }
  ```

#### options.modifyMessageBeforeAssert

| type       | default value |
|:-----------|:--------------|
| `function` | N/A           |

TBD


#### options.patterns

| type                | default value       |
|:--------------------|:--------------------|
| `Array` of `string` or `objects`| objects shown below |

```javascript
[
    'assert(value, [message])',
    'assert.ok(value, [message])',
    'assert.equal(actual, expected, [message])',
    'assert.notEqual(actual, expected, [message])',
    'assert.strictEqual(actual, expected, [message])',
    'assert.notStrictEqual(actual, expected, [message])',
    'assert.deepEqual(actual, expected, [message])',
    'assert.notDeepEqual(actual, expected, [message])',
    'assert.deepStrictEqual(actual, expected, [message])',
    'assert.notDeepStrictEqual(actual, expected, [message])'
]
```
Target patterns for power assert feature instrumentation.

Pattern detection is done by [call-signature](https://github.com/jamestalmage/call-signature). Any arguments enclosed in bracket (for example, `[message]`) means optional parameters. Without bracket means mandatory parameters.

Instead of a string, you may alternatively specify an object with a `pattern` property, and any other arbitrary data.
Currently only `defaultMessage` is formally recommended, but you can attach any data here and it will be passed to the `onSuccess` and `onError` handlers.

```javascript
[
  {
    pattern: 'assert.fail([message])',
    defaultMessage:'assert.fail() was called!!'
  },
  ...
]
```

#### options.wrapOnlyPatterns

| type                | default value       |
|:--------------------|:--------------------|
| `Array` of `string` | empty array         |

Methods matching these patterns will not be instrumented by the code transform, but they will be wrapped at runtime and trigger events in the `onSuccess` and `onError` callbacks. Note that "wrap only" events will never have a `powerAssertContext` property.

Similar to the `options.patterns`, you may supply objects with a `pattern` member, and the additional metadata will be passed to the assertion listeners.

### var options = empowerCore.defaultOptions();

Returns default options object for `empowerCore` function. In other words, returns

```javascript
{
    destructive: false,
    onError: onError,
    onSuccess: onSuccess,
    patterns: [
        'assert(value, [message])',
        'assert.ok(value, [message])',
        'assert.equal(actual, expected, [message])',
        'assert.notEqual(actual, expected, [message])',
        'assert.strictEqual(actual, expected, [message])',
        'assert.notStrictEqual(actual, expected, [message])',
        'assert.deepEqual(actual, expected, [message])',
        'assert.notDeepEqual(actual, expected, [message])',
        'assert.deepStrictEqual(actual, expected, [message])',
        'assert.notDeepStrictEqual(actual, expected, [message])'
    ]
}
```

with sensible default for `onError` and `onSuccess`

```js
function onError (errorEvent) {
    var e = errorEvent.error;
    if (errorEvent.powerAssertContext && e.name === 'AssertionError') {
        e.powerAssertContext = errorEvent.powerAssertContext;
    }
    throw e;
}

function onSuccess(successEvent) {
    return successEvent.returnValue;
}
```


SUPPORTED ASSERTION LIBRARIES
---------------------------------------
* [Node assert API](https://nodejs.org/api/assert.html)


ASSERTION LIBRARIES KNOWN TO WORK
---------------------------------------
* [QUnit.assert](https://qunitjs.com/)
* [nodeunit](https://github.com/caolan/nodeunit)
* [buster-assertions](http://docs.busterjs.org/en/latest/modules/buster-assertions/)


INSTALL
---------------------------------------

### via npm

Install

    $ npm install --save-dev empower-core


#### use empower-core npm module on browser

`empowerCore` function is exported

    <script type="text/javascript" src="./path/to/node_modules/empower-core/build/empower-core.js"></script>


### via bower

Install

    $ bower install --save-dev empower-core

Then load (`empowerCore` function is exported)

    <script type="text/javascript" src="./path/to/bower_components/empower-core/build/empower-core.js"></script>


OUR SUPPORT POLICY
---------------------------------------

We support Node under maintenance. In other words, we stop supporting old Node version when [their maintenance ends](https://github.com/nodejs/LTS).

We also support "modern enough" browsers such as Chrome, Firefox, Safari, Edge etc.

Any other environments are not supported officially (means that we do not test against them on CI service). empower-core is known to work with old browsers, and trying to keep them working though.


AUTHOR
---------------------------------------
* [Takuto Wada](https://github.com/twada)


CONTRIBUTORS
---------------------------------------
* [James Talmage (jamestalmage)](https://github.com/jamestalmage)


LICENSE
---------------------------------------
Licensed under the [MIT](https://github.com/twada/power-assert-runtime/blob/master/LICENSE) license.


[power-assert-url]: https://github.com/power-assert-js/power-assert
[power-assert-banner]: https://raw.githubusercontent.com/power-assert-js/power-assert-js-logo/master/banner/banner-official-fullcolor.png

[travis-url]: https://travis-ci.org/twada/power-assert-runtime
[travis-image]: https://secure.travis-ci.org/twada/power-assert-runtime.svg?branch=master

[npm-url]: https://npmjs.org/package/empower-core
[npm-image]: https://badge.fury.io/js/empower-core.svg

[license-url]: https://github.com/twada/power-assert-runtime/blob/master/LICENSE
[license-image]: https://img.shields.io/badge/license-MIT-brightgreen.svg
