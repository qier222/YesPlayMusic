'use strict';

module.exports = {
  pkg: {
    scripts: ['lib/*.js'],
    deployFiles: [
      ['build/Release', 'sharp/build/Release', 'directory'],
      ['vendor/lib', 'sharp/vendor/lib', 'directory'],
    ],
  },
};
