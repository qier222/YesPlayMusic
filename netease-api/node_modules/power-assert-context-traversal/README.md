[![power-assert][power-assert-banner]][power-assert-url]

[![Build Status][travis-image]][travis-url]
[![NPM version][npm-image]][npm-url]
[![License][license-image]][license-url]


EventEmitter of `powerAssertContext` object provided by power-assert at runtime.


API
---------------------------------------

### var traversal = new ContextTraversal(powerAssertContext);

Create `EventEmitter` of `powerAssertContext` object, having structure below.

```javascript
{
    source: {
        content: 'assert(foo === bar)',
        filepath: 'test/some_test.js',
        line: 1,
        ast: '### JSON representation of AST nodes ###',
        tokens: '### JSON representation of AST tokens ###',
        visitorKeys: '### JSON representation of AST visitor keys ###'
    },
    args: [
        {
            value: false,
            events: [
                {
                    value: "FOO",
                    espath: "arguments/0/left"
                },
                {
                    value: "BAR",
                    espath: "arguments/0/right"
                },
                {
                    value: false,
                    espath: "arguments/0"
                }
            ]
        }
    ]
}
```

### traversal.traverse()

Fire events while traversing AST tree in `powerAssertContext`.


### events


#### traversal.on('start', function (powerAssertContext) {})

Called once when traversal starts. Argument is the `powerAssertContext` object under traversal.

#### traversal.on('data', function (esNode) {})

Called for each Node of AST in `powerAssertContext`. Argument is a `EsNode` object, having structure below.

```javascript
{
    espath: 'arguments/0',
    parent: '### parent esNode reference unless root ###',
    key: 0,
    node: {
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Identifier', name: 'foo', range: [ 7, 10 ] },
        right: { type: 'Identifier', name: 'bar', range: [ 15, 18 ] },
        range: [ 7, 18 ]
    },
    code: 'foo === bar',
    value: false,
    isCaptured: true,
    range: [ 11, 14 ]  // range of operator
};
```

```javascript
{
    espath: 'arguments/0/right',
    parent: '### parent esNode reference unless root ###',
    key: 'right',
    node: { type: 'Identifier', name: 'bar', range: [ 15, 18 ] },
    code: 'bar',
    value: 'BAR',
    isCaptured: true,
    range: [ 15, 18 ]
};
```

#### traversal.on('end', function () {})

Called once when traversal ends.



INSTALL
---------------------------------------

```sh
$ npm install --save-dev power-assert-context-traversal
```


AUTHOR
---------------------------------------
* [Takuto Wada](https://github.com/twada)


LICENSE
---------------------------------------
Licensed under the [MIT](https://github.com/twada/power-assert-runtime/blob/master/LICENSE) license.


[power-assert-url]: https://github.com/power-assert-js/power-assert
[power-assert-banner]: https://raw.githubusercontent.com/power-assert-js/power-assert-js-logo/master/banner/banner-official-fullcolor.png

[travis-url]: https://travis-ci.org/twada/power-assert-runtime
[travis-image]: https://secure.travis-ci.org/twada/power-assert-runtime.svg?branch=master

[npm-url]: https://npmjs.org/package/power-assert-context-traversal
[npm-image]: https://badge.fury.io/js/power-assert-context-traversal.svg

[license-url]: https://github.com/twada/power-assert-runtime/blob/master/LICENSE
[license-image]: https://img.shields.io/badge/license-MIT-brightgreen.svg
