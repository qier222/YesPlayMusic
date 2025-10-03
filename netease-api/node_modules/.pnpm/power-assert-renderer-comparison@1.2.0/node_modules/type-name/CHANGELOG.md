### [2.0.2](https://github.com/twada/type-name/releases/tag/v2.0.2) (2016-07-27)


#### Bug Fixes

  * [Fix crash when called with an es6 anonymous class instance](https://github.com/twada/type-name/pull/11) (by [@inversion](https://github.com/inversion))


### [2.0.1](https://github.com/twada/type-name/releases/tag/v2.0.1) (2016-03-20)


  * reduce package size (by [@dawsonbotsford](https://github.com/dawsonbotsford))


## [2.0.0](https://github.com/twada/type-name/releases/tag/v2.0.0) (2016-01-06)


#### Features

  * [return the actual Error constructor name](https://github.com/twada/type-name/pull/5), closes [#4](https://github.com/twada/type-name/issues/4) (by [@kgryte](https://github.com/kgryte))


#### Breaking Changes

  * `typeName(error)` returns actual error constructor name, not just `'Error'` ([c857cea3](https://github.com/twada/type-name/commit/c857cea3d79523105f3aa14552df8bd3267a88cb))

before:
```js
typeName(new TypeError('type error!')) // => 'Error'
```

after 2.0.0:
```js
typeName(new TypeError('type error!')) // => 'TypeError'
```

  * component is no longer supported ([e6f17109](https://github.com/twada/type-name/commit/e6f17109b6aece2e6f535d2918794fd9094628f8))


## [1.1.0](https://github.com/twada/type-name/releases/tag/v1.1.0) (2015-10-18)


#### Features

  * ship bundle for browsers with npm module ([6f4eed8c](https://github.com/twada/type-name/commit/6f4eed8c2305b828c51c4dc655a6044047ace0da))


### [1.0.1](https://github.com/twada/type-name/releases/tag/v1.0.1) (2014-12-16)


#### Bug Fixes

  * [check constructor existence](https://github.com/twada/type-name/pull/3) (by [@yosuke-furukawa](https://github.com/yosuke-furukawa))


## [1.0.0](https://github.com/twada/type-name/releases/tag/v1.0.0) (2014-06-24)


#### Features

  * The first stable release
