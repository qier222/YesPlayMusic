empower
================================

[![Build Status][travis-image]][travis-url]
[![NPM package][npm-image]][npm-url]
[![Bower package][bower-image]][bower-url]
[![Dependency Status][depstat-image]][depstat-url]
[![Coverage Status][coverage-image]][coverage-url]
[![Code Climate][codeclimate-image]][codeclimate-url]
[![License][license-image]][license-url]
[![Built with Gulp][gulp-image]][gulp-url]


Power Assert feature enhancer for assert function/object.


DESCRIPTION
---------------------------------------
`empower` is a core module of [power-assert](https://github.com/power-assert-js/power-assert) family. `empower` enhances standard `assert` function or any assert-like object to work with power-assert feature added code instrumented by [espower](https://github.com/power-assert-js/espower).


`empower` works with standard `assert` function (best fit with [Mocha](http://mochajs.org/)), and also supports assert-like objects/functions provided by various testing frameworks such as [QUnit](https://qunitjs.com/), [buster.js](http://docs.busterjs.org/en/latest/), and [nodeunit](https://github.com/caolan/nodeunit).


Pull-requests, issue reports and patches are always welcomed. See [power-assert](https://github.com/power-assert-js/power-assert) project for more documentation.


CHANGELOG
---------------------------------------
See [CHANGELOG](https://github.com/power-assert-js/empower/blob/master/CHANGELOG.md)


API
---------------------------------------

### var enhancedAssert = empower(originalAssert, formatter, [options])

| return type            |
|:-----------------------|
| `function` or `object` |

`empower` function takes function or object(`originalAssert`) and `formatter` function created by [power-assert-formatter](https://github.com/power-assert-js/power-assert-formatter) then returns PowerAssert feature added function/object base on `originalAssert`.
If `destructive` option is falsy, `originalAssert` will be unchanged. If `destructive` option is truthy, `originalAssert` will be manipulated directly and returned `enhancedAssert` will be the same instance of `originalAssert`.


#### originalAssert

| type                   | default value |
|:-----------------------|:--------------|
| `function` or `object` | N/A           |

`originalAssert` is an instance of standard `assert` function or any assert-like object. see [SUPPORTED ASSERTION LIBRARIES](https://github.com/power-assert-js/empower#supported-assertion-libraries) and [ASSERTION LIBRARIES KNOWN TO WORK](https://github.com/power-assert-js/empower#assertion-libraries-known-to-work) section. Be careful that `originalAssert` will be manipulated directly if `destructive` option is truthy.


#### formatter

| type       | default value |
|:-----------|:--------------|
| `function` | N/A           |

formatter function created by [power-assert-formatter](https://github.com/power-assert-js/power-assert-formatter).


#### options

| type     | default value |
|:---------|:--------------|
| `object` | (return value of `empower.defaultOptions()`) |

Configuration options. If not passed, default options will be used.


#### options.destructive

| type      | default value |
|:----------|:--------------|
| `boolean` | `false`       |

If truthy, modify `originalAssert` destructively.

If `false`, empower mimics originalAssert as new object/function, so `originalAssert` will not be changed. If `true`, `originalAssert` will be manipulated directly and returned `enhancedAssert` will be the same instance of `originalAssert`.


#### options.modifyMessageOnRethrow

| type      | default value |
|:----------|:--------------|
| `boolean` | `false`       |

If truthy, modify `message` property of AssertionError on rethrow.


#### options.saveContextOnRethrow

| type      | default value |
|:----------|:--------------|
| `boolean` | `false`       |

If truthy, add `powerAssertContext` property to AssertionError on rethrow.


`modifyMessageOnRethrow` option and `saveContextOnRethrow` option makes behavior matrix as below.

| modifyMessageOnRethrow | saveContextOnRethrow | resulting behavior                                |
|:-----------------------|:---------------------|:--------------------------------------------------|
| `false` (default)      | `false` (default)    | Always modify assertion message argument directly |
| `true`                 | `false`              | Modify `message` of AssertionError on fail        |
| `false`                | `true`               | Do not modify `message` of AssertionError but add `powerAssertContext` property on fail |
| `true`                 | `true`               | On fail, modify `message` of AssertionError and also add `powerAssertContext` property |


#### options.patterns

| type                | default value       |
|:--------------------|:--------------------|
| `Array` of `string` | objects shown below |

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

Pattern detection is done by [escallmatch](https://github.com/twada/escallmatch). Any arguments enclosed in bracket (for example, `[message]`) means optional parameters. Without bracket means mandatory parameters.


### var options = empower.defaultOptions();

Returns default options object for `empower` function. In other words, returns

```javascript
{
    destructive: false,
    modifyMessageOnRethrow: false,
    saveContextOnRethrow: false,
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


SUPPORTED ASSERTION LIBRARIES
---------------------------------------
* [Node assert API](https://nodejs.org/api/assert.html)
* [Jxck/assert](https://github.com/Jxck/assert)


ASSERTION LIBRARIES KNOWN TO WORK
---------------------------------------
* [QUnit.assert](https://qunitjs.com/)
* [nodeunit](https://github.com/caolan/nodeunit)
* [buster-assertions](http://docs.busterjs.org/en/latest/modules/buster-assertions/)


INSTALL
---------------------------------------

### via npm

Install

    $ npm install --save-dev empower


#### use empower npm module on browser

`empower` function is exported

    <script type="text/javascript" src="./path/to/node_modules/empower/build/empower.js"></script>


### via bower

Install

    $ bower install --save-dev empower

Then load (`empower` function is exported)

    <script type="text/javascript" src="./path/to/bower_components/empower/build/empower.js"></script>


OUR SUPPORT POLICY
---------------------------------------

We support Node under maintenance. In other words, we stop supporting old Node version when [their maintenance ends](https://github.com/nodejs/LTS).

We also support "modern enough" browsers such as Chrome, Firefox, Safari, Edge etc.

Any other environments are not supported officially (means that we do not test against them on CI service). empower is known to work with old browsers, and trying to keep them working though.


AUTHOR
---------------------------------------
* [Takuto Wada](https://github.com/twada)


CONTRIBUTORS
---------------------------------------
* [James Talmage (jamestalmage)](https://github.com/jamestalmage)


LICENSE
---------------------------------------
Licensed under the [MIT](https://github.com/power-assert-js/empower/blob/master/MIT-LICENSE.txt) license.


[npm-url]: https://npmjs.org/package/empower
[npm-image]: https://badge.fury.io/js/empower.svg

[bower-url]: https://badge.fury.io/bo/empower
[bower-image]: https://badge.fury.io/bo/empower.svg

[travis-url]: https://travis-ci.org/power-assert-js/empower
[travis-image]: https://secure.travis-ci.org/power-assert-js/empower.svg?branch=master

[depstat-url]: https://gemnasium.com/power-assert-js/empower
[depstat-image]: https://gemnasium.com/power-assert-js/empower.svg

[license-url]: https://github.com/power-assert-js/empower/blob/master/MIT-LICENSE.txt
[license-image]: https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat

[codeclimate-url]: https://codeclimate.com/github/power-assert-js/empower
[codeclimate-image]: https://codeclimate.com/github/power-assert-js/empower/badges/gpa.svg

[coverage-url]: https://coveralls.io/r/power-assert-js/empower?branch=master
[coverage-image]: https://coveralls.io/repos/power-assert-js/empower/badge.svg?branch=master

[gulp-url]: http://gulpjs.com/
[gulp-image]: https://img.shields.io/badge/built_with-gulp-brightgreen.svg
