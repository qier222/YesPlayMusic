escallmatch
================================

ECMAScript CallExpression matcher made from function/method signature

[![Build Status][travis-image]][travis-url]
[![NPM version][npm-image]][npm-url]
[![Dependency Status][depstat-image]][depstat-url]
[![License][license-image]][license-url]


EXAMPLE
---------------------------------------

Creating CallExpression matcher for method signature `'assert.equal(actual, expected, [message])'`.

Then match against `path/to/some_test.js`.

```javascript
var escallmatch = require('escallmatch');
var esprima = require('esprima');
var estraverse = require('estraverse');
var fs = require('fs');

var matcher = escallmatch('assert.equal(actual, expected, [message])');

estraverse.traverse(esprima.parse(fs.readFileSync('path/to/some_test.js')), {
    enter: function (currentNode, parentNode) {
        if (matcher.test(currentNode)) {
            // currentNode is a CallExpression that matches to the signature
        }
        var argMatched = matcher.matchArgument(currentNode, parentNode);
        if (argMatched) {
            if (argMatched.kind === 'mandatory') {
                // mandatory arg (in this case, `actual` or `expected`)
            } else if (argMatched.kind === 'optional') {
                // optional arg (in this case, `message`)
            }
        }
    }
});
```

where content of `path/to/some_test.js` is:

```javascript
var assert = require('assert');
var anotherAssert = assert;
var equal = assert.equal.bind(assert);
var foo = '2';
var bar = 2;

assert.equal(foo, bar);  // matches
assert.equal(bar, foo);  // matches
assert.equal(foo, bar, 'foo shoule be equal to bar');  // matches (with optional arg)

assert.equal();  // does not match (less args)
assert.equal(foo);  // does not match (less args)
assert.equal(foo, bar, 'hoge', 'fuga');  // does not match (too much args)

assert.notEqual(foo, bar);  // does not match (callee method name differs)
anotherAssert.equal(foo, bar);  // does not match (callee object name differs)
equal(foo, bar);  // does not match (callee does not match)
```

`escallmatch` is a spin-off product of [power-assert](http://github.com/twada/power-assert) project.

Pull-requests, issue reports and patches are always welcomed.


API
---------------------------------------

### var matcher = escallmatch(signatureStr, [options])

Create matcher object for a given function/method signature string.

```javascript
var matcher = escallmatch('assert.equal(actual, expected, [message])');
```

Any arguments enclosed in bracket (for example, `[message]`) means optional parameters. Without bracket means mandatory parameters.

Returns `matcher` object having four methods, `test`, `matchArgument`, `calleeAst`, and `argumentSignatures`.


#### options

an `object` for configuration options. If not passed, default options will be used.


#### options.visitorKeys

| type     | default value |
|:---------|:--------------|
| `object` | (return value of `estraverse.VisitorKeys`)   |

VisitorKeys for AST traversal. See [estraverse.VisitorKeys](https://github.com/estools/estraverse/blob/4.0.0/estraverse.js#L217-L288) and [babel.types.VISITOR_KEYS](https://github.com/babel/babel/blob/v5.1.11/src/babel/types/visitor-keys.json).


#### options.astWhiteList

| type     | default value |
|:---------|:--------------|
| `object` | N/A           |

Type and property whitelist on creating AST clone. `astWhiteList` is an object containing NodeType as keys and properties as values.

```js
{
    ArrayExpression: ['type', 'elements'],
    ArrayPattern: ['type', 'elements'],
    ArrowFunctionExpression: ['type', 'id', 'params', 'body', 'generator', 'expression'],
    AssignmentExpression: ['type', 'operator', 'left', 'right'],
    ...
```


### var isMatched = matcher.test(node)

Tests whether `node` matches the signature or not.

 - Returns `true` if matched.
 - Returns `false` if not matched.

`node` should be an AST node object defined in [Mozilla JavaScript AST spec](https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API).


### var argMatched = matcher.matchArgument(node, parentNode)

Returns match result object representing whether `node` (and its `parentNode`) matches some argument of the signature or not.

 - Returns `null` if not matched.
 - If matched, returns object like `{name: 'actual', kind: 'mandatory'}`, whose `name` is an argument name in the signature and `kind` is `'mandatory'` or `'optional'`.

`node` and `parentNode` should be AST node objects defined in [Mozilla JavaScript AST spec](https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API).


### var calleeAst = matcher.calleeAst()

Returns clone of callee AST object based on signature passed to `escallmatch` function. Returned tree is one of AST node objects defined in [Mozilla JavaScript AST spec](https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API) (in most cases, `Identifier` or `MemberExpression`).


### var argSigs = matcher.argumentSignatures()

Returns array of argument signature objects based on signature passed to `escallmatch` function. Returns array of objects like `[{name: 'actual', kind: 'mandatory'}]`, whose `name` is an argument name in the signature and `kind` is `'mandatory'` or `'optional'`.



INSTALL
---------------------------------------

### via npm

Install

    $ npm install --save escallmatch


### via bower

Install

    $ bower install --save escallmatch

Then load (`escallmatch` function is exported)

    <script type="text/javascript" src="./path/to/bower_components/escallmatch/build/escallmatch.js"></script>



CHANGELOG
---------------------------------------
See [CHANGELOG](https://github.com/twada/escallmatch/blob/master/CHANGELOG.md)


AUTHOR
---------------------------------------
* [Takuto Wada](http://github.com/twada)



LICENSE
---------------------------------------
Licensed under the [MIT](https://github.com/twada/escallmatch/blob/master/LICENSE) license.


[npm-url]: https://npmjs.org/package/escallmatch
[npm-image]: https://badge.fury.io/js/escallmatch.svg

[travis-url]: http://travis-ci.org/twada/escallmatch
[travis-image]: https://secure.travis-ci.org/twada/escallmatch.svg?branch=master

[depstat-url]: https://gemnasium.com/twada/escallmatch
[depstat-image]: https://gemnasium.com/twada/escallmatch.svg

[license-url]: https://github.com/twada/escallmatch/blob/master/LICENSE
[license-image]: http://img.shields.io/badge/license-MIT-brightgreen.svg
