/**
Check if `value` is a ES2015 promise.

@param value - Value to be checked.

@example
```
import isPromise = require('p-is-promise');

isPromise(Promise.resolve('🦄'));
//=> true
```
*/
declare function pIsPromise(value: unknown): value is Promise<unknown>;

export = pIsPromise;
