[![power-assert][power-assert-banner]][power-assert-url]

[![Build Status][travis-image]][travis-url]
[![NPM version][npm-image]][npm-url]
[![License][license-image]][license-url]


`powerAssertContext` reducer function to parse assertion expression at runtime.

Use this function when transpiler side does not add `ast`, `tokens` and `visitorKeys` at compile time.


API
---------------------------------------

### var appendAst = require('power-assert-context-reducer-ast');
### var appendedContext = appendAst(powerAssertContext);

Given `powerAssertContext` object, having structure below but does not have `ast`, `tokens` and `visitorKeys`, append them to output context.


input:
```js
{
    source: {
        content: 'assert(foo === bar)',
        filepath: 'test/some_test.js',
        line: 1
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

output:

```js
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


INSTALL
---------------------------------------

```sh
$ npm install --save-dev power-assert-context-reducer-ast
```


AUTHOR
---------------------------------------
* [Takuto Wada](https://github.com/twada)


CONTRIBUTORS
---------------------------------------
* [Haoliang Gao (popomore)](https://github.com/popomore)


LICENSE
---------------------------------------
Licensed under the [MIT](https://github.com/twada/power-assert-runtime/blob/master/LICENSE) license.


[power-assert-url]: https://github.com/power-assert-js/power-assert
[power-assert-banner]: https://raw.githubusercontent.com/power-assert-js/power-assert-js-logo/master/banner/banner-official-fullcolor.png

[travis-url]: https://travis-ci.org/twada/power-assert-runtime
[travis-image]: https://secure.travis-ci.org/twada/power-assert-runtime.svg?branch=master

[npm-url]: https://npmjs.org/package/power-assert-context-reducer-ast
[npm-image]: https://badge.fury.io/js/power-assert-context-reducer-ast.svg

[license-url]: https://github.com/twada/power-assert-runtime/blob/master/LICENSE
[license-image]: https://img.shields.io/badge/license-MIT-brightgreen.svg
