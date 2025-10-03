espurify
================================

Clone new AST without extra properties

[![Build Status](https://travis-ci.org/estools/espurify.svg?branch=master)](https://travis-ci.org/estools/espurify)
[![NPM version](https://badge.fury.io/js/espurify.svg)](https://badge.fury.io/js/espurify)
[![License](https://img.shields.io/badge/license-MIT-brightgreen.svg)](https://github.com/estools/espurify/blob/master/MIT-LICENSE.txt)
[![Code Style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg)](https://github.com/Flet/semistandard)


API
---------------------------------------

### var purifiedAstClone = espurify(originalAst)

Returns new clone of `originalAst` but without extra properties.

Leaves properties defined in [The ESTree Spec](https://github.com/estree/estree) (formerly known as [Mozilla SpiderMonkey Parser API](https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API)) only. Also note that extra informations (such as `loc`, `range` and `raw`) are eliminated too.

`espurify` supports [ES5](https://github.com/estree/estree/blob/master/es5.md), [ES2015](https://github.com/estree/estree/blob/master/es2015.md), and [ES2017](https://github.com/estree/estree/blob/master/es2017.md) properties.


### var customizedCloneFunctionWithWhiteList = espurify.cloneWithWhitelist(whiteList)

Returns customized function for cloning AST, with user-provided `whiteList`.


### var purifiedAstClone = customizedCloneFunctionWithWhiteList(originalAst)

Returns new clone of `originalAst` by customized function.


#### whiteList

| type     | default value |
|:---------|:--------------|
| `object` | N/A           |

`whiteList` is an object containing NodeType as keys and properties as values.

```js
{
    ArrayExpression: ['type', 'elements'],
    ArrayPattern: ['type', 'elements'],
    ArrowFunctionExpression: ['type', 'id', 'params', 'body', 'generator', 'expression'],
    AssignmentExpression: ['type', 'operator', 'left', 'right'],
    ...
```


### var customizedCloneFunction = espurify.customize(options)

Returns customized function for cloning AST, configured by custom `options`.


### var purifiedAstClone = customizedCloneFunction(originalAst)

Returns new clone of `originalAst` by customized function.



#### options

| type     | default value |
|:---------|:--------------|
| `object` | `{}`          |

Configuration options. If not passed, default options will be used.


#### options.extra

| type                | default value |
|:--------------------|:--------------|
| `array` of `string` | null          |

List of extra properties to be left in result AST. For example, functions returned by `espurify.customize({extra: ['raw']})` will preserve `raw` properties of `Literal`. Functions return by `espurify.customize({extra: ['loc', 'range']})` will preserve `loc` and `range` properties of each Node.


EXAMPLE
---------------------------------------

```javascript
var espurify = require('espurify'),
    estraverse = require('estraverse'),
    esprima = require('esprima'),
    syntax = estraverse.Syntax,
    assert = require('assert');

var jsCode = 'assert("foo")';

// Adding extra informations to AST
var originalAst = esprima.parse(jsCode, {tolerant: true, loc: true, raw: true});
estraverse.replace(originalAst, {
    leave: function (currentNode, parentNode) {
        if (currentNode.type === syntax.Literal && typeof currentNode.raw !== 'undefined') {
            currentNode['x-verbatim-bar'] = {
                content : currentNode.raw,
                precedence : 18  // escodegen.Precedence.Primary
            };
            return currentNode;
        } else {
            return undefined;
        }
    }
});


// purify AST
var purifiedClone = espurify(originalAst);


// original AST is not modified
assert.deepEqual(originalAst, {
  type: 'Program',
  body: [
    {
      type: 'ExpressionStatement',
      expression: {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'assert',
          loc: {
            start: {
              line: 1,
              column: 0
            },
            end: {
              line: 1,
              column: 6
            }
          }
        },
        arguments: [
          {
            type: 'Literal',
            value: 'foo',
            raw: '"foo"',
            loc: {
              start: {
                line: 1,
                column: 7
              },
              end: {
                line: 1,
                column: 12
              }
            },
            "x-verbatim-bar": {
              content: '"foo"',
              precedence: 18
            }
          }
        ],
        loc: {
          start: {
            line: 1,
            column: 0
          },
          end: {
            line: 1,
            column: 13
          }
        }
      },
      loc: {
        start: {
          line: 1,
          column: 0
        },
        end: {
          line: 1,
          column: 13
        }
      }
    }
  ],
  loc: {
    start: {
      line: 1,
      column: 0
    },
    end: {
      line: 1,
      column: 13
    }
  },
  errors: []
});


// Extra properties are eliminated from cloned AST
assert.deepEqual(purifiedClone, {
    type: 'Program',
    body: [
        {
            type: 'ExpressionStatement',
            expression: {
                type: 'CallExpression',
                callee: {
                    type: 'Identifier',
                    name: 'assert'
                },
                arguments: [
                    {
                        type: 'Literal',
                        value: 'foo'
                    }
                ]
            }
        }
    ]
});
```


INSTALL
---------------------------------------

### via npm

Install

    $ npm install --save espurify

Use

```javascript
var espurify = require('espurify');
```

#### use espurify module on browser

`espurify` function is exported

    <script type="text/javascript" src="./path/to/node_modules/espurify/build/espurify.js"></script>


### via bower

Install

    $ bower install --save espurify

Load (`espurify` function is exported)

    <script type="text/javascript" src="./path/to/bower_components/espurify/build/espurify.js"></script>



AUTHOR
---------------------------------------
* [Takuto Wada](https://github.com/twada)


LICENSE
---------------------------------------
Licensed under the [MIT](https://github.com/estools/espurify/blob/master/MIT-LICENSE.txt) license.
