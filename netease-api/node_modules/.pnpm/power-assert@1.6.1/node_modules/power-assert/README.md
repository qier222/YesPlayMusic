[![power-assert][power-assert-banner]][power-assert-url]

Power Assert in JavaScript. Provides descriptive assertion messages through standard [assert](https://nodejs.org/api/assert.html) interface. No API is the best API.

[![Build Status][travis-image]][travis-url]
[![NPM package][npm-image]][npm-url]
[![Bower package][bower-image]][bower-url]
[![Dependency Status][depstat-image]][depstat-url]
[![License][license-image]][license-url]


DESCRIPTION
---------------------------------------

What is `power-assert`?

 * is an implementation of "Power Assert" concept in JavaScript.
 * provides descriptive assertion messages through standard [assert](https://nodejs.org/api/assert.html) interface.
 * __No API is the best API__. With power-assert, __you don't need to learn many assertion library APIs__ (in most cases, all you need to remember is just an `assert(any_expression)` function)
 * __Stop memorizing tons of assertion APIs. Just create expressions that return a truthy value or not__ and power-assert will show it to you right on the screen as part of your failure message without you having to type in a message at all.
 * the core value of power-assert is absolute simplicity and stability. Especially, power-assert sticks to the simplest form of testing, `assert(any_expression)`.
 * see slides: ["power-assert, mechanism and philosophy"](https://www.slideshare.net/t_wada/power-assert-nodefest-2014) -- talk at NodeFest 2014.
 * __[NEW] Now you don't need `require('power-assert')` any more. Keep using `require('assert')`, and power-assert enhances them transparently.__ See slides: [From Library to Tool - power-assert as a General Purpose Assertion Enhancement Tool](https://speakerdeck.com/twada/from-library-to-tool-power-assert-as-a-general-purpose-assertion-enhancement-tool)
 * to gain power-assert output, __you need to transform your test code__ to produce power-assert output.
 * `power-assert - power = assert`. Without code transpilation, power-assert works just as normal `assert` does.
 * fully compatible with [assert](https://nodejs.org/api/assert.html). So you can stop using power-assert and back to assert easily.
 * has [online demo site](https://azu.github.io/power-assert-demo/).
 * works both on server side and browser side.
 * available via [npm](https://www.npmjs.com/package/power-assert) and [bower](https://bower.io/search/?q=power-assert). 
 * supports sourcemaps so you can debug as usual.
 * provides [babel plugin](https://github.com/power-assert-js/babel-plugin-espower) and [babel preset](https://github.com/power-assert-js/babel-preset-power-assert).
 * provides [browserify transform](https://github.com/power-assert-js/espowerify).
 * provides [webpack loader](https://github.com/power-assert-js/webpack-espower-loader).
 * provides [grunt task](https://github.com/power-assert-js/grunt-espower) and [gulp plugin](https://github.com/power-assert-js/gulp-espower).
 * provides [command](https://github.com/power-assert-js/espower-cli).
 * provides [custom module loader](https://github.com/power-assert-js/espower-loader) and its [convenient config module](https://github.com/power-assert-js/intelli-espower-loader).
 * provides [Karma Adapter](https://github.com/power-assert-js/karma-power-assert) and [Karma Preprocessor](https://github.com/power-assert-js/karma-espower-preprocessor).
 * supports ES6+ through [babel plugin](https://github.com/power-assert-js/babel-plugin-espower).
 * supports [CoffeeScript](https://github.com/power-assert-js/espower-coffee).
 * supports [TypeScript](https://github.com/power-assert-js/espower-typescript).
 * has [TypeScript type definition](https://www.npmjs.com/package/@types/power-assert)
 * has code migration tool that transforms existing code from [chai](https://github.com/twada/chai-to-assert), [should.js](https://github.com/node-modules/should2assert) and [expect.js](https://github.com/twada/expect-js-to-assert) to assert.
 * [AVA](https://github.com/avajs/ava), the futuristic test runner, now [comes with power-assert builtin](https://github.com/avajs/ava#enhanced-assertion-messages)
 * has [Lab transformer](https://github.com/feugy/lab-espower-transformer) to enable power-assert on [Lab](https://github.com/hapijs/lab)
 * has [module loader](https://github.com/tracecomms/espower-ts-node) to get [ts-node](https://github.com/TypeStrong/ts-node) working together with power-assert
 * [Wallaby.js](https://wallabyjs.com/) supports power-assert via [Babel compiler/preprocessor](https://github.com/wallabyjs/public/issues/754#issuecomment-241624868)
 * pull-requests, issue reports and patches are always welcomed.


`power-assert` provides descriptive assertion messages for your tests, like this.

      1) Array #indexOf() should return index when the value is present:
         AssertionError: # path/to/test/mocha_node.js:10
    
      assert(ary.indexOf(zero) === two)
             |   |       |     |   |
             |   |       |     |   2
             |   -1      0     false
             [1,2,3]
    
      [number] two
      => 2
      [number] ary.indexOf(zero)
      => -1


API
---------------------------------------

power-assert enhances these assert functions by [espower](https://github.com/power-assert-js/espower). Produces descriptive message when assertion is failed.

* [`assert(value, [message])`](https://nodejs.org/api/assert.html#assert_assert_value_message)
* [`assert.ok(value, [message])`](https://nodejs.org/api/assert.html#assert_assert_ok_value_message)
* [`assert.equal(actual, expected, [message])`](https://nodejs.org/api/assert.html#assert_assert_equal_actual_expected_message)
* [`assert.notEqual(actual, expected, [message])`](https://nodejs.org/api/assert.html#assert_assert_notequal_actual_expected_message)
* [`assert.strictEqual(actual, expected, [message])`](https://nodejs.org/api/assert.html#assert_assert_strictequal_actual_expected_message)
* [`assert.notStrictEqual(actual, expected, [message])`](https://nodejs.org/api/assert.html#assert_assert_notstrictequal_actual_expected_message)
* [`assert.deepEqual(actual, expected, [message])`](https://nodejs.org/api/assert.html#assert_assert_deepequal_actual_expected_message)
* [`assert.notDeepEqual(actual, expected, [message])`](https://nodejs.org/api/assert.html#assert_assert_notdeepequal_actual_expected_message)
* [`assert.deepStrictEqual(actual, expected, [message])`](https://nodejs.org/api/assert.html#assert_assert_deepstrictequal_actual_expected_message)
* [`assert.notDeepStrictEqual(actual, expected, [message])`](https://nodejs.org/api/assert.html#assert_assert_notdeepstrictequal_actual_expected_message)

power-assert is fully compatible with [assert](https://nodejs.org/api/assert.html). So functions below are also available though they are not enhanced (does not produce descriptive message).

* [`assert.fail(actual, expected, message, operator)`](https://nodejs.org/api/assert.html#assert_assert_fail_actual_expected_message_operator_stackstartfunction)
* [`assert.throws(block, [error], [message])`](https://nodejs.org/api/assert.html#assert_assert_throws_block_error_message)
* [`assert.doesNotThrow(block, [message])`](https://nodejs.org/api/assert.html#assert_assert_doesnotthrow_block_error_message)
* [`assert.ifError(value)`](https://nodejs.org/api/assert.html#assert_assert_iferror_value)

Since version 1.5.0, power-assert supports ["strict mode"](https://nodejs.org/api/assert.html#assert_strict_mode) as well.

power-assert provides an [API for customization](https://github.com/power-assert-js/power-assert#customization-api).

* `assert.customize(options)`


### No API is the best API

Though power-assert is fully compatible with standard [assert](https://nodejs.org/api/assert.html) interface, all you need to remember is just an `assert(any_expression)` function in most cases.

The core value of power-assert is absolute simplicity and stability. Especially, power-assert sticks to the simplest form of testing, `assert(any_expression)`.


        assert(types[index].name === bob.name)
               |    ||      |    |   |   |
               |    ||      |    |   |   "bob"
               |    ||      |    |   Person{name:"bob",age:5}
               |    ||      |    false
               |    |11     "alice"
               |    Person{name:"alice",age:3}
               ["string",98.6,true,false,null,undefined,#Array#,#Object#,NaN,Infinity,/^not/,#Person#]
      
        --- [string] bob.name
        +++ [string] types[index].name
        @@ -1,3 +1,5 @@
        -bob
        +alice


FAQ
---------------------------------------

- [Support other assertion styles?](https://github.com/power-assert-js/power-assert/issues/22)
- [Does this work with substack/tape?](https://github.com/power-assert-js/power-assert/issues/30)
- [Are all dependencies required at runtime?](https://github.com/power-assert-js/power-assert/issues/24)
- [Descriptive assertion message does not appear when writing tests in ES6 with Babel](https://github.com/power-assert-js/webpack-espower-loader/issues/4#issuecomment-139605343)
- [Incomplete increment/decrement assertion messages?](https://github.com/power-assert-js/power-assert/issues/32)
- [Cannot capture not invokable method error](https://github.com/power-assert-js/power-assert/issues/36)
- What is the ['Critical dependencies' warning shown by webpack](https://github.com/power-assert-js/babel-plugin-espower/issues/14#issuecomment-197272436) and how to [suppress warnings](https://github.com/power-assert-js/babel-plugin-espower/issues/14#issuecomment-197909419)?
- [Causes `TypeError: assert._capt is not a function`](https://github.com/power-assert-js/power-assert/issues/42)
- [How to deal with `assert` calls in production](https://github.com/power-assert-js/power-assert/issues/43#issuecomment-208851919)
- [Support JSX tags?](https://github.com/power-assert-js/power-assert/issues/34#issuecomment-269848058)
- [Any tool to migrate `should/expect` code to `power-assert`?](https://github.com/power-assert-js/power-assert/issues/74)
- [Conflicts with babel-plugin-istanbul?](https://github.com/power-assert-js/babel-preset-power-assert/issues/4)
- [power-assert message does not appear in Node8](https://github.com/power-assert-js/power-assert/issues/85)


INSTALL
---------------------------------------

`npm install --save-dev power-assert <one of instrumentors>`

or

```
bower install --save-dev power-assert
npm install --save-dev <one of instrumentors>
```

see [list of instrumentors](https://github.com/power-assert-js/power-assert#be-sure-to-transform-test-code)


CHANGELOG
---------------------------------------
See [CHANGELOG](https://github.com/power-assert-js/power-assert/blob/master/CHANGELOG.md)


EXAMPLE
---------------------------------------

See [HOW TO USE](https://github.com/power-assert-js/power-assert#how-to-use) section for more details.

__Note:__ There is an [online demo site](https://azu.github.io/power-assert-demo/) available.


### Target test code (using Mocha in this example)

```javascript
'use strict';

const assert = require('assert');

describe('Array', function(){
    let ary;
    beforeEach(() => {
        ary = [1,2,3];
    });
    describe('#indexOf()', () => {
        it('should return index when the value is present', () => {
            const zero = 0, two = 2;
            assert(ary.indexOf(zero) === two);
        });
        it('should return -1 when the value is not present', () => {
            const minusOne = -1, two = 2;
            assert.ok(ary.indexOf(two) === minusOne, 'THIS IS AN ASSERTION MESSAGE');
        });
    });
});

describe('various types', () => {
    let types;
    class Person {
        constructor(name, age) {
            this.name = name;
            this.age = age;
        }
    }
    beforeEach(() => {
        types = [
            'string', 98.6, true, false, null, undefined,
            ['nested', 'array'],
            {object: true},
            NaN, Infinity,
            /^not/,
            new Person('alice', 3)
        ];
    });
    it('demo', () => {
        const index = types.length -1,
            bob = new Person('bob', 5);
        assert(types[index].name === bob.name);
    });
});
```

### Be sure to transform test code

To use power-assert, you need to transform your test code for power-assert output.

Code transform is done by instrumentors below:

 - [espower-loader](https://github.com/power-assert-js/espower-loader) (with [intelli-espower-loader](https://github.com/power-assert-js/intelli-espower-loader))
 - [babel-preset-power-assert](https://github.com/power-assert-js/babel-preset-power-assert)
 - [babel-plugin-espower](https://github.com/power-assert-js/babel-plugin-espower)
 - [espowerify](https://github.com/power-assert-js/espowerify)
 - [webpack-espower-loader](https://github.com/power-assert-js/webpack-espower-loader).
 - [espower-cli](https://github.com/power-assert-js/espower-cli)
 - [grunt-espower](https://github.com/power-assert-js/grunt-espower)
 - [gulp-espower](https://github.com/power-assert-js/gulp-espower)
 - [karma-espower-preprocessor](https://github.com/power-assert-js/karma-espower-preprocessor)
 - [espower-coffee](https://github.com/power-assert-js/espower-coffee)
 - [espower-typescript](https://github.com/power-assert-js/espower-typescript)
 - [espower-traceur](https://github.com/power-assert-js/espower-traceur)

If you are using Node.js only, the easiest way is to use [intelli-espower-loader](https://github.com/power-assert-js/intelli-espower-loader). Steps are as follows.


### Setup

`npm install --save-dev mocha power-assert intelli-espower-loader`


### Run

Put tests into `test` directory then run. You will see the power-assert output appears.

      $ $(npm bin)/mocha --require intelli-espower-loader path/to/test/mocha_node.js
    
    
      Array
        #indexOf()
          1) should return index when the value is present
          2) should return -1 when the value is not present
    
      various types
        3) demo
    
    
      0 passing (43ms)
      3 failing
    
      1) Array #indexOf() should return index when the value is present:
    
          AssertionError:   # test/example2.js:13
    
      assert(ary.indexOf(zero) === two)
             |   |       |     |   |
             |   |       |     |   2
             |   -1      0     false
             [1,2,3]
    
      [number] two
      => 2
      [number] ary.indexOf(zero)
      => -1
    
          + expected - actual
    
          -false
          +true
    
          at Context.it (test/example2.js:13:13)
    
      2) Array #indexOf() should return -1 when the value is not present:
    
          AssertionError: THIS IS AN ASSERTION MESSAGE   # test/example2.js:17
    
      assert.ok(ary.indexOf(two) === minusOne, 'THIS IS AN ASSERTION MESSAGE')
                |   |       |    |   |
                |   |       |    |   -1
                |   1       2    false
                [1,2,3]
    
      [number] minusOne
      => -1
      [number] ary.indexOf(two)
      => 1
    
          + expected - actual
    
          -false
          +true
    
          at Context.it (test/example2.js:17:20)
    
      3) various types demo:
    
          AssertionError:   # test/example2.js:43
    
      assert(types[index].name === bob.name)
             |    ||      |    |   |   |
             |    ||      |    |   |   "bob"
             |    ||      |    |   Person{name:"bob",age:5}
             |    ||      |    false
             |    |11     "alice"
             |    Person{name:"alice",age:3}
             ["string",98.6,true,false,null,undefined,#Array#,#Object#,NaN,Infinity,/^not/,#Person#]
    
      --- [string] bob.name
      +++ [string] types[index].name
      @@ -1,3 +1,5 @@
      -bob
      +alice
    
    
          + expected - actual
    
          -false
          +true
    
          at Context.it (test/example2.js:43:9)



SEED PROJECTS
---------------------------------------

Some seed projects are available to help you start with power-assert.

| module | env | tech stack |
|:-------|:------------|:------------|
| [power-assert-node-seed](https://github.com/azu/power-assert-node-seed) | Node.js | power-assert + [intelli-espower-loader](https://github.com/power-assert-js/intelli-espower-loader) |
| [power-assert-testem-seed](https://github.com/azu/power-assert-testem-seed) | Browsers(by [testem](https://github.com/testem/testem)) | power-assert + [gulp-espower](https://github.com/power-assert-js/gulp-espower) + [testem](https://github.com/airportyh/testem). |
| [power-assert-karma-seed](https://github.com/azu/power-assert-karma-seed) | Browsers(by [Karma](https://karma-runner.github.io/)) | power-assert + [espowerify](https://github.com/power-assert-js/espowerify) + [browserify](http://browserify.org/) + [Karma](https://karma-runner.github.io/). |


HOW TO USE
---------------------------------------

There are some ways to use power-assert. (If you want to see running examples, see [SEED PROJECTS](#seed-projects))

1. `power-assert` + `Babel` + `babel-preset-power-assert`: The only way to enable power-assert if you are using [Babel6+](https://babeljs.io/).
2. `power-assert` + `espower-loader` or `intelli-espower-loader` : Simple and recommended (but only works under Node).
3. `power-assert` + `espower-coffee` or `espower-typescript`: Use power-assert with AltJS. Recommended but only works under Node.
4. `power-assert` + `browserify` + `espowerify`: if you are using [browserify](http://browserify.org/) but not with Babel.
5. `power-assert` + `webpack` + `webpack-espower-loader`: if you are using [webpack](https://webpack.github.io/) but not with Babel.
6. `power-assert` + `espower-cli` or `grunt-espower` or `gulp-espower` : Generate instrumented code so works anywhere.


### using `babel-preset-power-assert` or `babel-plugin-espower`

If you are writing your code with Babel, you can instrument Power Assert feature with Babel and babel-preset-power-assert (or babel-plugin-espower).

see [babel-plugin-espower README](https://github.com/power-assert-js/babel-plugin-espower) and [babel-preset-power-assert README](https://github.com/power-assert-js/babel-preset-power-assert)


### using `espower-loader` or `intelli-espower-loader`

If you are writing Node.js app/module, you can instrument Power Assert feature without code generation by using `espower-loader`.

see [espower-loader README](https://github.com/power-assert-js/espower-loader).

FYI: You may be interested in [intelli-espower-loader](https://github.com/power-assert-js/intelli-espower-loader) to go one step further. With [intelli-espower-loader](https://github.com/power-assert-js/intelli-espower-loader), you don't need to create loader file (like `enable-power-assert.js`). Just define test directory in `package.json` wow!


### using `espower-typescript`

If you are writing Node.js app/module in TypeScript, you can instrument Power Assert feature without code generation by using `espower-typescript`.

see [espower-typescript README](https://github.com/power-assert-js/espower-typescript).


### using `espower-coffee`

If you are writing Node.js app/module in CoffeeScript, you can instrument Power Assert feature without code generation by using `espower-coffee`.

see [espower-coffee README](https://github.com/power-assert-js/espower-coffee).


### using `espowerify`

If you are using [browserify](http://browserify.org/) but not with Babel, you can instrument Power Assert feature via `espowerify`.

see [espowerify README](https://github.com/power-assert-js/espowerify).


### using `webpack-espower-loader`

If you are using [webpack](https://webpack.github.io/) but not with Babel, you can instrument Power Assert feature via `webpack-espower-loader`.

see [webpack-espower-loader README](https://github.com/power-assert-js/webpack-espower-loader).


### using `espower-cli`

If you don't want to use grunt, gulp, browserify, and so on, you can use `power-assert` via bower, with generated code by `espower-cli`

see [espower-cli README](https://github.com/power-assert-js/espower-cli).


### using `gulp-espower`

On the browser side and you are not using [browserify](http://browserify.org/) but [bower](https://bower.io/) and [gulp](http://gulpjs.com/), you can use `power-assert` via bower, with generated code by `gulp-espower`

see [gulp-espower README](https://github.com/power-assert-js/gulp-espower).


### using `grunt-espower`

On the browser side and you are not using [browserify](http://browserify.org/) but [bower](https://bower.io/) and [Grunt](http://gruntjs.com/), you can use `power-assert` via bower, with generated code by `grunt-espower`

see [grunt-espower README](https://github.com/power-assert-js/grunt-espower).



CUSTOMIZATION API
---------------------------------------

`power-assert` provides an API for customization.

### var assert = assert.customize(options)

Through this API, you can customize power-assert by changing some options.

```javascript
var assert = require('power-assert').customize({
    output: {
        maxDepth: 2
    }
});
```

### options

`options` has two top-level keys. `assertion` and `output`.

#### options.assertion

customization options for [empower](https://github.com/power-assert-js/empower) module. See [empower API documentation](https://github.com/power-assert-js/empower#api) for details. Note that some default values are different from `empower`'s (`modifyMessageOnRethrow: true` and `saveContextOnRethrow: true`).

#### options.output

customization options for [power-assert-formatter](https://github.com/power-assert-js/power-assert-formatter) module. See [power-assert-formatter API documentation](https://github.com/power-assert-js/power-assert-formatter#api) for details.

#### default values

customizable properties and their default values are as follows.

```javascript
var assert = require('power-assert').customize({
    assertion: {
        destructive: false,
        modifyMessageOnRethrow: true,
        saveContextOnRethrow: true,
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
    },
    output: {
        lineDiffThreshold: 5,
        maxDepth: 1,
        anonymous: 'Object',
        circular: '#@Circular#',
        lineSeparator: '\n',
        ambiguousEastAsianCharWidth: 2,
        widthOf: (Function to calculate width of string. Please see power-assert-formatter's documentation)
        stringify: (Function to stringify any target value. Please see power-assert-formatter's documentation)
        diff: (Function to create diff string between two strings. Please see power-assert-formatter's documentation)
        writerClass: (Constructor Function for output writer class. Please see power-assert-formatter's documentation)
        renderers: [
            './built-in/file',
            './built-in/assertion',
            './built-in/diagram',
            './built-in/binary-expression'
        ]
    }
});
```


INTERNAL DESIGN
---------------------------------------

`power-assert` family provides 1 main module, 4 core modules and many more instrumentors.


Main (facade) module is,

| module | description |
|:-------|:------------|
| [power-assert](https://github.com/power-assert-js/power-assert) | Standard `assert` function on top of `empower` and `power-assert-formatter` |

core modules are,

| module | description |
|:-------|:------------|
| [empower](https://github.com/power-assert-js/empower) | Power Assert feature enhancer for assert function/object. |
| [power-assert-formatter](https://github.com/power-assert-js/power-assert-formatter) | Power Assert output formatter. |
| [espower](https://github.com/power-assert-js/espower) | Power Assert feature instrumentor core based on the ECMAScript AST defined in [The ESTree Spec](https://github.com/estree/estree) (formerly known as [Mozilla SpiderMonkey Parser API](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API)). |
| [espower-source](https://github.com/power-assert-js/espower-source) | Power Assert instrumentor from source to source, with source-map. (Thin wrapper of `espower`). |

and instrumentors are,

| module | description |
|:-------|:------------|
| [espower-loader](https://github.com/power-assert-js/espower-loader) | Node module loader to apply `espower` on the fly. |
| [intelli-espower-loader](https://github.com/power-assert-js/intelli-espower-loader) | configure `espower-loader` with ease. |
| [babel-preset-power-assert](https://github.com/power-assert-js/babel-preset-power-assert) | [Babel](https://babeljs.io/) preset to instrument power-assert feature into target files. |
| [babel-plugin-espower](https://github.com/power-assert-js/babel-plugin-espower) | [Babel](https://babeljs.io/) plugin to instrument power-assert feature into target files. |
| [espowerify](https://github.com/power-assert-js/espowerify) | [Browserify](http://browserify.org/) transform to apply `espower` to target files. |
| [webpack-espower-loader](https://github.com/power-assert-js/webpack-espower-loader) | Power Assert instrumentor module for [webpack](https://webpack.github.io/). |
| [espower-cli](https://github.com/power-assert-js/espower-cli) | Command line tool for power-assert. |
| [grunt-espower](https://github.com/power-assert-js/grunt-espower) | Grunt task to apply `espower` to target files. |
| [gulp-espower](https://github.com/power-assert-js/gulp-espower) | Gulp plugin to apply `espower` to target files. |
| [karma-espower-preprocessor](https://github.com/power-assert-js/karma-espower-preprocessor) | karma-preprocessor for power-assert. |
| [espower-coffee](https://github.com/power-assert-js/espower-coffee) | power-assert instrumentor for CoffeeScript. |
| [espower-typescript](https://github.com/power-assert-js/espower-typescript) | power-assert instrumentor for TypeScript. |
| [espower-traceur](https://github.com/power-assert-js/espower-traceur) | power-assert instrumentor for ES6 using [Traceur Compiler](https://github.com/google/traceur-compiler/). |
| [espower-babel](https://github.com/power-assert-js/espower-babel) | [DEPRECATED] power-assert instrumentor for ES6 using [Babel](https://babeljs.io/). |


`power-assert` provides standard [assert](https://nodejs.org/api/assert.html) compatible function with Power Assert feature.
(Best fit with [Mocha](https://mochajs.org/). If you use assert-like objects provided by various testing frameworks such as [QUnit](https://qunitjs.com/) or [nodeunit](https://github.com/caolan/nodeunit). Please use [empower](https://github.com/power-assert-js/empower) and [power-assert-formatter](https://github.com/power-assert-js/power-assert-formatter) modules directly).


Internally, `power-assert` uses [empower](https://github.com/power-assert-js/empower) module to enhance power assert feature into the standard [assert](https://nodejs.org/api/assert.html) module, to run with the power assert feature added code by [espower](https://github.com/power-assert-js/espower) module, and prettify output using [power-assert-formatter](https://github.com/power-assert-js/power-assert-formatter).


See [power-assert-demo](https://github.com/twada/power-assert-demo) project for power-assert Demo running with mocha.


SUPPORTED FRAMEWORKS
---------------------------------------

* [Mocha](https://mochajs.org/)
* [AVA](https://github.com/sindresorhus/ava)


### FRAMEWORKS KNOWN TO WORK

* [Jest](https://facebook.github.io/jest/) with Babel
* [Karma](https://karma-runner.github.io/) with Mocha
* [testem](https://github.com/testem/testem) with Mocha
* [QUnit](https://qunitjs.com/)
* [nodeunit](https://github.com/caolan/nodeunit)
* [buster-assertions](https://docs.busterjs.org/en/latest/modules/buster-assertions/)
* [Lab](https://github.com/hapijs/lab)
* [Nightmare](http://www.nightmarejs.org/)
* [Protractor](http://www.protractortest.org/)
* [eater](https://github.com/yosuke-furukawa/eater)


OUR SUPPORT POLICY
---------------------------------------

For the Transpiler side, we support Node under maintenance. In other words, we stop supporting old Node version when [their maintenance ends](https://github.com/nodejs/LTS).

For the Runtime side, we support [Node under maintenance](https://github.com/nodejs/LTS) and "modern enough" browsers such as Chrome, Firefox, Safari, Edge etc.

Any other environments are not supported officially (means that we do not test against them on CI service). power-assert is known to work with old browsers, and trying to keep them working though.


AUTHOR
---------------------------------------
* [Takuto Wada](https://github.com/twada)


CONTRIBUTORS
---------------------------------------
* [azu (azu)](https://github.com/azu)
* [vvakame (Masahiro Wakame)](https://github.com/vvakame)
* [yosuke-furukawa (Yosuke Furukawa)](https://github.com/yosuke-furukawa)
* [teppeis (Teppei Sato)](https://github.com/teppeis)
* [zoncoen (Kenta Mori)](https://github.com/zoncoen)
* [falsandtru (falsandtru)](https://github.com/falsandtru)
* [jamestalmage (James Talmage)](https://github.com/jamestalmage)
* [LeshaKoss (Lesha Koss)](https://github.com/LeshaKoss)
* [watilde (Daijirō Wachi)](https://github.com/watilde)


LICENSE
---------------------------------------
Licensed under the [MIT](https://github.com/power-assert-js/power-assert/blob/master/MIT-LICENSE.txt) license.



MORE OUTPUT EXAMPLES
---------------------------------------

### Target test code (using QUnit in this example)

```javascript
var q = require('qunitjs');

(function () {
    var empower = require('empower'),
        formatter = require('power-assert-formatter'),
        qunitTap = require("qunit-tap");
    empower(q.assert, formatter(), {destructive: true});
    qunitTap(q, require('util').puts, {showSourceOnFailure: false});
    q.config.autorun = false;
})();

q.test('spike', function (assert) {
    assert.ok(true);

    var hoge = 'foo';
    var fuga = 'bar';
    assert.ok(hoge === fuga, 'comment');

    var piyo = 3;
    assert.ok(fuga === piyo);

    var longString = 'very very loooooooooooooooooooooooooooooooooooooooooooooooooooong message';
    var anotherLongString = 'yet another loooooooooooooooooooooooooooooooooooooooooooooooooooong message';
    assert.ok(longString === anotherLongString);

    assert.ok(4 === piyo);

    assert.ok(4 !== 4);

    var falsyStr = '';
    assert.ok(falsyStr);

    var falsyNum = 0;
    assert.ok(falsyNum);

    var ary1 = ['foo', 'bar'];
    var ary2 = ['aaa', 'bbb', 'ccc'];
    assert.ok(ary1.length === ary2.length);
    assert.deepEqual(ary1, ary2);

    var actual = 16;
    assert.ok(5 < actual && actual < 13);

    actual = 4;
    assert.ok(5 < actual && actual < 13);

    actual = 10;
    assert.ok(actual < 5 || 13 < actual);


    var propName = 'bar',
        foo = {
            bar: {
                baz: false
            }
        };

    assert.ok(foo.bar.baz);
    assert.ok(foo['bar'].baz);
    assert.ok(foo[propName]['baz']);


    var truth = true;
    assert.ok(!truth);


    var func = function () { return false; };
    assert.ok(func());


    var obj = {
        age: function () {
            return 0;
        }
    };
    assert.ok(obj.age());


    var isFalsy = function (arg) {
        return !(arg);
    };
    var positiveInt = 50;
    assert.ok(isFalsy(positiveInt));


    var sum = function () {
        var result = 0;
        for (var i = 0; i < arguments.length; i += 1) {
            result += arguments[i];
        }
        return result;
    };
    var one = 1, two = 2, three = 3, seven = 7, ten = 10;
    assert.ok(sum(one, two, three) === seven);
    assert.ok(sum(sum(one, two), three) === sum(sum(two, three), seven));
    assert.ok((three * (seven * ten)) === three);


    var math = {
        calc: {
            sum: function () {
                var result = 0;
                for (var i = 0; i < arguments.length; i += 1) {
                    result += arguments[i];
                }
                return result;
            }
        }
    };
    assert.ok(math.calc.sum(one, two, three) === seven);
});

q.load();
```


### `espower` code above then running under Node.js
    
```
# module: undefined
# test: spike
ok 1 - okay
not ok 2 - comment # path/to/examples/qunit_node.js:17
#
# assert.ok(hoge === fuga, 'comment')
#           |    |   |
#           |    |   "bar"
#           |    false
#           "foo"
#
# --- [string] fuga
# +++ [string] hoge
# @@ -1,3 +1,3 @@
# -bar
# +foo
#
# , test: spike
not ok 3 - # path/to/examples/qunit_node.js:20
#
# assert.ok(fuga === piyo)
#           |    |   |
#           |    |   3
#           |    false
#           "bar"
#
# [number] piyo
# => 3
# [string] fuga
# => "bar"

# , test: spike
not ok 4 - # path/to/examples/qunit_node.js:24
#
# assert.ok(longString === anotherLongString)
#           |          |   |
#           |          |   "yet another loooooooooooooooooooooooooooooooooooooooooooooooooooong message"
#           |          false
#           "very very loooooooooooooooooooooooooooooooooooooooooooooooooooong message"
#
# --- [string] anotherLongString
# +++ [string] longString
# @@ -1,15 +1,13 @@
# -yet anoth
# +very v
#  er
# +y
#   loo
#
# , test: spike
not ok 5 - # path/to/examples/qunit_node.js:26
#
# assert.ok(4 === piyo)
#             |   |
#             |   3
#             false
#
# [number] piyo
# => 3
# [number] 4
# => 4
# , test: spike
not ok 6 - # path/to/examples/qunit_node.js:28
#
# assert.ok(4 !== 4)
#             |
#             false
# , test: spike
not ok 7 - # path/to/examples/qunit_node.js:31
#
# assert.ok(falsyStr)
#           |
#           ""
# , test: spike
not ok 8 - # path/to/examples/qunit_node.js:34
#
# assert.ok(falsyNum)
#           |
#           0
# , test: spike
not ok 9 - # path/to/examples/qunit_node.js:38
#
# assert.ok(ary1.length === ary2.length)
#           |    |      |   |    |
#           |    |      |   |    3
#           |    |      |   ["aaa","bbb","ccc"]
#           |    2      false
#           ["foo","bar"]
#
# [number] ary2.length
# => 3
# [number] ary1.length
# => 2
# , test: spike
not ok 10 - # path/to/examples/qunit_node.js:39
#
# assert.deepEqual(ary1, ary2)
#                  |     |
#                  |     ["aaa","bbb","ccc"]
#                  ["foo","bar"]
# , expected: [
#   "aaa",
#   "bbb",
#   "ccc"
# ], got: [
#   "foo",
#   "bar"
# ], test: spike
not ok 11 - # path/to/examples/qunit_node.js:42
#
# assert.ok(5 < actual && actual < 13)
#             | |      |  |      |
#             | |      |  16     false
#             | 16     false
#             true
# , test: spike
not ok 12 - # path/to/examples/qunit_node.js:45
#
# assert.ok(5 < actual && actual < 13)
#             | |      |
#             | 4      false
#             false
# , test: spike
not ok 13 - # path/to/examples/qunit_node.js:48
#
# assert.ok(actual < 5 || 13 < actual)
#           |      |   |     | |
#           |      |   |     | 10
#           |      |   false false
#           10     false
# , test: spike
not ok 14 - # path/to/examples/qunit_node.js:58
#
# assert.ok(foo.bar.baz)
#           |   |   |
#           |   |   false
#           |   Object{baz:false}
#           Object{bar:#Object#}
# , test: spike
not ok 15 - # path/to/examples/qunit_node.js:59
#
# assert.ok(foo['bar'].baz)
#           |  |       |
#           |  |       false
#           |  Object{baz:false}
#           Object{bar:#Object#}
# , test: spike
not ok 16 - # path/to/examples/qunit_node.js:60
#
# assert.ok(foo[propName]['baz'])
#           |  ||        |
#           |  |"bar"    false
#           |  Object{baz:false}
#           Object{bar:#Object#}
# , test: spike
not ok 17 - # path/to/examples/qunit_node.js:64
#
# assert.ok(!truth)
#           ||
#           |true
#           false
# , test: spike
not ok 18 - # path/to/examples/qunit_node.js:68
#
# assert.ok(func())
#           |
#           false
# , test: spike
not ok 19 - # path/to/examples/qunit_node.js:76
#
# assert.ok(obj.age())
#           |   |
#           |   0
#           Object{age:#function#}
# , test: spike
not ok 20 - # path/to/examples/qunit_node.js:83
#
# assert.ok(isFalsy(positiveInt))
#           |       |
#           false   50
# , test: spike
not ok 21 - # path/to/examples/qunit_node.js:94
#
# assert.ok(sum(one, two, three) === seven)
#           |   |    |    |      |   |
#           |   |    |    |      |   7
#           6   1    2    3      false
#
# [number] seven
# => 7
# [number] sum(one, two, three)
# => 6
# , test: spike
not ok 22 - # path/to/examples/qunit_node.js:95
#
# assert.ok(sum(sum(one, two), three) === sum(sum(two, three), seven))
#           |   |   |    |     |      |   |   |   |    |       |
#           |   |   |    |     |      |   12  5   2    3       7
#           6   3   1    2     3      false
#
# [number] sum(sum(two, three), seven)
# => 12
# [number] sum(sum(one, two), three)
# => 6
# , test: spike
not ok 23 - # path/to/examples/qunit_node.js:96
#
# assert.ok(three * (seven * ten) === three)
#           |     |  |     | |    |   |
#           |     |  |     | |    |   3
#           |     |  |     | 10   false
#           |     |  7     70
#           3     210
#
# [number] three
# => 3
# [number] three * (seven * ten)
# => 210
# , test: spike
not ok 24 - # path/to/examples/qunit_node.js:110
#
# assert.ok(math.calc.sum(one, two, three) === seven)
#           |    |    |   |    |    |      |   |
#           |    |    |   |    |    |      |   7
#           |    |    6   1    2    3      false
#           |    Object{sum:#function#}
#           Object{calc:#Object#}
#
# [number] seven
# => 7
# [number] math.calc.sum(one, two, three)
# => 6
# , test: spike
1..24
```

Have fun!


[power-assert-url]: https://github.com/power-assert-js/power-assert
[power-assert-banner]: https://raw.githubusercontent.com/power-assert-js/power-assert-js-logo/master/banner/banner-official-fullcolor.png

[npm-url]: https://www.npmjs.com/package/power-assert
[npm-image]: https://badge.fury.io/js/power-assert.svg

[bower-url]: https://badge.fury.io/bo/power-assert
[bower-image]: https://badge.fury.io/bo/power-assert.svg

[travis-url]: https://travis-ci.org/power-assert-js/power-assert
[travis-image]: https://secure.travis-ci.org/power-assert-js/power-assert.svg?branch=master

[depstat-url]: https://gemnasium.com/power-assert-js/power-assert
[depstat-image]: https://gemnasium.com/power-assert-js/power-assert.svg

[license-url]: https://github.com/power-assert-js/power-assert/blob/master/MIT-LICENSE.txt
[license-image]: https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat
