## [1.4.0](https://github.com/twada/stringifier/releases/tag/v1.4.0) (2018-08-23)


#### Features

* prop name whitelist now works with non-enumerable properties like Error's ([fcb518ef](https://github.com/twada/stringifier/commit/fcb518eff7a20a8dba98ff3356eb8edbb30a093a))


## [1.3.0](https://github.com/twada/stringifier/releases/tag/v1.3.0) (2016-05-25)


#### Features

* [Consolidate ponyfills into core-js](https://github.com/twada/stringifier/pull/6)


### [1.2.1](https://github.com/twada/stringifier/releases/tag/v1.2.1) (2015-10-26)


#### Bug Fixes

* **stringifier:**
  * [stringify sparse arrays correctly](https://github.com/twada/stringifier/pull/5)


## [1.2.0](https://github.com/twada/stringifier/releases/tag/v1.2.0) (2015-07-10)


#### Features

* **stringifier:** 
  * [support native ES6 Symbol](https://github.com/twada/stringifier/pull/3)


## [1.1.0](https://github.com/twada/stringifier/releases/tag/v1.1.0) (2015-04-27)


#### Features

* **stringifier:**
  * use ponyfills for older browsers ([ea4e3f67](https://github.com/twada/stringifier/commit/ea4e3f673592fce8c57b49362100dc888038024e))
  * ship npm module with built bundle for browsers ([afdbd850](https://github.com/twada/stringifier/commit/afdbd850de3be0e5d40d3b574b4c0940ce2b5144))


### [1.0.1](https://github.com/twada/stringifier/releases/tag/v1.0.1) (2015-02-14)


#### Bug Fixes

* **stringifier:** introduce safeKey filter to skip unsafe property access ([67a9fa72](https://github.com/twada/stringifier/commit/67a9fa725c7602f948772f4f5f5a74806809ee34))


## [1.0.0](https://github.com/twada/stringifier/releases/tag/v1.0.0) (2014-11-09)


#### Features

* **stringifier:** absorb `handlers` argument into `options.handlers` ([0b073f53](https://github.com/twada/stringifier/commit/0b073f535eb0e99e97938c6101d8d2086f53a1df))


#### Breaking Changes

* Now `handlers` are moved to `options.handlers`. `handlers` argument is no more.

- changed `stringifier(options, handlers)` to `stringifier(options)`
- changed `stringifier.stringify(val, options, handlers)` to `stringifier.stringify(val, options)`

To migrate, change your code from the following:

```
var stringifier = require('stringifier');
var stringify = stringifier(options, handlers);
console.log(stringify(anyVar));
```

To:

```
var stringifier = require('stringifier');
options.handlers = handlers;
var stringify = stringifier(options);
console.log(stringify(anyVar));
```

And

```
var stringify = require('stringifier').stringify;
console.log(stringify(anyVar, options, handlers));
```

To:

```
var stringify = require('stringifier').stringify;
options.handlers = handlers;
console.log(stringify(anyVar, options));
```

 ([0b073f53](https://github.com/twada/stringifier/commit/0b073f535eb0e99e97938c6101d8d2086f53a1df))


### [0.1.2](https://github.com/twada/stringifier/releases/tag/v0.1.2) (2014-10-27)


#### Bug Fixes

* **stringifier:** do not truncate if string length is short enough ([2d22e44e](https://github.com/twada/stringifier/commit/2d22e44e15ea8c3eb5aae70dc6067de9b1878115))


