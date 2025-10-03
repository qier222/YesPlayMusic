[![power-assert][power-assert-banner]][power-assert-url]

[![Build Status][travis-image]][travis-url]
[![NPM version][npm-image]][npm-url]
[![License][license-image]][license-url]


Produces comparison of expected and actual values of `BinaryExpression`.

```
  assert(a.name === 'bar')
  --- [string] 'bar'
  +++ [string] a.name
  @@ -1,3 +1,3 @@
  -bar
```


USAGE
---------------------------------------

`var ComparisonRenderer = require('power-assert-renderer-comparison');`


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


#### options.diff

| type       | default value |
|:-----------|:--------------|
| `function` | [udiff.js](https://github.com/twada/power-assert-runtime/blob/master/packages/power-assert-renderer-comparison/lib/udiff.js) |

Function to create diff string between two strings.


#### options.lineDiffThreshold

| type     | default value |
|:---------|:--------------|
| `number` | `5`           |

Threshold to show diff at character level or line level. If number of lines in target string is greater than `lineDiffThreshold`, then line diff mode will be used to show diff output.



INSTALL
---------------------------------------

```sh
$ npm install --save-dev power-assert-renderer-comparison
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

[npm-url]: https://npmjs.org/package/power-assert-renderer-comparison
[npm-image]: https://badge.fury.io/js/power-assert-renderer-comparison.svg

[license-url]: https://github.com/twada/power-assert-runtime/blob/master/LICENSE
[license-image]: https://img.shields.io/badge/license-MIT-brightgreen.svg
