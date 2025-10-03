merge-estraverse-visitors
================================

Merge multiple visitors for estraverse into one

[![Build Status][travis-image]][travis-url]
[![NPM version][npm-image]][npm-url]
[![License][license-image]][license-url]


API
---------------------------------------

`var mergedVisitor = mergeVisitors(arrayOfVisitors)`


INSTALL
---------------------------------------

```
npm install merge-estraverse-visitors
```


USAGE
---------------------------------------

For given code,

```js
function tenTimes (cb) {
    for (var i = 0; i < 10; i += 1) {
        cb();
    }
}
```

Merge multiple estraverse visitors into one then run against target AST.

```js
var visitor1 = {
    enter: function (currentNode, parentNode) {
        switch(currentNode.type) {
        case 'ForStatement':
            console.log('v1: going to skip ' + currentNode.type);
            this.skip();
            break;
        case 'CallExpression':
        case 'FunctionDeclaration':
            console.log('v1: entering ' + currentNode.type);
            break;
        }
        return undefined;
    },
    leave: function (currentNode, parentNode) {
        switch(currentNode.type) {
        case 'ForStatement':
        case 'CallExpression':
        case 'FunctionDeclaration':
            console.log('v1: leaving ' + currentNode.type);
            break;
        }
    }
};

var visitor2 = {
    enter: function (currentNode, parentNode) {
        switch(currentNode.type) {
        case 'ForStatement':
        case 'CallExpression':
        case 'FunctionDeclaration':
            console.log('v2: entering ' + currentNode.type);
            break;
        }
    },
    leave: function (currentNode, parentNode) {
        switch(currentNode.type) {
        case 'ForStatement':
        case 'CallExpression':
        case 'FunctionDeclaration':
            console.log('v2: leaving ' + currentNode.type);
            break;
        }
    }
};

var mergeVisitors = require('merge-estraverse-visitors');
var estraverse = require('estraverse');
var acorn = require('acorn');
var ast = acorn.parse(code);
estraverse.traverse(ast, mergeVisitors([ visitor1, visitor2 ]));
```

Results in:

```
v1: entering FunctionDeclaration
v2: entering FunctionDeclaration
v1: going to skip ForStatement
v2: entering ForStatement
v2: entering CallExpression
v2: leaving CallExpression
v2: leaving ForStatement
v1: leaving ForStatement
v2: leaving FunctionDeclaration
v1: leaving FunctionDeclaration
```


AUTHOR
---------------------------------------
* [Takuto Wada](https://github.com/twada)


LICENSE
---------------------------------------
Licensed under the [MIT](http://twada.mit-license.org/) license.


[travis-url]: https://travis-ci.org/twada/merge-estraverse-visitors
[travis-image]: https://secure.travis-ci.org/twada/merge-estraverse-visitors.svg?branch=master

[npm-url]: https://npmjs.org/package/merge-estraverse-visitors
[npm-image]: https://badge.fury.io/js/merge-estraverse-visitors.svg

[license-url]: http://twada.mit-license.org/
[license-image]: https://img.shields.io/badge/license-MIT-brightgreen.svg
