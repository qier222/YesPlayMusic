espower-source
================================

[![Build Status][travis-image]][travis-url]
[![NPM package][npm-image]][npm-url]
[![Dependency Status][depstat-image]][depstat-url]
[![License][license-image]][license-url]


Power Assert instrumentor from code to code, with SourceMap.


DESCRIPTION
---------------------------------------
`espower-source` is a source code transformer that applies [espower](https://github.com/power-assert-js/espower) to target code.

`espower` manipulates assertion expression in the form of ECMAScript AST defined in [The ESTree Spec](https://github.com/estree/estree) (formerly known as [Mozilla SpiderMonkey Parser API](https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API)), to instrument power-assert feature into the code. SourceMap information is appended in SourceMap Comment syntax at the end of returned code.

Pull-requests, issue reports and patches are always welcomed. See [power-assert](https://github.com/power-assert-js/power-assert) project for more documentation.


CHANGELOG
---------------------------------------
See [CHANGELOG](https://github.com/power-assert-js/espower-source/blob/master/CHANGELOG.md)


API
---------------------------------------

### var modifiedCode = espowerSource(originalCode, [filepath], [options])

| return type |
|:------------|
| `string`    |

`espowerSource` function manipulates `originalCode` then returns (transformed) JavaScript code as string. SourceMap information is appended in SourceMap Comment syntax at the end of returned code.

#### originalCode

| type     | default value |
|:---------|:--------------|
| `string` | N/A           |

Original JavaScript source code that is a source of code transformation. If not specified, then `EspowerError` will be thrown.

#### filepath (optional but recommended)

| type     | default value |
|:---------|:--------------|
| `string` | N/A           |

Filepath of `originalCode`. espower-source stores filepath information for later reporting. If not specified, `options.path` will be used. If neither filepath nor options.path are not specified, espower-source transforms code as usual but SourceMap will not be generated and attached.

#### options (optional)

| type     | default value |
|:---------|:--------------|
| `object` | (return value of `espower.defaultOptions()` but with `destructive` option is `true`) |

Configuration options for `espower` module. If not passed, default options (Same as [espower.defaultOptions()](https://github.com/power-assert-js/espower#var-options--espowerdefaultoptions)) will be used, but `options.destructive` is set to `true`, and if `options.path` is falsy, `options.path` is set to value of `filepath` argument by espower-source module.


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


INSTALL
---------------------------------------

### via npm

Install

    $ npm install --save-dev espower-source


OUR SUPPORT POLICY
---------------------------------------

We support Node under maintenance. In other words, we stop supporting old Node version when [their maintenance ends](https://github.com/nodejs/LTS).

This means that any other environment is not supported.

NOTE: If espower-source works in any of the unsupported environments, it is purely coincidental and has no bearing on future compatibility. Use at your own risk.


AUTHOR
---------------------------------------
* [Takuto Wada](https://github.com/twada)


CONTRIBUTORS
---------------------------------------
* [azu](https://github.com/azu)
* [James Talmage (jamestalmage)](https://github.com/jamestalmage)
* [Yoshiki Shibukawa (shibukawa)](https://github.com/shibukawa)
* [Yiyu He (dead-horse)](https://github.com/dead-horse)
* [Eward Song (shepherdwind)](https://github.com/shepherdwind)


LICENSE
---------------------------------------
Licensed under the [MIT](https://github.com/power-assert-js/espower-source/blob/master/MIT-LICENSE.txt) license.


[npm-url]: https://npmjs.org/package/espower-source
[npm-image]: https://badge.fury.io/js/espower-source.svg

[travis-url]: https://travis-ci.org/power-assert-js/espower-source
[travis-image]: https://secure.travis-ci.org/power-assert-js/espower-source.svg?branch=master

[depstat-url]: https://gemnasium.com/power-assert-js/espower-source
[depstat-image]: https://gemnasium.com/power-assert-js/espower-source.svg

[license-url]: https://github.com/power-assert-js/espower-source/blob/master/MIT-LICENSE.txt
[license-image]: https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat
