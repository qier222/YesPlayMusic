'use strict';

module.exports = {
  pkg: {
    patches: {
      // author is mistaken to point package.json.main to
      // src/index.js (that is es6) instead of dist/index.js (es5)
      'src/index.js': [{ do: 'erase' }, ''],
    },
  },
};
