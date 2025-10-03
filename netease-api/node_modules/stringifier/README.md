stringifier
================================

Yet another stringify function.

[![Build Status][travis-image]][travis-url]
[![NPM package][npm-image]][npm-url]
[![Bower package][bower-image]][bower-url]
[![License][license-image]][license-url]


DESCRIPTION
---------------------------------------

`stringifier` is a function like `JSON.stringify` but intended to be more customizable. For example,

- Max depth for recursive object tree traversal
- Per-type output customization
- Circular reference handling


Pull-requests, issue reports and patches are always welcomed. `stringifier` is a spin-off product of [power-assert](https://github.com/power-assert-js/power-assert) project.


API
---------------------------------------


### stringifier(options)

`require('stringifier')` exports single function `stringifier` that accepts `options` as optional parameters and returns configured function for stringify. This is the comprehensive usage.

```javascript
var stringifier = require('stringifier');
var stringify = stringifier(options);
console.log(stringify(anyVar));
```


### stringifier.stringify(val, options)

For more simplified usage, `stringifier` has a function `stringify`, that simply takes target object/value and returns stringified result string. `stringifier.stringify` accepts `options` as optional parameter too.

```javascript
var stringify = require('stringifier').stringify;
console.log(stringify(anyVar));
```


INSTALL
---------------------------------------

### via npm

Install

    $ npm install --save stringifier

Use

```javascript
var stringify = require('stringifier').stringify;
console.log(stringify(anyVar));
```

#### use stringifier npm module on browser

`stringifier` function is exported

    <script type="text/javascript" src="./path/to/node_modules/stringifier/build/stringifier.js"></script>


### via bower

Install

    $ bower install --save stringifier

Load (`stringifier` function is exported)

    <script type="text/javascript" src="./path/to/bower_components/stringifier/build/stringifier.js"></script>

Use

```javascript
console.log(stringifier.stringify(anyVar));
```


EXAMPLE
---------------------------------------

For given context,

```javascript
var stringifier = require('stringifier'),
    assert = require('assert');

function Student (name, age, gender) {
    this.name = name;
    this.age = age;
    this.gender = gender;
}

var AnonStudent = function(name, age, gender) {
    this.name = name;
    this.age = age;
    this.gender = gender;
};

var student = new Student('tom', 10, 'M');
var anonStudent = new AnonStudent('mary', 9, 'F');

var values = [
    'string', 
    [null, undefined],
    {
        primitives: [true, false, -5, 98.6],
        specific: {
            regex: /^not/,
            numbers: [NaN, Infinity, -Infinity]
        },
        userDefined: [
            student,
            anonStudent
        ]
    }
];
```


#### default single-line output

```javascript
var stringify = stringifier();
console.log(stringify(values));
```
result:

```javascript
["string",[null,undefined],Object{primitives:[true,false,-5,98.6],specific:Object{regex:/^not/,numbers:[NaN,Infinity,-Infinity]},userDefined:[Student{name:"tom",age:10,gender:"M"},@Anonymous{name:"mary",age:9,gender:"F"}]}]
```


#### pretty printing with indentation

Use `indent` option for pretty printing. Using four spaces for indentation in this case.

```javascript
var stringify = stringifier({indent: '    '});
console.log(stringify(values));
```

result:

```javascript
[
    "string",
    [
        null,
        undefined
    ],
    Object{
        primitives: [
            true,
            false,
            -5,
            98.6
        ],
        specific: Object{
            regex: /^not/,
            numbers: [
                NaN,
                Infinity,
                -Infinity
            ]
        },
        userDefined: [
            Student{
                name: "tom",
                age: 10,
                gender: "M"
            },
            @Anonymous{
                name: "mary",
                age: 9,
                gender: "F"
            }
        ]
    }
]
```


#### depth limitation

Use `maxDepth` option to stringify at most specified levels.

```javascript
var stringify = stringifier({maxDepth: 3, indent: '    '});
console.log(stringify(values));
```

result:

```javascript
[
    "string",
    [
        null,
        undefined
    ],
    Object{
        primitives: [
            true,
            false,
            -5,
            98.6
        ],
        specific: Object{
            regex: /^not/,
            numbers: #Array#
        },
        userDefined: [
            #Student#,
            #@Anonymous#
        ]
    }
]
```


#### anonymous class label

Use `anonymous` option to specify alternate type name for anonymous constructors.

```javascript
var stringify = stringifier({anonymous: 'ANON'});
assert(stringify(anonStudent) === 'ANON{name:"mary",age:9,gender:"F"}');
```


#### omit specific property from output

Customize `options.handlers`

```javascript
var stringify;

// property whitelist and reordering
stringify = stringifier({
    handlers: {
        'Student': s.object(null, ['gender', 'age'])
    }
});
assert(stringify(student) === 'Student{gender:"M",age:10}');

// blacklist by property name
stringify = stringifier({
    handlers: {
        'Student': s.object(function (kvp) {
            return ['age', 'gender'].indexOf(kvp.key) === -1;
        })
    }
});
assert(stringify(student) === 'Student{name:"tom"}');

// blacklist by property value
stringify = stringifier({
    handlers: {
        'Student': s.object(function (kvp) {
            return kvp.value !== 'M';
        })
    }
});
assert(stringify(student) === 'Student{name:"tom",age:10}');

// whitelist by property value
stringify = stringifier({
    handlers: {
        'Student': s.object(function (kvp) {
            return typeName(kvp.value) === 'string';
        })
    }
});
assert(stringify(student) === 'Student{name:"tom",gender:"M"}');
```


#### truncate property value

Return number from object predicate

```javascript
stringify = stringifier({
    handlers: {
        'Student': s.object(function (kvp) {
            if (kvp.key === 'name') {
                return 3;
            }
            return true;
        })
    }
});
assert(stringify(student) === 'Student{name:"to..(snip),age:10,gender:"M"}');
```



CONFIGURATION
---------------------------------------

### options


#### options.maxDepth
Type: `number`
Default value: `null`

Max depth for recursive Object tree traversal


#### options.indent
Type: `String`
Default value: `null`

string value for indentation.
If this value is not empty, stringified result may contain multiple lines.


#### options.lineSeparator
Type: `String`
Default value: `'\n'`

string value for line-separator.
Makes sense only if `options.indent` is not empty.


#### options.anonymous
Type: `String`
Default value: `'@Anonymous'`

Type name string alternative for displaying Object created by anonymous constructor


#### options.circular
Type: `String`
Default value: `'#@Circular#'`

Alternative string for displaying Circular reference


#### options.snip
Type: `String`
Default value: `'..(snip)'`

For displaying truncated string


#### options.handlers

`options.handlers` is a object where property names are type names (string, number, ...) and values are per-type stringify strategy functions. Various strategies are defined in `stringifier.strategies`, and default strategies are defined as follows.

```javascript
var s = require('./strategies');
function defaultHandlers () {
    return {
        'null': s.always('null'),
        'undefined': s.always('undefined'),
        'function': s.prune(),
        'string': s.json(),
        'boolean': s.json(),
        'number': s.number(),
        'symbol': s.toStr(),
        'RegExp': s.toStr(),
        'String': s.newLike(),
        'Boolean': s.newLike(),
        'Number': s.newLike(),
        'Date': s.newLike(),
        'Array': s.array(),
        'Object': s.object(),
        'Error': s.object(null, ['message', 'code']),
        '@default': s.object()
    };
}
```

If unknown type is detected, strategy function registered by `'@default'` key will be used.


### strategies

For given `Student` pseudo-class and a `stringifier`,

```javascript
var stringifier = require('stringifier'),
    s = stringifier.strategies,
    assert = require('assert'),

function Student (name, age, gender) {
    this.name = name;
    this.age = age;
    this.gender = gender;
}

var student = new Student('tom', 10, 'M');
```

#### always

`always` strategy always returns passed constant (In this case, `'foo'`).

```javascript
var stringify = stringifier({
    handlers: {
        'Student': s.always('foo')
    }
});
assert(stringify(student) === 'foo');
```

#### json

`json` strategy applies `JSON.stringify` to input value then return the result string.

```javascript
var stringify = stringifier({
    handlers: {
        'Student': s.json()
    }
});
assert(stringify(student) === '{"name":"tom","age":10,"gender":"M"}');
```

#### toStr

`toStr` strategy calls `toString()` to input value then return the result string.

```javascript
var stringify = stringifier({
    handlers: {
        'Student': s.toStr()
    }
});
assert(stringify(student) === '[object Object]');
```

#### prune

`prune` strategy does not serialize target value but returns target type name surrounded by `#`.

```javascript
var stringify = stringifier({
    handlers: {
        'Student': s.prune()
    }
});
assert(stringify(student) === '#Student#');
```

#### newLike

`newLike` strategy emulates "new constructor call pattern".

```javascript
var stringify = stringifier({
    handlers: {
        'Student': s.newLike()
    }
});
assert(stringify(student) === 'new Student({"name":"tom","age":10,"gender":"M"})');
```

#### object

`object` strategy stringifies target object recursively and decorate object literal-like syntax with its type name. `object` is a default strategy for objects, and any other unknown types.

```javascript
var stringify = stringifier({
    handlers: {
        'Student': s.object()
    }
});
assert(stringify(student) === 'Student{name:"tom",age:10,gender:"M"}');
```

#### array

`array` strategy is an array specific stringification strategy, and is a default strategy for arrays.

```javascript
var stringify = stringifier({
    handlers: {
        'Array': s.array()
    }
});
assert(stringify(['foo', 'bar', 'baz']) === '["foo","bar","baz"]');
```

#### number

`number` strategy is a number specific stringification strategy, and is a default strategy for number. `number` strategy also provides `NaN`,`Infinity` and `-Infinity` handling.

```javascript
var stringify = stringifier({
    handlers: {
        'Array': s.array(),
        'number': s.number()
    }
});
assert(stringify([NaN, 0, Infinity, -0, -Infinity]) === '[NaN,0,Infinity,0,-Infinity]');
```


AUTHOR
---------------------------------------
* [Takuto Wada](https://github.com/twada)


LICENSE
---------------------------------------
Licensed under the [MIT](https://twada.mit-license.org/2014-2018) license.


[travis-url]: https://travis-ci.org/twada/stringifier
[travis-image]: https://secure.travis-ci.org/twada/stringifier.svg?branch=master

[npm-url]: https://npmjs.org/package/stringifier
[npm-image]: https://badge.fury.io/js/stringifier.svg

[bower-url]: https://badge.fury.io/bo/stringifier
[bower-image]: https://badge.fury.io/bo/stringifier.svg

[license-url]: https://twada.mit-license.org/2014-2018
[license-image]: https://img.shields.io/badge/license-MIT-brightgreen.svg
