[![power-assert][power-assert-banner]][power-assert-url]

[![Build Status][travis-image]][travis-url]
[![NPM version][npm-image]][npm-url]
[![License][license-image]][license-url]


Calculates width of given string. Treat ambiguous-width characters as fullwidth (= `2`) by default.


USAGE
---------------------------------------

```js
var stringWidth = require('power-assert-util-string-width');
stringWidth('abcde'); //=> 5
stringWidth('あいうえお'); //=> 10
stringWidth('ｱｲｳｴｵ'); //=> 5
stringWidth('※脚注');  //=> 6
// stringWidth.narrow treats ambiguous-width characters as narrow (= `1`)
stringWidth.narrow('※脚注');  //=> 5
```


INSTALL
---------------------------------------

```sh
$ npm install --save-dev power-assert-util-string-width
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

[npm-url]: https://npmjs.org/package/power-assert-util-string-width
[npm-image]: https://badge.fury.io/js/power-assert-util-string-width.svg

[license-url]: https://github.com/twada/power-assert-runtime/blob/master/LICENSE
[license-image]: https://img.shields.io/badge/license-MIT-brightgreen.svg
