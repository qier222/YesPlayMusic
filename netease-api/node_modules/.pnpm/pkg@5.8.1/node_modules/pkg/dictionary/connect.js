'use strict';

module.exports = {
  pkg: {
    scripts: ['lib/middleware/*.js'],
    assets: [
      'lib/public/**/*', // for connect@2.3
    ],
  },
};
