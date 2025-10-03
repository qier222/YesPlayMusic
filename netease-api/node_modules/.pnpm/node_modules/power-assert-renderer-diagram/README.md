[![power-assert][power-assert-banner]][power-assert-url]

[![Build Status][travis-image]][travis-url]
[![NPM version][npm-image]][npm-url]
[![License][license-image]][license-url]


Produces graph of each value in expression.

```
  assert(a.name === 'bar')
         | |    |         
         | |    false     
         | "foo"          
         Object{name:"foo"}
```


USAGE
---------------------------------------

`var DiagramRenderer = require('power-assert-renderer-diagram');`


#### options.stringify

| type       | default value |
|:-----------|:--------------|
| `function` | [stringifier module](https://github.com/twada/stringifier) |

Function to stringify any target value.


#### options.maxDepth

| type     | default value |
|:---------|:--------------|
| `number` | `2`           |

Depth of object traversal. If object depth is greater than `maxDepth`, compound object (IOW, `Array` or `object`) will be pruned with `#` like `["foo",#Array#,#Object#]`.


#### options.lineSeparator

| type     | default value |
|:---------|:--------------|
| `string` | `"\n"`        |

Line separator in power assert output.


#### options.anonymous

| type     | default value |
|:---------|:--------------|
| `string` | `"Object"`    |

Type name to show when target object is created by anonymous constructor.


#### options.circular

| type     | default value   |
|:---------|:----------------|
| `string` | `"#@Circular#"` |

Name to show when target object is detected as circular structure.


#### options.widthOf

| type       | default value |
|:-----------|:--------------|
| `function` | [power-assert-util-string-width](https://github.com/twada/power-assert-runtime/blob/master/packages/power-assert-util-string-width) |

Function to calculate width of string.


#### options.ambiguousEastAsianCharWidth

| type     | default value |
|:---------|:--------------|
| `number` | `2`           |

Width of 'Ambiguous' characters defined in [Unicode Standard Annex \#11 EAST ASIAN WIDTH](http://www.unicode.org/reports/tr11/#Ambiguous). Configure `options.ambiguousEastAsianCharWidth` to treat ambiguous east asian character as fullwidth (= `2`) or narrow (= `1`). Default is `2`.


INSTALL
---------------------------------------

```sh
$ npm install --save-dev power-assert-renderer-diagram
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

[npm-url]: https://npmjs.org/package/power-assert-renderer-diagram
[npm-image]: https://badge.fury.io/js/power-assert-renderer-diagram.svg

[license-url]: https://github.com/twada/power-assert-runtime/blob/master/LICENSE
[license-image]: https://img.shields.io/badge/license-MIT-brightgreen.svg
