espower
================================

[![Build Status][travis-image]][travis-url]
[![NPM package][npm-image]][npm-url]
[![Dependency Status][depstat-image]][depstat-url]
[![Coverage Status][coverage-image]][coverage-url]
[![Code Climate][codeclimate-image]][codeclimate-url]
[![License][license-image]][license-url]


Power Assert feature instrumentor based on the [ECMAScript AST](https://github.com/estree/estree).


DESCRIPTION
---------------------------------------
`espower` is a core module of [power-assert](https://github.com/power-assert-js/power-assert) family. 


`espower` detects and manipulates assertion expression (JavaScript Code) in the form of ECMAScript AST defined in [The ESTree Spec](https://github.com/estree/estree) (formerly known as [Mozilla SpiderMonkey Parser API](https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API)), to instrument power-assert feature into returned new AST object. AST in, AST out. Since 0.11.0, `espower` can transform ES6 AST as well.


Pull-requests, issue reports and patches are always welcomed. See [power-assert](https://github.com/power-assert-js/power-assert) project for more documentation.


CHANGELOG
---------------------------------------
See [CHANGELOG](https://github.com/power-assert-js/espower/blob/master/CHANGELOG.md)


API
---------------------------------------

### var modifiedAst = espower(ast, [options])

| return type |
|:------------|
| `object`    |

`espower` function manipulates `ast` then returns `modifiedAst` that is also an AST node object defined in [The ESTree Spec](https://github.com/estree/estree). `ast` will be manipulated directly and returned `modifiedAst` will be the same instance of `ast`.

`espower` function throws `EspowerError` when

* `ast` is already instrumented
* `ast` does not contain location information
* `options` argument is not valid


### var visitor = espower.createVisitor(ast, [options])

| return type |
|:------------|
| `object`    |

`espower.createVisitor` generates visitor object to be used with `estraverse.replace`. Arguments are the same as `espower` function.


#### ast

| type     | default value |
|:---------|:--------------|
| `object` | N/A           |

`ast` should be an AST node object defined in [The ESTree Spec](https://github.com/estree/estree).


#### options

| type     | default value |
|:---------|:--------------|
| `object` | (return value of `espower.defaultOptions()`) |

Configuration options. If not passed, default options will be used.


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

If callee name (for example, `assert.equal`) matches exactly and number of arguments is satisfied, then the assertion will be modified.
Detection is done by [escallmatch](https://github.com/twada/escallmatch). Any arguments enclosed in bracket (for example, `[message]`) means optional parameters. Without bracket means mandatory parameters.


#### options.ecmaVersion

| type     | default value |
|:---------|:--------------|
| `number` | `2018`        |

The ECMAScript version to parse and analyze. Must be either 3, 5, 6 (2015), 2016, 2017, or 2018.


#### options.sourceType

| type     | default value |
|:---------|:--------------|
| `string` | `'module'`    |

The source type of the code. Must be either `"script"` or `"module"`.

 
#### (optional) options.path

| type     | default value |
|:---------|:--------------|
| `string` | N/A           |

Filepath of `originalAst`. If passed, espower stores filepath information for reporting. If `options.path` is absolute and it conflicts with `options.sourceRoot` or `sourceRoot` in `options.sourceMap`, then filepath in power-assert output will be fall back on `basename` of `options.path`. This property is optional.


#### (optional) options.sourceRoot

| type     | default value |
|:---------|:--------------|
| `string` | N/A           |

Root filepath for target test files. Only works with `options.path` or `options.sourceMap`. If set, filepath in power-assert output will be relative from `options.sourceRoot`. When both `options.sourceRoot` and sourceMap's sourceRoot are given and both are absolute filepath, `options.sourceRoot` has precedence over sourceMap's sourceRoot. This property is optional.


#### (optional) options.sourceMap

| type                | default value |
|:--------------------|:--------------|
| `object` or `string`| N/A           |

A raw (either as a string which can be JSON.parse'd, or an object) [SourceMap](https://github.com/mozilla/source-map/) associated with `originalAst`. This property is optional. If given, espower uses `options.sourceMap` to adjust information in the power-assert output.


#### (optional) options.visitorKeys

| type     | default value |
|:---------|:--------------|
| `object` | N/A           |

VisitorKeys for AST traversal. See [estraverse.VisitorKeys](https://github.com/estools/estraverse/blob/4.0.0/estraverse.js#L217-L288) and [babel.types.VISITOR_KEYS](https://github.com/babel/babel/blob/v5.1.13/src/babel/types/visitor-keys.json).


### var options = espower.defaultOptions();

Returns default options object for `espower` function. In other words, returns

```javascript
{
    ecmaVersion: 2018,
    sourceType: 'module',
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


EXAMPLE
---------------------------------------

For given test file `example_test.js` below,

```javascript
var assert = require('power-assert');
var truthy = 'true';
var falsy = 'false';
assert(falsy);
assert.equal(truthy, falsy);
```

Apply `espower` then generate modified code to console,

```javascript
var espower = require('espower');
var esprima = require('esprima');
var escodegen = require('escodegen');
var fs = require('fs');
var path = require('path');

var filepath = path.join(__dirname, 'example_test.js');
var jsAst = esprima.parse(fs.readFileSync(filepath), {tolerant: true, loc: true, tokens: true});
var modifiedAst = espower(jsAst, {path: filepath, sourceRoot: __dirname});

console.log(escodegen.generate(modifiedAst));
```

Output:

```javascript
var _PowerAssertRecorder1 = function () {
    function PowerAssertRecorder() {
        this.captured = [];
    }
    PowerAssertRecorder.prototype._capt = function _capt(value, espath) {
        this.captured.push({
            value: value,
            espath: espath
        });
        return value;
    };
    PowerAssertRecorder.prototype._expr = function _expr(value, source) {
        var capturedValues = this.captured;
        this.captured = [];
        return {
            powerAssertContext: {
                value: value,
                events: capturedValues
            },
            source: source
        };
    };
    return PowerAssertRecorder;
}();
var _rec1 = new _PowerAssertRecorder1();
var _rec2 = new _PowerAssertRecorder1();
var _rec3 = new _PowerAssertRecorder1();
var assert = require('power-assert');
var truthy = 'true';
var falsy = 'false';
assert(_rec1._expr(_rec1._capt(falsy, 'arguments/0'), {
    content: 'assert(falsy)',
    filepath: 'example_test.js',
    line: 4
}));
assert.equal(_rec2._expr(_rec2._capt(truthy, 'arguments/0'), {
    content: 'assert.equal(truthy, falsy)',
    filepath: 'example_test.js',
    line: 5
}), _rec3._expr(_rec3._capt(falsy, 'arguments/1'), {
    content: 'assert.equal(truthy, falsy)',
    filepath: 'example_test.js',
    line: 5
}));
```


INSTALL
---------------------------------------

### via npm

Install

    $ npm install --save-dev espower


OUR SUPPORT POLICY
---------------------------------------

We support Node under maintenance. In other words, we stop supporting old Node version when [their maintenance ends](https://github.com/nodejs/LTS).

This means that any other environment is not supported.

NOTE: If espower works in any of the unsupported environments, it is purely coincidental and has no bearing on future compatibility. Use at your own risk.


AUTHOR
---------------------------------------
* [Takuto Wada](https://github.com/twada)


CONTRIBUTORS
---------------------------------------
* [James Talmage (jamestalmage)](https://github.com/jamestalmage)


LICENSE
---------------------------------------
Licensed under the [MIT](https://github.com/power-assert-js/espower/blob/master/MIT-LICENSE.txt) license.


[npm-url]: https://npmjs.org/package/espower
[npm-image]: https://badge.fury.io/js/espower.svg

[travis-url]: https://travis-ci.org/power-assert-js/espower
[travis-image]: https://secure.travis-ci.org/power-assert-js/espower.svg?branch=master

[depstat-url]: https://gemnasium.com/power-assert-js/espower
[depstat-image]: https://gemnasium.com/power-assert-js/espower.svg

[license-url]: https://github.com/power-assert-js/espower/blob/master/MIT-LICENSE.txt
[license-image]: https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat

[codeclimate-url]: https://codeclimate.com/github/power-assert-js/espower
[codeclimate-image]: https://codeclimate.com/github/power-assert-js/espower/badges/gpa.svg

[coverage-url]: https://coveralls.io/r/power-assert-js/espower?branch=master
[coverage-image]: https://coveralls.io/repos/power-assert-js/espower/badge.svg?branch=master
