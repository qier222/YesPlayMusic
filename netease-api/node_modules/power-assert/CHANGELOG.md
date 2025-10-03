### [1.6.1](https://github.com/power-assert-js/power-assert/releases/tag/v1.6.1) (2018-09-08)


#### Bug Fixes

* update [empower to 1.3.1](https://github.com/power-assert-js/empower/pull/29) to work well with Jest 


## [1.6.0](https://github.com/power-assert-js/power-assert/releases/tag/v1.6.0) (2018-06-14)


#### Features

  * [Support ES2018 syntax](https://github.com/power-assert-js/power-assert/pull/109)


## [1.5.0](https://github.com/power-assert-js/power-assert/releases/tag/v1.5.0) (2018-03-30)


#### Features

  * [support "Strict mode" introduced in Node9](https://github.com/power-assert-js/power-assert/pull/104)


### [1.4.4](https://github.com/power-assert-js/power-assert/releases/tag/v1.4.4) (2017-06-10)


#### Bug Fixes

  * [Update empower to 1.2.3 for vanilla Node8 support](https://github.com/power-assert-js/power-assert/pull/90)


### [1.4.3](https://github.com/power-assert-js/power-assert/releases/tag/v1.4.3) (2017-06-04)


#### Bug Fixes

  * [Update empower to 1.2.2 for Node v8 support](https://github.com/power-assert-js/power-assert/pull/86)


### [1.4.2](https://github.com/power-assert-js/power-assert/releases/tag/v1.4.2) (2016-11-11)


#### Bug Fixes

  * [Fix deepStrictEqual usage to run with old Node (v0.12)](https://github.com/power-assert-js/power-assert/pull/71)


### [1.4.1](https://github.com/power-assert-js/power-assert/releases/tag/v1.4.1) (2016-05-10)

  * update [universal-deep-strict-equal](https://github.com/twada/universal-deep-strict-equal) to 1.2.1 ([70bc3fb9](https://github.com/power-assert-js/power-assert/commit/70bc3fb91eaee7271d7be111b3461a7dc3638045))


## [1.4.0](https://github.com/power-assert-js/power-assert/releases/tag/v1.4.0) (2016-05-06)


#### Features

  * [Integrate universal-deep-strict-equal to enable `deepStrictEqual` on browsers](https://github.com/power-assert-js/power-assert/pull/54)


### [1.3.1](https://github.com/power-assert-js/power-assert/releases/tag/v1.3.1) (2016-03-10)


#### Bug Fixes

  * [Access property `default` using bracket notation](https://github.com/power-assert-js/power-assert/pull/40) by [@LeshaKoss](https://github.com/LeshaKoss), since using dot notation to access the property `default` causes an error in Internet Explorer 8.


## [1.3.0](https://github.com/power-assert-js/power-assert/releases/tag/v1.3.0) (2016-03-09)


#### Features

  * Module style interop. [Support standard style definitions of transpirable es6 modules](https://github.com/power-assert-js/power-assert/pull/37) by [@falsandtru](https://github.com/falsandtru)

  refs: [Babel and CommonJS modules](http://www.2ality.com/2015/12/babel-commonjs.html)


## [1.2.0](https://github.com/power-assert-js/power-assert/releases/tag/v1.2.0) (2015-11-14)


#### Features

  * [support async/await](https://github.com/power-assert-js/power-assert-formatter/pull/20) (by [@jamestalmage](https://github.com/jamestalmage))
  * [support yield expressions](https://github.com/power-assert-js/power-assert-formatter/pull/19) (by [@jamestalmage](https://github.com/jamestalmage))


## [1.1.0](https://github.com/power-assert-js/power-assert/releases/tag/v1.1.0) (2015-10-04)


#### Features

  * [Support `import from` syntax of ES6 module](https://github.com/power-assert-js/power-assert/pull/28) by [@falsandtru](https://github.com/falsandtru)


### [1.0.1](https://github.com/power-assert-js/power-assert/releases/tag/v1.0.1) (2015-09-14)


#### Bug Fixes

  * update empower and power-assert-formatter ([f118c4f](https://github.com/power-assert-js/power-assert/commit/f118c4f74a130a4adfd8014a10a707ac36381289)) to [fix location detection of infix operator](https://github.com/power-assert-js/power-assert-formatter/commit/f6e0d6919ee32045c18983c00d60011d0dc4a0d1)


## [1.0.0](https://github.com/power-assert-js/power-assert/releases/tag/v1.0.0) (2015-08-26)


#### Bug Fixes

  * upgrade power-assert-formatter for native ES6 Symbol support ([d8ba0a1b](https://github.com/power-assert-js/power-assert/commit/d8ba0a1bb6809fecd4900af6ade1213ad58f5db0))


#### Features

  * transfer to power-assert-js organization ([64b2fe2e](https://github.com/power-assert-js/power-assert/commit/64b2fe2ea510ba06088d2f07531370af63f195e2))
  * [official logo!](https://github.com/power-assert-js/power-assert-js-logo)


## [0.11.0](https://github.com/power-assert-js/power-assert/releases/tag/v0.11.0) (2015-04-18)


#### Features

* [ES6 support](https://github.com/power-assert-js/power-assert/pull/17)


### [0.10.2](https://github.com/power-assert-js/power-assert/releases/tag/v0.10.2) (2015-02-16)


#### Bug Fixes

* **power-assert:**
  * update power-assert-formatter to 0.10.2 ([2c0f9624](https://github.com/power-assert-js/power-assert/commit/2c0f962415d60e59affb8f009ae4822f7b503c92)) to apply [stringifier fix]([67a9fa72](https://github.com/twada/stringifier/commit/67a9fa725c7602f948772f4f5f5a74806809ee34))


#### Features

* **power-assert:**
  * ship npm module with built bundle for browsers ([431769f3](https://github.com/power-assert-js/power-assert/commit/431769f3d5da68c279ebf59b0cfd1231fa385361))
  * add Node 0.12 and io.js to Travis build ([dd9629f9](https://github.com/power-assert-js/power-assert/commit/dd9629f96f3a204f6c24156f648b172f7c6abd4c))


### [0.10.1](https://github.com/power-assert-js/power-assert/releases/tag/v0.10.1) (2015-01-09)


#### Bug Fixes

* **power-assert:**
  * apply [assert.deepEqual fix](https://github.com/substack/node-browserify/pull/1041) in browserify 8.1.0 ([96302406](https://github.com/power-assert-js/power-assert/commit/963024062e6c144f2d5487d788e883f418a9c746))
  * apply [dereserve](https://github.com/twada/dereserve) to browser build


## [0.10.0](https://github.com/power-assert-js/power-assert/releases/tag/v0.10.0) (2014-11-12)


#### Features

* **power-assert:**
  * [provide API for customization](https://github.com/power-assert-js/power-assert/pull/14) (see [CUSTOMIZATION API](https://github.com/power-assert-js/power-assert#customization-api))

* **power-assert-formatter:**
  * [diff option to make string diff function pluggable](https://github.com/power-assert-js/power-assert-formatter/pull/11) (new option [options.diff](https://github.com/power-assert-js/power-assert-formatter#optionsdiff))
  * [outputOffset option to configure number of spaces inserted at the left](https://github.com/power-assert-js/power-assert-formatter/pull/12) (new option [options.outputOffset](https://github.com/power-assert-js/power-assert-formatter#optionsoutputoffset))
  * [ambiguousEastAsianCharWidth option to make ambiguous east asian character width configurable](https://github.com/power-assert-js/power-assert-formatter/pull/13) (new option [options.ambiguousEastAsianCharWidth](https://github.com/power-assert-js/power-assert-formatter#optionsambiguouseastasiancharwidth))

* **espowerify:**
  * [transform file if and only if it is listed in browserify entries](https://github.com/power-assert-js/espowerify/pull/5)


### 0.9.1 (2014-10-08)


#### Bug Fixes

* **empower:**
  * power-assert output doesn't appear in Node 0.11.x ([53e882e0](https://github.com/power-assert-js/empower/commit/53e882e00ad3dd8b45f262ab14ac782ed582b954))


## 0.9.0 (2014-09-02)


#### Features

Now power-assert 0.9.0 supports multi-stage sourcemaps.

* **power-assert:**
  * update empower and power-assert-formatter to 0.9.0 ([a84ca4e1](https://github.com/power-assert-js/power-assert/commit/a84ca4e1e67e6146452622743915bd78a5f417d0))

* **empower:**
  * There's no significant changes

* **power-assert-formatter:**
  * [Customizable Renderers](https://github.com/power-assert-js/power-assert-formatter/pull/10)
  * move built-in renderers to ./built-in/ ([acf85109](https://github.com/power-assert-js/power-assert-formatter/commit/acf85109bcb579109b80a36a8a6439c4e028066d))
  * customize rendering by using custom renderer constructor in `renderers` option ([265d3539](https://github.com/power-assert-js/power-assert-formatter/commit/265d353997f7321e9e24c5252c7aa0f4c696624a))
  * use EventEmitter to make renderers customizable ([7c190e11](https://github.com/power-assert-js/power-assert-formatter/commit/7c190e1170de8c96129a2ccd3e67fd9f14623732))

* **espower:**
  * [SourceMap support](https://github.com/power-assert-js/espower/pull/11)
  * adjust filepath in power-assert output if sourceMap option is given ([f919d59d](https://github.com/power-assert-js/espower/commit/f919d59d6eea764881e0266f562724b7142f7695))
  * adjust line number in power-assert output if sourceMap option is given ([8c035d89](https://github.com/power-assert-js/espower/commit/8c035d89ae88c8554cb8ca0b6bd0f7d6fe2008b0))

* **espower-source:**
  * backport espowerify to support multi-stage sourcemaps ([71de737c](https://github.com/power-assert-js/espower-source/commit/71de737cb16231db852a44592e896a43c447298b))

* **espower-loader:**
  * use espower-source 0.9.0 ([c5329f39](https://github.com/power-assert-js/espower-loader/commit/c5329f397d4ab8e434a1788d0fa1c2eb7670a25c))

* **grunt-espower:**
  * [support multistage sourcemap by @vvakame](https://github.com/power-assert-js/grunt-espower/pull/2)
  * Thanks @vvakame for the great contribution!

* **gulp-espower:**
  * [support gulp-sourcemaps](https://github.com/power-assert-js/gulp-espower/pull/2)

* **espowerify:**
  * use espower-source directly since espower-source 0.9.0 is backported from espowerify ([625cf55d](https://github.com/power-assert-js/espowerify/commit/625cf55d5b73893f4babd00c07489590ef786be0))
  * use multi-stage-sourcemap module to generate more accurate sourcemaps ([b1f939fa](https://github.com/power-assert-js/espowerify/commit/b1f939faa84be7f4fde82313b2257042b336d25c))
  * if upstream SourceMap is given, decode and offset it ([a1683475](https://github.com/power-assert-js/espowerify/commit/a1683475a588b0a5b0aee040f23dfb04ad902b11))

* **espower-coffee:**
  * interact with coffeescript compiler to adjust line number in power-assert output ([9c159205](https://github.com/power-assert-js/espower-coffee/commit/9c159205608e6a556f61167d1fb65123ae2421ab))


#### Breaking Changes

**No change is required if you are using default configuration.**

* **power-assert-formatter:**
  * built-in renderers are listed as relative path

If you are customizing renderers by `options.renderers`, you may have to migrate.

To migrate, change your code from the following:

```
[
    'file',
    'assertion',
    'diagram',
    'binary-expression'
]
```

To:

```
 [
    './built-in/file',
    './built-in/assertion',
    './built-in/diagram',
    './built-in/binary-expression'
 ]
```

 ([265d3539](https://github.com/power-assert-js/power-assert-formatter/commit/265d353997f7321e9e24c5252c7aa0f4c696624a)), ([acf85109](https://github.com/power-assert-js/power-assert-formatter/commit/acf85109bcb579109b80a36a8a6439c4e028066d))


## 0.8.0 (2014-08-12)


#### Features

* **power-assert:**
  * use single index.js ([e8fa666a](https://github.com/power-assert-js/power-assert/commit/e8fa666aa8197747ae56ca1a55fb171d30d7534c))
  * update empower and power-assert-formatter to 0.8.0 ([8f760aa0](https://github.com/power-assert-js/power-assert/commit/8f760aa07271f3bcd52576dc503f3d301d67110c))

* **empower:**
  * [built and modularized by browserify](https://github.com/power-assert-js/empower/pull/12)
  * use `escallmatch` module to describe target patterns ([533a21a0](https://github.com/power-assert-js/empower/commit/533a21a0374f23f5ca4e198c17d1e20f10d705fa))
  * support assertion methods with three or more arguments ([d31dca86](https://github.com/power-assert-js/empower/commit/d31dca86de2b05ee88ca5df15579308368657d43))
  * if not in patterns, do not empower assertion function itself ([1d73a756](https://github.com/power-assert-js/empower/commit/1d73a7560ef586a45a0a9259e57c143b3b60caaa))
  * option `targetMethods` does not required any more ([8ffcc49f](https://github.com/power-assert-js/empower/commit/8ffcc49fcdb5523eb38e63a0e7cca34f752d9302))
  * rename `saveContextOnFail` option to `saveContextOnRethrow` ([1f6133b2](https://github.com/power-assert-js/empower/commit/1f6133b24be672f32cfd3b66522a7d14ca5d22e1))
  * rename `modifyMessageOnFail` option to `modifyMessageOnRethrow` ([0c8a88f0](https://github.com/power-assert-js/empower/commit/0c8a88f0592917ba15ac0c1bf21c8f39f39ab350))

* **power-assert-formatter:**
  * [built and modularized by browserify](https://github.com/power-assert-js/power-assert-formatter/pull/8)
  * [use spun-off stringifier module](https://github.com/power-assert-js/power-assert-formatter/pull/9)

* **espower:**
  * [built and modularized by browserify](https://github.com/power-assert-js/espower/pull/9)
  * [use escallmatch module to describe instrumentation target patterns](https://github.com/power-assert-js/espower/pull/10)
  * support chained callee like `browser.assert.element(selector)` ([ea0a3ce9](https://github.com/power-assert-js/espower/commit/ea0a3ce96f56034ab6735365184e1e397f6561c0))

* **espower-source:**
  * update espower to 0.8.0 ([ae15a229](https://github.com/power-assert-js/espower-source/commit/ae15a229367c65a7a590104f3fb0fc0b2a7582d0))
  * simple xtend would be better for options handling ([6bea0a92](https://github.com/power-assert-js/espower-source/commit/6bea0a9241aba71f2dcae9c285561e68d91531bb))

* **espower-loader:**
  * update espower-source to 0.8.0 ([54c2143b](https://github.com/power-assert-js/espower-loader/commit/54c2143bba3966aaf61f1a4d331f3543257f9222))

* **grunt-espower:**
  * update espower-source to 0.8.0 ([55110fa4](https://github.com/power-assert-js/grunt-espower/commit/55110fa4bffab62045d207d0460eaa864cc9fa8e))

* **gulp-espower:**
  * update espower-source to 0.8.0 ([a9ab1f7d](https://github.com/power-assert-js/gulp-espower/commit/a9ab1f7de7275b717589bd8eb8048b89bc575763))
  * now supports streams as well ([ada19f90](https://github.com/power-assert-js/gulp-espower/commit/ada19f90f0dfc674405342310259e31ddd3a6dd0))

* **espowerify:**
  * update espower-source to 0.8.0 ([026bd0c6](https://github.com/power-assert-js/espowerify/commit/026bd0c6e2d1200084051612dc262ab5509a5652))

* **espower-coffee:**
  * update espower-source to 0.8.0 ([8702d847](https://github.com/power-assert-js/espower-coffee/commit/8702d84704d659919e96801014c4653539b7b3f0))
  * [now in beta stage](https://github.com/power-assert-js/espower-coffee/commit/a357b3d35460b9abd17517375d737a8a0bce98dd)


#### Breaking Changes

First of all, **No change is required if you are using default configuration.**

* **instrumentors:**

  Version 0.8.0 introduces [escallmatch](https://github.com/twada/escallmatch) syntax for configuration.
  
  If you are:
    * using instrumentors such as `espower-loader`, `grunt-espower`, `gulp-espower`, `espowerify` and `espower-coffee`
    * or using `espower-source` or `espower` directly

  And

    * having custom instrumentation pattern using `powerAssertVariableName` or `targetMethods` property
  
  Then you need to migarte. To migrate, please see CHANGELOG for the instrumentor you choose.

  * [espower-loader CHANGELOG](https://github.com/power-assert-js/espower-loader/blob/master/CHANGELOG.md)
  * [grunt-espower CHANGELOG](https://github.com/power-assert-js/grunt-espower/blob/master/CHANGELOG.md)
  * [gulp-espower CHANGELOG](https://github.com/power-assert-js/gulp-espower/blob/master/CHANGELOG.md)
  * [espowerify CHANGELOG](https://github.com/power-assert-js/espowerify/blob/master/CHANGELOG.md)
  * [espower-coffee CHANGELOG](https://github.com/power-assert-js/espower-coffee/blob/master/CHANGELOG.md)
  * [espower-source CHANGELOG](https://github.com/power-assert-js/espower-source/blob/master/CHANGELOG.md)
  * [espower CHANGELOG](https://github.com/power-assert-js/espower/blob/master/CHANGELOG.md)


* **empower:**
  * `saveContextOnFail` option is renamed to `saveContextOnRethrow`
  * `modifyMessageOnFail` option is renamed to `modifyMessageOnRethrow`
  * option `targetMethods` does not required any more
  * Please see [empower CHANGELOG](https://github.com/power-assert-js/empower/blob/master/CHANGELOG.md) for more details.

* **power-assert-formatter:**
  * option `stringifyDepth` does not supported any more. use `maxDepth` option instead.
  * Please see [power-assert-formatter CHANGELOG](https://github.com/power-assert-js/power-assert-formatter/blob/master/CHANGELOG.md) for more details.
