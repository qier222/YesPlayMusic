'use strict';

module.exports = {
  pkg: {
    assets: [
      'template.js', // for 2.1.0
    ],
    patches: {
      'index.js': [
        "var rfile = require('rfile');",
        'var rfile = function(f) { ' +
          "require('fs').readFileSync(" + // for 2.1.0
          'require.resolve(f)' +
          '); ' +
          '};',
      ],
    },
  },
};
