[![power-assert][power-assert-banner]][power-assert-url]

[![Build Status][travis-image]][travis-url]
[![NPM version][npm-image]][npm-url]
[![License][license-image]][license-url]


Create function to format `powerAssertContext` object provided by power-assert at runtime.


USAGE
---------------------------------------

```javascript
var createFormatter = require('power-assert-context-formatter');
var FileRenderer = require('power-assert-renderer-file');
var AssertionRenderer = require('power-assert-renderer-assertion');
var DiagramRenderer = require('power-assert-renderer-diagram');
var ComparisonRenderer = require('power-assert-renderer-comparison');

var format = createFormatter({
    renderers: [
        FileRenderer,
        AssertionRenderer,
        DiagramRenderer,
        ComparisonRenderer
    ]
});

var assert = require('assert');

var foo = 'foo';
var bar = 'bar';
try {
    assert(foo === bar);
} catch (e) {
    var formattedText = format(e.powerAssertContext);
    . . .
}
```


API
---------------------------------------

### var createFormatter = require('power-assert-context-formatter');

| return type |
|:------------|
| `function`  |

Returns creator function of formatter.


### var format = createFormatter(options);

| return type |
|:------------|
| `function`  |

Create format function to format `powerAssertContext` object provided by power-assert.


#### options.renderers

| type                                         | default value |
|:---------------------------------------------|:--------------|
| `Array` of `function` or `Array` of `object` | null          |

Array of constructor function of various Renderers.
Each Renderer is instantiated for each assertion and registered to `ContextTraversal`.

##### customization

Each renderer accepts its options via form of object literal.

```javascript
var format = createFormatter({
    renderers: [
        { ctor: FileRenderer },
        { ctor: AssertionRenderer },
        { ctor: DiagramRenderer, options: { maxDepth: 2 } },
        { ctor: ComparisonRenderer, options: { lineDiffThreshold: 3 } }
    ]
});
```


#### options.reducers

| type                  | default value |
|:----------------------|:--------------|
| `Array` of `function` | empty array   |

Array of reducer function to be applied to `powerAssertContext`.


#### options.outputOffset

| type     | default value |
|:---------|:--------------|
| `number` | `2`           |

Number of spaces inserted at the left in power-assert output.


#### options.lineSeparator

| type     | default value |
|:---------|:--------------|
| `string` | `"\n"`        |

Line separator in power assert output.


#### options.legacy

| type      | default value |
|:----------|:--------------|
| `boolean` | `false`       |

When `true`, new renderers and legacy renderer implementations can be used together.


### var formattedText = format(powerAssertContext);

| return type |
|:------------|
| `string`  |

Format `powerAssertContext` into `formattedText`. `powerAssertContext` is an internal object structure, containing informations to render. Example of `powerAssertContext` is:

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


INSTALL
---------------------------------------

```sh
$ npm install --save-dev power-assert-context-formatter
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

[npm-url]: https://npmjs.org/package/power-assert-context-formatter
[npm-image]: https://badge.fury.io/js/power-assert-context-formatter.svg

[license-url]: https://github.com/twada/power-assert-runtime/blob/master/LICENSE
[license-image]: https://img.shields.io/badge/license-MIT-brightgreen.svg
