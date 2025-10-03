### [1.4.1](https://github.com/power-assert-js/power-assert-formatter/releases/tag/v1.4.1) (2016-07-05)


* introduce package-json-versionify to reduce content of package.json to be embedded into web bundle ([d97f00b](https://github.com/power-assert-js/power-assert-formatter/commit/d97f00b1288222f48580ee3fc09bec066a988f3c))
* update power-assert-runtime related packages ([6d622e1](https://github.com/power-assert-js/power-assert-formatter/commit/6d622e14bc4c05450f0e6740bcf1ca90c5e32d42))
  * [Use diff-match-patch instead of googlediff since googlediff manipulates this directly](https://github.com/twada/power-assert-runtime/pull/13)


## [1.4.0](https://github.com/power-assert-js/power-assert-formatter/releases/tag/v1.4.0) (2016-06-05)


#### Features

* [Extract core functionality to power-assert-runtime](https://github.com/power-assert-js/power-assert-formatter/pull/25)


### [1.3.2](https://github.com/power-assert-js/power-assert-formatter/releases/tag/v1.3.2) (2015-12-12)


#### Bug Fixes

* update acorn-es7-plugin to 1.0.10 and stop pinning of acorn version ([c9d2275](https://github.com/power-assert-js/power-assert-formatter/commit/c9d22757ea41b8e5ed6e39d910691094bbf0c1e4))


### [1.3.1](https://github.com/power-assert-js/power-assert-formatter/releases/tag/v1.3.1) (2015-11-12)


#### Bug Fixes

* pin acorn version to `<2.6.0` for now since `await` without enclosing `async` raises error ([3eacfad6](https://github.com/power-assert-js/power-assert-formatter/commit/3eacfad621897106a1eb18f93d753e5b5a09e26d))


## [1.3.0](https://github.com/power-assert-js/power-assert-formatter/releases/tag/v1.3.0) (2015-11-07)


#### Features

* [support async/await](https://github.com/power-assert-js/power-assert-formatter/pull/20) (by [@jamestalmage](https://github.com/jamestalmage))


## [1.2.0](https://github.com/power-assert-js/power-assert-formatter/releases/tag/v1.2.0) (2015-11-03)


#### Features

* [Support yield expressions](https://github.com/power-assert-js/power-assert-formatter/pull/19) (by [@jamestalmage](https://github.com/jamestalmage))


## [1.1.0](https://github.com/power-assert-js/power-assert-formatter/releases/tag/v1.1.0) (2015-09-14)


#### Bug Fixes

* fix location detection of infix operator ([f6e0d691](https://github.com/power-assert-js/power-assert-formatter/commit/f6e0d6919ee32045c18983c00d60011d0dc4a0d1))


#### Features

* expose built-in Renderer classes ([c19ee541](https://github.com/power-assert-js/power-assert-formatter/commit/c19ee5411fbe5bd8eed5be418252d8576aa75e0f))
* introduce new Renderer initialization style ([ee643548](https://github.com/power-assert-js/power-assert-formatter/commit/ee6435484143ae5fadae913608ff97df66ca8f23))


### [1.0.2](https://github.com/power-assert-js/power-assert-formatter/releases/tag/v1.0.2) (2015-08-25)


  * [Switch back to esprima again](https://github.com/power-assert-js/power-assert-formatter/pull/16)


### [1.0.1](https://github.com/power-assert-js/power-assert-formatter/releases/tag/v1.0.1) (2015-07-11)


  * update stringifier to 1.2.0 for native Symbol support ([3fdc077](https://github.com/power-assert-js/power-assert-formatter/commit/3fdc07764bc4967036df54555100d941cfdda9cd))
  * apply licensify on build ([79be7f4](https://github.com/power-assert-js/power-assert-formatter/commit/79be7f42387b19baaff368422b09f8d4365f798d))


## [1.0.0](https://github.com/power-assert-js/power-assert-formatter/releases/tag/v1.0.0) (2015-06-24)


#### Features

* The first stable release
* transfer to power-assert-js organization ([4f03887b](https://github.com/power-assert-js/power-assert-formatter/commit/4f03887b18b0b59fe594931b0621788a595a532f))
* [use ponyfills for older browsers](https://github.com/power-assert-js/power-assert-formatter/pull/15)


## [0.11.0](https://github.com/power-assert-js/power-assert-formatter/releases/tag/v0.11.0) (2015-04-18)


#### Features

* [ES6 support](https://github.com/power-assert-js/power-assert-formatter/pull/14)
* ship npm module with built bundle for browsers ([5c4afefb](https://github.com/power-assert-js/power-assert-formatter/commit/5c4afefb252dac5d52a2892ea54cedb59da66af0))


### [0.10.2](https://github.com/power-assert-js/power-assert-formatter/releases/tag/v0.10.2) (2015-02-16)


* **power-assert-formatter:**
  * update stringifier and type-name to 1.0.1 ([a44c428d](https://github.com/power-assert-js/power-assert-formatter/commit/a44c428d7aa541c819ae31b61a8979c8ae74e046))


### [0.10.1](https://github.com/power-assert-js/power-assert-formatter/releases/tag/v0.10.1) (2014-11-12)


* **power-assert-formatter:**
  * stop using inherits module directly since web shim is handled by browserify ([984becd6](https://github.com/power-assert-js/power-assert-formatter/commit/984becd6f08454babac80f99521a98841c23797a))


## [0.10.0](https://github.com/power-assert-js/power-assert-formatter/releases/tag/v0.10.0) (2014-11-11)


#### Features

* **new options**
  * [options.outputOffset](https://github.com/power-assert-js/power-assert-formatter#optionsoutputoffset)
  * [options.ambiguousEastAsianCharWidth](https://github.com/power-assert-js/power-assert-formatter#optionsambiguouseastasiancharwidth)
  * [options.diff](https://github.com/power-assert-js/power-assert-formatter#optionsdiff)

* **power-assert-formatter:**
  * make string diff function pluggable ([6571eaa3](https://github.com/power-assert-js/power-assert-formatter/commit/6571eaa34ce310d796fa8e2040143516db094527))
  * outputOffset option to configure number of spaces inserted at the left ([d646aa86](https://github.com/power-assert-js/power-assert-formatter/commit/d646aa86d9ed8952433a2ca6f903362754aa5a31))
  * set outputOffset default to 2 ([f05b411d](https://github.com/power-assert-js/power-assert-formatter/commit/f05b411ddb5123d15f5613714fec1b777403e853))
  * make ambiguous east asian character width configurable ([7e8c9328](https://github.com/power-assert-js/power-assert-formatter/commit/7e8c9328b1b62879c0ee0a86a495fa25f5c22865))
  * treat ambiguous east asian character as fullwidth (= 2) ([20ee139a](https://github.com/power-assert-js/power-assert-formatter/commit/20ee139a13677a043ce8c5982b8dae9d6ef6cb59))
  * use inherits module to reduce browserify build size ([26b62daf](https://github.com/power-assert-js/power-assert-formatter/commit/26b62daf7f46f2b47029013568407e6ca56631bb))
  * update object-keys ([9285c343](https://github.com/power-assert-js/power-assert-formatter/commit/9285c3430261513dad6283a4dd100acb4dd91925))
  * update estraverse and stringifier ([06f3748b](https://github.com/power-assert-js/power-assert-formatter/commit/06f3748b9995de035110a2e562f81fd1dc09c972))


## 0.9.0 (2014-09-02)


#### Features

* **power-assert-formatter:**
  * move built-in renderers to ./built-in/ ([acf85109](https://github.com/power-assert-js/power-assert-formatter/commit/acf85109bcb579109b80a36a8a6439c4e028066d))
  * customize rendering by using custom renderer constructor in `renderers` option ([265d3539](https://github.com/power-assert-js/power-assert-formatter/commit/265d353997f7321e9e24c5252c7aa0f4c696624a))
  * use EventEmitter to make renderers customizable ([7c190e11](https://github.com/power-assert-js/power-assert-formatter/commit/7c190e1170de8c96129a2ccd3e67fd9f14623732))


#### Breaking Changes

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


* **power-assert-formatter:**
  * [built and modularized by browserify](https://github.com/power-assert-js/power-assert-formatter/pull/8)
  * [use spun-off stringifier module](https://github.com/power-assert-js/power-assert-formatter/pull/9)


#### Breaking Changes

* option `stringifyDepth` does not supported any more. use `maxDepth` option instead.

If you already customize formatter config using `stringifyDepth`, you need to migarte. To migrate, change your code from the following:

```javascript
var createFormatter = require('power-assert-formatter');
var options = {
    stringifyDepth: 2
};
var formatter = createFormatter(options);
```

To:

```javascript
var createFormatter = require('power-assert-formatter');
var options = {
    maxDepth: 1
};
var formatter = createFormatter(options);
```

Beware that `stringifyDepth - 1 === maxDepth` !
