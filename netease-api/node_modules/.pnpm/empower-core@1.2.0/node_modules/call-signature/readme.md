# call-signature [![Build Status](https://travis-ci.org/jamestalmage/call-signature.svg?branch=master)](https://travis-ci.org/jamestalmage/call-signature)

> Parse / Generate Method Signatures


## Install

```
$ npm install --save call-signature
```


## Usage

```js
var signature = require('call-signature');

// parse a call signature definition
var parsed = signature.parse('t.equal(expected, actual, [message])');

console.log(parsed);
/* =>  
       {
         callee: {
           type: 'MemberExpression',
           object: 't',
           member: 'equal'
         },
         args: [
           {
             name: 'actual',
             optional: false
           },
           {
             name: 'expected',
             optional: false
           },
           {
             name: 'message',
             optional: true
           }
         ]
       }
*/


// Create signature definitions from the parsed object.
signature.generate(parsed);

//=> "t.equal(expected, actual, [message])"
```


## API

### callSignature.parse(input)

#### input

Type: `string`

A string that matches the call signature spec:

`object.member(required_arg1, required_arg2, [optional_arg1])`
`name(required_arg1, required_arg2, [optional_arg1])`

`object`, `member` and `name` can be any identifiers, but currently the callee must be a `MemberExpression` or an `Identifier` (that requirement may loosen in the future).
 
You can have any number of arguments. Optional arguments are denoted by placing the argument name between square `[`brackets`]`.

#### returns

A simple JS Object with three properties `callee` and `args`.

`callee` will be an object containing `type` property and its corresponding properties.

when matched against `MemberExpression` like `foo.bar(baz)`, `object` and `member` will be strings.

    callee: {
      type: 'MemberExpression',
      object: 'foo',
      member: 'bar'
    }

when matched against `Identifier` like `foo(baz)`, `name` will be string.

    callee: {
      type: 'Identifier',
      name: 'foo'
    }

`args` will be an array. Each item of the array will have two properties `name`, and `optional`. 
 `name` will be the `string` name of the arg. `optional` will be a boolean value.

### callSignature.generate(parsed)

#### input

Type: `Object`

Must have the same definition as the return value from the `parse` method.

#### returns

A `string` signature definition that will parse to exactly the provided input.

## Related

- [escallmatch](https://www.npmjs.com/package/escallmatch) - Similar, with compatible string definitions to this library. Can be used to match AST Nodes to parsed signatures.

## License

MIT © [James Talmage](http://github.com/jamestalmage)
