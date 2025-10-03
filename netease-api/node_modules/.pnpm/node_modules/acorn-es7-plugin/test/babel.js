'use strict';

try {
  // If this doesn't throw, then arrow functions are supported natively.
  // Do not require babel (for speed).
  eval('var x = () => {};');
} catch (e) {
  require('babel-core/register')({
    only: /test.js$/,
    presets: ['es2015']
  });
}

