# multi-stage-sourcemap 

multi-level source map 

## Installation

``` sh
npm install multi-stage-sourcemap
```

## Concept

Example Process

```
A.js -> B.js     -> C.js
        B.js.map -> C.js.map
```

`multi-stage-sourcemap` can mapping `C.js` to `A.js`
 
```
C.js -> ... -> A.js
```

Code:

``` js
var transfer = require("multi-stage-sourcemap").transfer;
var cToAMap = transfer({fromSourceMap: cMap, toSourceMap: bMap})
```

## Usage

### `transfer`

Return the re-mapped `rawSourceMap` string.

The only argument is an object with the following properties:

- `fromSourceMap` : String - rawSourceMap
- `toSourceMap` : String - rawSourceMap

`rawSourceMap` is like below object.

``` js
var rawSourceMap = {
  version: 3,
  file: 'min.js',
  names: ['bar', 'baz', 'n'],
  sources: ['one.js', 'two.js'],
  sourceRoot: 'http://example.com/www/js/',
  mappings: 'CAAC,IAAI,IAAM,SAAUA,GAClB,OAAOC,IAAID;CCDb,IAAI,IAAM,SAAUE,GAClB,OAAOA'
};
```

* [mozilla/source-map](https://github.com/mozilla/source-map/#sourcemapconsumer "mozilla/source-map")

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT