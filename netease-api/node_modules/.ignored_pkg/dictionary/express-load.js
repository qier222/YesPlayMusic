'use strict';

module.exports = {
  pkg: {
    patches: {
      'lib/express-load.js': [
        'entity = path.resolve(',
        'entity = process.pkg.path.resolve(',
      ],
    },
  },
};
