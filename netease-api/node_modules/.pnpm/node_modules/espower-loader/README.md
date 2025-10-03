espower-loader
================================

[![Build Status][travis-image]][travis-url]
[![NPM package][npm-image]][npm-url]
[![Dependency Status][depstat-image]][depstat-url]

Power Assert feature instrumentor on the fly.


DESCRIPTION
---------------------------------------
`espower-loader` is a Node.js module loader that enhances target sources on the fly. So you can instrument Power Assert feature without code generation for now.

`espower-loader` applies [espower](https://github.com/power-assert-js/espower) to target sources on loading them. `espower` manipulates assertion expression (JavaScript Code) in the form of ECMAScript AST defined in [The ESTree Spec](https://github.com/estree/estree) (formerly known as [Mozilla SpiderMonkey Parser API](https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API)), to instrument power-assert feature into the code. `espower-loader` also adjusts line and column number in stack traces by using [source-map-support](https://github.com/evanw/node-source-map-support) module.

Pull-requests, issue reports and patches are always welcomed. See [power-assert](https://github.com/power-assert-js/power-assert) project for more documentation.


FYI: You may be interested in [intelli-espower-loader](https://github.com/power-assert-js/intelli-espower-loader) to go one step further. With [intelli-espower-loader](https://github.com/power-assert-js/intelli-espower-loader), you don't need to create loader file (like `enable-power-assert.js`). Just define test directory in `package.json` wow!


EXAMPLE
---------------------------------------

You can instrument `power-assert` without code generation (e.g. without using `grunt-espower`,`gulp-espower`, and so on).

For mocha, Just add `--require` option.

    $ mocha --require ./path/to/enable-power-assert test/some_test_using_powerassert.js

where `enable-power-assert.js` somewhere in your project is,

```javascript
require('espower-loader')({
    pattern: '{src,test}/**/*.js'
});
```

You can specify options for `espower` module explicitly.

```javascript
require('espower-loader')({

    // directory where match starts with
    cwd: process.cwd(),

    // glob pattern using minimatch module
    pattern: '{src,test}/**/*.js',

    // options for espower module
    espowerOptions: {
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
});
```


OUR SUPPORT POLICY
---------------------------------------

We support Node under maintenance. In other words, we stop supporting old Node version when [their maintenance ends](https://github.com/nodejs/LTS).

This means that any other environment is not supported.

NOTE: If espower-source works in any of the unsupported environments, it is purely coincidental and has no bearing on future compatibility. Use at your own risk.


CHANGELOG
---------------------------------------
See [CHANGELOG](https://github.com/power-assert-js/espower-loader/blob/master/CHANGELOG.md)


AUTHOR
---------------------------------------
* [Takuto Wada](https://github.com/twada)


CONTRIBUTORS
---------------------------------------
* [Eward Song (shepherdwind)](https://github.com/shepherdwind)
* [Haoliang Gao (popomore)](https://github.com/popomore)


LICENSE
---------------------------------------
Licensed under the [MIT](https://github.com/power-assert-js/espower-loader/blob/master/MIT-LICENSE.txt) license.


[npm-url]: https://npmjs.org/package/espower-loader
[npm-image]: https://badge.fury.io/js/espower-loader.svg

[travis-url]: https://travis-ci.org/power-assert-js/espower-loader
[travis-image]: https://secure.travis-ci.org/power-assert-js/espower-loader.svg?branch=master

[depstat-url]: https://gemnasium.com/power-assert-js/espower-loader
[depstat-image]: https://gemnasium.com/power-assert-js/espower-loader.svg
