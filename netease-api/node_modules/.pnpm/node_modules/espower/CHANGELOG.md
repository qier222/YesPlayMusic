### [2.1.2](https://github.com/power-assert-js/espower/releases/tag/v2.1.2) (2019-01-11)


#### Bug Fixes

  * [Skip modifying argument if SpreadElement appears immediately beneath assert](https://github.com/power-assert-js/espower/pull/42)


#### Refactor

  * [remove xtend](https://github.com/power-assert-js/espower/pull/40) (by [jimmywarting](https://github.com/jimmywarting))


#### Chore

  * [Replace gulp with npm scripts](https://github.com/power-assert-js/espower/pull/41)


### [2.1.1](https://github.com/power-assert-js/espower/releases/tag/v2.1.1) (2018-05-15)


* Update default `ecmaVersion` to 2018 ([f315b49](https://github.com/power-assert-js/espower/commit/f315b49399200051f9ec47ad0c8877c2ff112463))


## [2.1.0](https://github.com/power-assert-js/espower/releases/tag/v2.1.0) (2017-05-21)


#### Features

* [Add `ecmaVersion` and `sourceType` to options to support ES Modules syntax](https://github.com/power-assert-js/espower/pull/37)


### [2.0.3](https://github.com/power-assert-js/espower/releases/tag/v2.0.3) (2017-02-19)


#### Bug Fixes

* [Store scopes in a stack to push/pop them in a consistent way](https://github.com/power-assert-js/espower/pull/36)


### [2.0.2](https://github.com/power-assert-js/espower/releases/tag/v2.0.2) (2017-01-12)


#### Bug Fixes

* [Value recorder should clean up captured values at the end of assertion expression](https://github.com/power-assert-js/espower/pull/35)


### [2.0.1](https://github.com/power-assert-js/espower/releases/tag/v2.0.1) (2016-11-16)


#### Bug Fixes

* [Dealing with assertion that also is a concise body of ArrowFunctionExpression](https://github.com/power-assert-js/espower/pull/34)


## [2.0.0](https://github.com/power-assert-js/espower/releases/tag/v2.0.0) (2016-11-11)


#### Features

  * [Embed value capturing helper into transpiled code](https://github.com/power-assert-js/espower/pull/26)
  * [Expose visitor object for estraverse](https://github.com/power-assert-js/espower/pull/31)
  * stop exposing Instrumentor and AssertionVisitor ([afa380f9](https://github.com/power-assert-js/espower/commit/afa380f949acf4366d9226c44d89cb7ccdfd72c5))
  * [Remove destructive option](https://github.com/power-assert-js/espower/pull/30)
  * [Drop support for prebuilt bundle, bower and Node v0.10](https://github.com/power-assert-js/espower/pull/32)


#### Breaking Changes

* [Drop support for prebuilt bundle, bower and Node v0.10](https://github.com/power-assert-js/espower/pull/32)

We stopped providing prebuilt bundle for browsers. Please build your own by using browserify, webpack and so on.
We also dropped bower support. Please use npm instead.


* Internal classes `espower.Instrumentor` and `espower.AssertionVisitor` are not exported any more.

 ([afa380f9](https://github.com/power-assert-js/espower/commit/afa380f949acf4366d9226c44d89cb7ccdfd72c5))


* [Remove destructive option](https://github.com/power-assert-js/espower/pull/30)

The `destructive` option has been removed.

New behavior is like `destructive: true`, means that passed AST is modified directly.
If you do not want your AST to be modified directly, you should deep-clone your AST by yourself.


### [1.3.2](https://github.com/power-assert-js/espower/releases/tag/v1.3.2) (2016-06-22)


#### Bug Fixes

  * fix breaking changes introduced in 1.3.0 and 1.3.1


### [1.3.1](https://github.com/power-assert-js/espower/releases/tag/v1.3.1) (2016-06-21)


#### Bug Fixes

  * stop capturing SequenceExpression itself since SequenceExpressions are not enclosed in parentheses in some cases ([e8acbc61](https://github.com/power-assert-js/espower/commit/e8acbc61810454da05098baf6624b57d68deb3f9))


## [1.3.0](https://github.com/power-assert-js/espower/releases/tag/v1.3.0) (2016-06-21)


#### Features

  * [Support SequenceExpression (i.e., comma operator)](https://github.com/power-assert-js/espower/pull/27)


### [1.2.1](https://github.com/power-assert-js/espower/releases/tag/v1.2.1) (2015-11-06)


  * [disambiguate between function calls and async/yield expressions](https://github.com/power-assert-js/espower/pull/23) (by [@jamestalmage](https://github.com/jamestalmage))


## [1.2.0](https://github.com/power-assert-js/espower/releases/tag/v1.2.0) (2015-11-05)


  * [Instrument ES7 AwaitExpression Nodes](https://github.com/power-assert-js/espower/pull/21) (by [@jamestalmage](https://github.com/jamestalmage))


## [1.1.0](https://github.com/power-assert-js/espower/releases/tag/v1.1.0) (2015-11-03)


  * [capture YieldExpressions](https://github.com/power-assert-js/espower/pull/20) (by [@jamestalmage](https://github.com/jamestalmage))
  * [make AssertionVisitor more overridable](https://github.com/power-assert-js/espower/pull/19)


### [1.0.7](https://github.com/power-assert-js/espower/releases/tag/v1.0.7) (2015-09-21)


  * update escodegen to 1.7.0 ([feb96b0](https://github.com/power-assert-js/espower/commit/feb96b004acd0c540ab76a2529d91582b2095433))
  * update source-map to 0.5.0 ([7bc824b](https://github.com/power-assert-js/espower/commit/7bc824ba9d808be7d25959822acceb9e04422373))


### [1.0.6](https://github.com/power-assert-js/espower/releases/tag/v1.0.6) (2015-06-07)


  * SourceMap's `sourceRoot` should have precedence over `options.sourceRoot` if `sourceRoot` is URL ([dcf9642d](https://github.com/power-assert-js/espower/commit/dcf9642de0becb8239d4c3a1b8366a980bddb585))


### [1.0.5](https://github.com/power-assert-js/espower/releases/tag/v1.0.5) (2015-06-05)


  * update escallmatch to 1.4.2 and espurify to 1.3.0 ([62973ed](https://github.com/power-assert-js/espower/commit/62973ed7392037e46dedf9d8c5e02a2c28ed95c2))
  * use licensify to prepend license header ([d3bc5e8](https://github.com/power-assert-js/espower/commit/d3bc5e860126826b60ef3108add145c5c076e9bf))


### [1.0.4](https://github.com/power-assert-js/espower/releases/tag/v1.0.4) (2015-06-04)


  * try to create relative path if sourceMap.sourceRoot is locating source files on on a server ([ec0a91ba](https://github.com/power-assert-js/espower/commit/ec0a91baac5f747bd49ca88ea963141485bdddde))
  * never show absolute path or URL in power-assert output ([252b043f](https://github.com/power-assert-js/espower/commit/252b043f32db00fbbd81b7a6eb98e9d85c5b9371))


### [1.0.3](https://github.com/power-assert-js/espower/releases/tag/v1.0.3) (2015-05-31)


  * use basename when `sourceRoot` in `options.sourceMap` is locating source files on a server ([7822df1b](https://github.com/power-assert-js/espower/commit/7822df1b2097625231b2d70f71c5909851399f1d))


### [1.0.2](https://github.com/power-assert-js/espower/releases/tag/v1.0.2) (2015-05-30)


  * use basename when incoming `options.path` is absolute and it conflicts with `options.sourceRoot` or `sourceRoot` in `options.sourceMap` ([02f7b35a](https://github.com/power-assert-js/espower/commit/02f7b35a5acad20994b745de32cf512c2b95f57a))


### [1.0.1](https://github.com/power-assert-js/espower/releases/tag/v1.0.1) (2015-05-29)


  * apply `options.sourceRoot` if and only if incoming `options.path` is absolute ([65b4012a](https://github.com/power-assert-js/espower/commit/65b4012ab4ef71131fa5c4ea3090ab3f625e32d9))


## [1.0.0](https://github.com/power-assert-js/espower/releases/tag/v1.0.0) (2015-05-25)


#### Features

  * transfer to power-assert-js organization ([c3b79559](https://github.com/power-assert-js/espower/commit/c3b79559d1d5cd8ea6d66406b36749bbafe33637))
  * support `deepStrictEqual` and `notDeepStrictEqual` ([9d98bc17](https://github.com/power-assert-js/espower/commit/9d98bc178c0a21f41ff4888fba9c89139f8af195))
  * [`sourceRoot` option](https://github.com/power-assert-js/espower/pull/18). If set, filepath in power-assert output will be relative from `sourceRoot`
  * [`visitorKeys` option](https://github.com/power-assert-js/espower/pull/17) to customize AST traversal


## [0.11.0](https://github.com/power-assert-js/espower/releases/tag/v0.11.0) (2015-04-18)


#### Bug Fixes

* throw Error if AST is already instrumented ([1d47bdc3](https://github.com/power-assert-js/espower/commit/1d47bdc3169de7865e176ceb708a07247ab17703))


#### Features

* [ES6 support](https://github.com/power-assert-js/espower/pull/16)


## [0.10.0](https://github.com/power-assert-js/espower/releases/tag/v0.10.0) (2014-11-11)


* **espower:**
  * update escodegen ([22b002e3](https://github.com/power-assert-js/espower/commit/22b002e3c8c99679f5b97ae104ed66d685a0ea59))
  * update estraverse ([ecb6c07d](https://github.com/power-assert-js/espower/commit/ecb6c07dec5fd3c9cbf2da4e82667d0077ef3909))
  * update espurify ([9a75c16f](https://github.com/power-assert-js/espower/commit/9a75c16ff91f952b26a373df4e96bdcc6e09cfd8))
  * update escallmatch ([dbf424b1](https://github.com/power-assert-js/espower/commit/dbf424b1d3236dd2ac9e4076aef1ecee3867e228))


### 0.9.1 (2014-09-15)


#### Bug Fixes

* **espower:** decide to be skipped first, then enter node ([9d0a778a](https://github.com/power-assert-js/espower/commit/9d0a778a1ae97bb5c522cbfc7b1b65250118f2ea))


## 0.9.0 (2014-08-21)


#### Features

* **espower:**
  * adjust filepath in power-assert output if sourceMap option is given ([f919d59d](https://github.com/power-assert-js/espower/commit/f919d59d6eea764881e0266f562724b7142f7695))
  * adjust line number in power-assert output if sourceMap option is given ([8c035d89](https://github.com/power-assert-js/espower/commit/8c035d89ae88c8554cb8ca0b6bd0f7d6fe2008b0))


## 0.8.0 (2014-08-12)


#### Features


* **espower:**
  * [built and modularized by browserify](https://github.com/power-assert-js/espower/pull/9)
  * [use escallmatch module to describe instrumentation target patterns](https://github.com/power-assert-js/espower/pull/10)
  * support chained callee like `browser.assert.element(selector)` ([ea0a3ce9](https://github.com/power-assert-js/espower/commit/ea0a3ce96f56034ab6735365184e1e397f6561c0))


#### Breaking Changes

  * option `powerAssertVariableName` is now deprecated and ignored. Please use `patterns` option instead ([2f023f91](https://github.com/power-assert-js/espower/commit/2f023f91f3bbe8c6d9038e7237541112f2eaf143))
  * option `targetMethods` is now deprecated and ignored. Please use `patterns` option instead ([e75e5d35](https://github.com/power-assert-js/espower/commit/e75e5d35c33a7c128f14db224c5387520665b55e))

If you already customize instrumentation pattern using `powerAssertVariableName` and `targetMethods`, you need to migarte. To migrate, change your code from the following:

```javascript
var options = {
    powerAssertVariableName: 'yourAssert',
    targetMethods: {
        oneArg: [
            'okay'
        ],
        twoArgs: [
            'equal',
            'customEqual'
        ]
    }
};
var modifiedAst = espower(jsAst, options);
```

To:

```javascript
var options = {
    patterns: [
        'yourAssert(value, [message])',
        'yourAssert.okay(value, [message])',
        'yourAssert.equal(actual, expected, [message])',
        'yourAssert.customEqual(actual, expected, [message])'
    ]
};
var modifiedAst = espower(jsAst, options);
```
